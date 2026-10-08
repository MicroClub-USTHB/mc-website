"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue } from "motion/react"

import { useActiveEvent } from "@/components/featured-events/active-event"
import type { FeaturedEvent } from "@/const/featured-events"

/** Badge position from the pointer tip, as in Figma: right of the cursor arrow, slightly lower. */
const OFFSET = { x: 18, y: 6 }
/** Minimum gap to the viewport edges, so the badge never overflows the screen. */
const EDGE = 8

/**
 * Figma cursor badge: the hovered slice's event name, following the pointer. It tracks the
 * pointer with Motion values (no React render per move), shows while a slice is hovered (see
 * `ActiveEventProvider`) and fades out with the last name. Decorative: the event list already
 * gives the names to assistive tech.
 *
 * Keep it out of the chain box: its size containment would make `fixed` relative to the chain
 * instead of the viewport.
 */
export function CursorBadge({ events }: { events: Pick<FeaturedEvent, "id" | "name">[] }) {
  const { activeId, lastId } = useActiveEvent()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    function follow(event: PointerEvent) {
      if (event.pointerType === "touch") return
      const width = ref.current?.offsetWidth ?? 0
      const height = ref.current?.offsetHeight ?? 0
      x.set(Math.min(event.clientX + OFFSET.x, window.innerWidth - width - EDGE))
      y.set(Math.min(event.clientY + OFFSET.y, window.innerHeight - height - EDGE))
    }

    window.addEventListener("pointermove", follow, { passive: true })
    return () => window.removeEventListener("pointermove", follow)
  }, [x, y])

  const shown = events.find((event) => event.id === lastId)

  return (
    <motion.div
      ref={ref}
      aria-hidden
      data-active={activeId !== null || undefined}
      style={{ x, y }}
      className="pointer-events-none fixed top-0 left-0 z-40 bg-primary px-3.5 py-0.5 paragraph-xs font-medium whitespace-nowrap text-primary-foreground opacity-0 transition-opacity duration-150 ease-out-quart data-active:opacity-100 [@media(any-hover:none)]:hidden"
    >
      {shown?.name}
    </motion.div>
  )
}
