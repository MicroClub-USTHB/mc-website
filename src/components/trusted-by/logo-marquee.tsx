"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion, type AnimationPlaybackControls } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Endless horizontal loop (Figma "moving in an endless loop"). The track holds the row twice and
 * slides by half its width, so the loop is seamless as long as one copy is wider than the screen
 * (`TrustedBy` repeats the partners for that). Driven by Motion with a full `transform` string,
 * so it runs on the compositor. It never stops while on screen, hover included; it only pauses
 * offscreen (nothing to see, nothing to compute) and stays still with reduced motion (the row
 * then scrolls by hand).
 */
export function LogoMarquee({
  secondsPerItem,
  itemCount,
  className,
  children,
}: {
  /** Time for one item to scroll by: sets the speed whatever the number of items. */
  secondsPerItem: number
  itemCount: number
  className?: string
  /** The row's items, rendered twice (the second copy is hidden from assistive tech). */
  children: React.ReactNode
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const inView = useInView(viewport)
  const reduceMotion = useReducedMotion()
  const loop = useRef<AnimationPlaybackControls>(null)

  useEffect(() => {
    if (!track.current || reduceMotion) return
    const animation = animate(
      track.current,
      { transform: ["translateX(0%)", "translateX(-50%)"] },
      { duration: itemCount * secondsPerItem, ease: "linear", repeat: Infinity },
    )
    loop.current = animation
    return () => {
      animation.stop()
      loop.current = null
    }
  }, [itemCount, secondsPerItem, reduceMotion])

  useEffect(() => {
    if (inView) loop.current?.play()
    else loop.current?.pause()
  }, [inView])

  return (
    <div ref={viewport} className={cn("overflow-hidden motion-reduce:overflow-x-auto", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        <ul className="flex gap-(--logo-gap) pr-(--logo-gap)">{children}</ul>
        <ul aria-hidden className="flex gap-(--logo-gap) pr-(--logo-gap)">
          {children}
        </ul>
      </div>
    </div>
  )
}
