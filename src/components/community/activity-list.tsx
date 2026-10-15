"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { animate, useReducedMotion } from "motion/react"

import { ActivityCursor } from "@/components/community/activity-cursor"
import { ActivityItem } from "@/components/community/activity-item"
import type { CommunityActivity } from "@/const/community"
import { EASE_OUT_QUART } from "@/lib/easing"

const RESIZE_TRANSITION = { duration: 0.4, ease: EASE_OUT_QUART }

/**
 * Activities accordion: at most one row open, all closed by default. With a mouse the hovered row
 * opens and every row closes again when the pointer leaves the list; on touch screens (no hover)
 * and with the keyboard, tapping / activating a title toggles its row. The hovered row's icon
 * follows the cursor.
 *
 * The open and closed heights come from CSS (responsive); on each change the rows animate from
 * the heights measured just before it to their new ones, then hand control back to CSS.
 */
export function ActivityList({ activities }: { activities: CommunityActivity[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  /** Row heights measured right before the last change, the animation start points. */
  const fromHeights = useRef<number[]>([])
  const animating = useRef(false)
  const reduceMotion = useReducedMotion()

  function open(index: number | null) {
    if (index === active) return
    const rows = listRef.current?.children
    fromHeights.current = rows ? Array.from(rows, (row) => (row as HTMLElement).offsetHeight) : []
    setActive(index)
  }

  useLayoutEffect(() => {
    const rows = listRef.current
      ? Array.from(listRef.current.children as HTMLCollectionOf<HTMLElement>)
      : []
    const from = fromHeights.current
    fromHeights.current = []

    // Drop the heights left by an interrupted animation, so the targets come from CSS.
    for (const row of rows) row.style.height = ""
    if (reduceMotion || from.length !== rows.length) return

    const to = rows.map((row) => row.offsetHeight)

    let cancelled = false
    animating.current = true
    const controls = rows.map((row, i) =>
      animate(row, { height: [`${from[i]}px`, `${to[i]}px`] }, RESIZE_TRANSITION),
    )
    Promise.all(controls).then(() => {
      if (cancelled) return
      for (const row of rows) row.style.height = ""
      animating.current = false
    })

    return () => {
      cancelled = true
      animating.current = false
      for (const control of controls) control.stop()
    }
  }, [active, reduceMotion])

  return (
    <>
      <ol
        ref={listRef}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return
          setHovered(null)
          open(null)
        }}
        className="mt-10"
      >
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.title}
            activity={activity}
            index={index}
            active={index === active}
            onToggle={(event) => {
              // A mouse click lands on the row its hover already opened: keep it open.
              const mouse = (event.nativeEvent as PointerEvent).pointerType === "mouse"
              open(mouse || index !== active ? index : null)
            }}
            onHover={(event) => {
              if (event.pointerType !== "mouse") return
              setHovered(index)
              // Not while rows move under a still pointer.
              if (!animating.current) open(index)
            }}
          />
        ))}
      </ol>
      <ActivityCursor activities={activities} index={hovered} />
    </>
  )
}
