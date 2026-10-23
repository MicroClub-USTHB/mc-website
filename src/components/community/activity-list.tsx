"use client"

import { useEffect, useRef, useState } from "react"

import { ActivityCursor } from "@/components/community/activity-cursor"
import { ActivityItem } from "@/components/community/activity-item"
import type { CommunityActivity } from "@/const/community"

/** How long the rows take to resize (`duration-400` on the rows). */
const RESIZE_MS = 400

/**
 * Activities accordion: at most one row open, all closed by default. With a mouse the hovered row
 * opens and every row closes again when the pointer leaves the list; on touch screens (no hover)
 * and with the keyboard, tapping / activating a title toggles its row. The hovered row's icon
 * follows the cursor.
 *
 * The rows resize with a CSS height transition, between their closed height and their measured
 * open one (see `ActivityItem`): the browser interpolates it without any script per frame, and a
 * change mid-way (the pointer sweeping across rows) carries on from where the rows are.
 */
export function ActivityList({ activities }: { activities: CommunityActivity[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  /** Rows are resizing: a still pointer they slide under does not count as a hover. */
  const resizing = useRef(false)
  const resizeTimer = useRef(0)

  function open(index: number | null) {
    if (index === active) return
    resizing.current = true
    window.clearTimeout(resizeTimer.current)
    resizeTimer.current = window.setTimeout(() => (resizing.current = false), RESIZE_MS)
    setActive(index)
  }

  useEffect(() => () => window.clearTimeout(resizeTimer.current), [])

  return (
    <>
      <ol
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return
          setHovered(null)
          open(null)
        }}
        className="mt-10 lg:mt-15.75 lg:flex lg:flex-col lg:gap-5"
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
              if (!resizing.current) open(index)
            }}
          />
        ))}
      </ol>
      <ActivityCursor activities={activities} index={hovered} />
    </>
  )
}
