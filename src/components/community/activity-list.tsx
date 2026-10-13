"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { animate, useReducedMotion } from "motion/react"

import { ActivityItem } from "@/components/community/activity-item"
import type { CommunityActivity } from "@/const/community"
import { EASE_OUT_QUART } from "@/lib/easing"

const RESIZE_TRANSITION = { duration: 0.7, ease: EASE_OUT_QUART }

/**
 * Activities accordion: one row open at a time (the first by default), opened by hovering it
 * with a mouse or by clicking / tapping its title.
 *
 * The open and closed heights come from CSS (responsive); on each change the rows animate from
 * the heights measured just before it to their new ones, then hand control back to CSS.
 */
export function ActivityList({ activities }: { activities: CommunityActivity[] }) {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  /** Row heights measured right before the last change, the animation start points. */
  const fromHeights = useRef<number[]>([])
  const animating = useRef(false)
  const reduceMotion = useReducedMotion()

  function open(index: number) {
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
    <ol ref={listRef} className="mt-10">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.title}
          activity={activity}
          index={index}
          active={index === active}
          onOpen={() => open(index)}
          onHover={(event) => {
            // Mouse only, and not while rows move under a still pointer.
            if (event.pointerType === "mouse" && !animating.current) open(index)
          }}
        />
      ))}
    </ol>
  )
}
