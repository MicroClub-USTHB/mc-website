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
 *
 * Hover is tracked by hand: the tiles move under a still pointer, and the browser only updates
 * `:hover` when the pointer moves, which would leave the highlight on a tile that slid away. While
 * a mouse is over the row, each frame marks the tile really under it with `data-hovered` (see
 * `LogoCell` `trackedHover`).
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

  useEffect(() => {
    const box = viewport.current
    if (!box) return
    let pointer: { x: number; y: number } | null = null
    let hovered: Element | null = null
    let frame = 0

    function mark(tile: Element | null) {
      if (tile === hovered) return
      hovered?.removeAttribute("data-hovered")
      tile?.setAttribute("data-hovered", "")
      hovered = tile
    }

    function stop() {
      pointer = null
      cancelAnimationFrame(frame)
      mark(null)
    }

    function track() {
      if (!pointer) return
      const rect = box!.getBoundingClientRect()
      const inside =
        pointer.x >= rect.left &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom
      // Page scrolled away under a still pointer: stop until the next move.
      if (!inside) return stop()
      const tile = document.elementFromPoint(pointer.x, pointer.y)?.closest("li")
      mark(tile && box!.contains(tile) ? tile : null)
      frame = requestAnimationFrame(track)
    }

    function move(event: PointerEvent) {
      if (event.pointerType === "touch") return
      const idle = pointer === null
      pointer = { x: event.clientX, y: event.clientY }
      if (idle) frame = requestAnimationFrame(track)
    }

    box.addEventListener("pointermove", move)
    box.addEventListener("pointerleave", stop)
    return () => {
      box.removeEventListener("pointermove", move)
      box.removeEventListener("pointerleave", stop)
      stop()
    }
  }, [])

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
