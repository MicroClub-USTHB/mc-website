"use client"

import { useEffect, useRef } from "react"
import type { VirtualScrollData } from "lenis"
import { ReactLenis, type LenisRef } from "lenis/react"
import { cancelFrame, frame, MotionConfig } from "motion/react"

/** Below this speed (px/s), the page eases into its end as usual (and the footer tiles stay). */
const HARD_STOP_MIN_SPEED = 50
/** Longest hard stop (s), so a big wheel step on a slow scroll does not crawl to the end. */
const HARD_STOP_MAX_DURATION = 0.5

const linear = (t: number) => t

/**
 * Lenis smooth scroll driven by Motion's frame loop, so scroll and animations share one rAF.
 * `anchors` makes `/#section` links scroll smoothly. Motion respects the OS "reduce motion" setting.
 *
 * Page end: Lenis eases toward where the wheel points, so it slows down into the bottom of the
 * page. When a wheel step would reach the bottom, the page keeps its speed instead and stops dead
 * there, so it lands with a bump, which knocks the footer tiles down (see `FallingTiles`).
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  /** Runs before Lenis handles each wheel event: `false` takes over the hard stop. */
  function virtualScroll({ deltaY, event }: VirtualScrollData) {
    const lenis = lenisRef.current?.lenis
    if (!lenis || !event.type.includes("wheel") || deltaY <= 0) return true
    if (lenis.prefersReducedMotion || event.ctrlKey) return true
    const { targetScroll, animatedScroll, limit, options } = lenis
    // Only the wheel step that brings the target to the bottom.
    if (targetScroll >= limit || targetScroll + deltaY * options.wheelMultiplier < limit)
      return true

    // Lenis's speed: it closes `lerp` of the gap to its target each 60th of a second, and the gap
    // swings between its size before and after each wheel step, so take the middle.
    const distance = limit - animatedScroll
    const gap = (targetScroll - animatedScroll + distance) / 2
    const speed = Math.max(gap * options.lerp * 60, distance / HARD_STOP_MAX_DURATION)
    if (speed < HARD_STOP_MIN_SPEED) return true

    if (event.cancelable) event.preventDefault()
    // Not programmatic: the target becomes the bottom, so the next wheel steps leave this alone.
    lenis.scrollTo(limit, { programmatic: false, duration: distance / speed, easing: linear })
    return false
  }

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true, virtualScroll }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  )
}
