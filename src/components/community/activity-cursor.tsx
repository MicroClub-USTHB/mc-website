"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type Easing,
} from "motion/react"

import type { CommunityActivity } from "@/const/community"
import { EASE_OUT_QUART } from "@/lib/easing"

/** Icon position from the pointer tip, as in Figma: just under the cursor arrow. */
const OFFSET = { x: 4, y: 22 }
/** Tilt of the hidden icon, so it rotates upright as it pops in. */
const REST_ROTATION = -30

/** GSAP `elastic.out(1, 0.4)`: overshoots and settles like a spring. */
const elasticOut: Easing = (t) =>
  t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin(((t - 0.1) * 2 * Math.PI) / 0.4) + 1

/** Trails the pointer: each move restarts a short tween toward it (GSAP `quickTo`). */
const FOLLOW_TRANSITION = { duration: 0.3, ease: EASE_OUT_QUART }
const POP_IN_TRANSITION = { duration: 1, ease: elasticOut }
const POP_OUT_TRANSITION = { duration: 0.15, ease: [0.37, 0, 0.63, 1] as const }

/**
 * Cursor bubble (ui.soralabs.studio/motion/cursor-bubble): while a row is hovered with a mouse,
 * its icon trails the pointer, popping in with an elastic scale and tilt, and shrinking back
 * when the pointer leaves the list. Moving to another row plays the full cycle, like moving
 * between two targets of the demo: the icon shrinks, swaps at zero size and pops in again.
 * Positions are Motion values and the icon swap is a DOM write (no React render per move).
 * Decorative and mouse-only; off with reduced motion.
 */
export function ActivityCursor({
  activities,
  index,
}: {
  activities: CommunityActivity[]
  /** Hovered row, `null` when the pointer is outside the list. */
  index: number | null
}) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(0)
  const rotate = useMotionValue(REST_ROTATION)
  const iconsRef = useRef<HTMLDivElement>(null)
  /** Icon currently drawn (the first one at mount); kept while it shrinks away. */
  const shown = useRef(0)
  /** Latest pointer target, recorded while hidden (no style writes) and applied on pop-in. */
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (reduceMotion) return

    function follow(event: PointerEvent) {
      if (event.pointerType !== "mouse") return
      const targetX = event.clientX + OFFSET.x
      const targetY = event.clientY + OFFSET.y
      target.current = { x: targetX, y: targetY }
      // Hidden: nothing to move; the pop-in jumps to the recorded target.
      if (scale.get() === 0) return
      animate(x, targetX, FOLLOW_TRANSITION)
      animate(y, targetY, FOLLOW_TRANSITION)
    }

    window.addEventListener("pointermove", follow, { passive: true })
    return () => window.removeEventListener("pointermove", follow)
  }, [reduceMotion, x, y, scale])

  useEffect(() => {
    if (reduceMotion) return
    let cancelled = false
    let controls: AnimationPlaybackControls[] = []

    function pop(visible: boolean) {
      const transition = visible ? POP_IN_TRANSITION : POP_OUT_TRANSITION
      controls = [
        animate(scale, visible ? 1 : 0, transition),
        animate(rotate, visible ? 0 : REST_ROTATION, transition),
      ]
      return Promise.all(controls)
    }

    function draw(icon: number) {
      shown.current = icon
      const icons = iconsRef.current?.children ?? []
      Array.from(
        icons,
        (el, i) => ((el as HTMLElement).style.visibility = i === icon ? "" : "hidden"),
      )
    }

    async function play() {
      if (index === null) return pop(false)
      // Another row while an icon is out: shrink it before swapping.
      if (index !== shown.current && scale.get() > 0) {
        await pop(false)
        if (cancelled) return
      }
      // Popping in from zero: start at the pointer instead of flying in.
      if (scale.get() === 0) {
        x.jump(target.current.x)
        y.jump(target.current.y)
      }
      draw(index)
      return pop(true)
    }

    play()
    return () => {
      cancelled = true
      for (const control of controls) control.stop()
    }
  }, [index, reduceMotion, scale, rotate, x, y])

  if (reduceMotion) return null

  return (
    <motion.div
      ref={iconsRef}
      aria-hidden
      style={{ x, y, scale, rotate }}
      className="pointer-events-none fixed top-0 left-0 z-30 origin-top-left [@media(any-hover:none)]:hidden"
    >
      {activities.map((activity, i) => (
        <Image
          key={activity.title}
          src={activity.icon.src}
          alt=""
          width={activity.icon.width}
          height={activity.icon.height}
          loading="eager"
          // Initial state only: `draw` swaps the icons afterwards.
          style={i === 0 ? undefined : { visibility: "hidden" }}
          className="absolute top-0 left-0 max-w-none"
        />
      ))}
    </motion.div>
  )
}
