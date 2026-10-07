"use client"

import { useEffect, useRef, useState } from "react"
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react"

import { EASE_IN_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/**
 * Endless horizontal loop (Figma "moving in an endless loop"). The track holds the row twice and
 * slides by half its width, so the loop is seamless as long as one copy is wider than the screen
 * (`TrustedBy` repeats the partners for that). Driven by Motion with a full `transform` string,
 * so it runs on the compositor. It eases to a stop while hovered (logos are easier to look at),
 * pauses offscreen, and stays still with reduced motion (the row then scrolls by hand).
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
  const [hovered, setHovered] = useState(false)
  const speed = useMotionValue(1)
  const loop = useRef<AnimationPlaybackControls>(null)

  useEffect(() => {
    if (!track.current || reduceMotion) return
    const animation = animate(
      track.current,
      { transform: ["translateX(0%)", "translateX(-50%)"] },
      { duration: itemCount * secondsPerItem, ease: "linear", repeat: Infinity },
    )
    animation.speed = speed.get()
    loop.current = animation
    const unsubscribe = speed.on("change", (value) => {
      animation.speed = value
    })
    return () => {
      unsubscribe()
      animation.stop()
      loop.current = null
    }
  }, [itemCount, secondsPerItem, reduceMotion, speed])

  useEffect(() => {
    if (inView) loop.current?.play()
    else loop.current?.pause()
  }, [inView])

  useEffect(() => {
    const animation = animate(speed, hovered ? 0 : 1, { duration: 0.5, ease: EASE_IN_OUT_QUART })
    return () => animation.stop()
  }, [hovered, speed])

  return (
    <div
      ref={viewport}
      onPointerEnter={(event) => event.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn("overflow-hidden motion-reduce:overflow-x-auto", className)}
    >
      <div ref={track} className="flex w-max will-change-transform">
        <ul className="flex gap-(--logo-gap) pr-(--logo-gap)">{children}</ul>
        <ul aria-hidden className="flex gap-(--logo-gap) pr-(--logo-gap)">
          {children}
        </ul>
      </div>
    </div>
  )
}
