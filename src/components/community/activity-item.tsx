"use client"

import { useEffect, useRef } from "react"

import type { CommunityActivity } from "@/const/community"
import { cn } from "@/lib/utils"

/**
 * One activity row (Figma "MC Community"): number and title. The active row is highlighted and
 * shows its description; the others are cut to a fixed height that only reveals the top of the
 * title. The title button stretches over the whole row (`after:inset-0`).
 *
 * Its open height is the height of its content (`--open-h`), measured by a ResizeObserver only
 * when that content resizes, so the row can transition between two lengths in CSS.
 */
export function ActivityItem({
  activity,
  index,
  active,
  onToggle,
  onHover,
}: {
  activity: CommunityActivity
  index: number
  active: boolean
  onToggle: (event: React.MouseEvent) => void
  onHover: (event: React.PointerEvent) => void
}) {
  const rowRef = useRef<HTMLLIElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const panelId = `community-activity-${index}`

  useEffect(() => {
    const row = rowRef.current
    const content = contentRef.current
    if (!row || !content) return
    const observer = new ResizeObserver(([entry]) => {
      // The content plus the row's bottom border.
      row.style.setProperty("--open-h", `${entry.borderBoxSize[0].blockSize + 1}px`)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])
  const tone = active ? "text-accent-foreground" : "text-muted-foreground"

  return (
    <li
      ref={rowRef}
      onPointerMove={onHover}
      className={cn(
        "relative grid grid-cols-[3rem_1fr] items-start overflow-hidden border-b border-border sm:grid-cols-[8rem_1fr] lg:grid-cols-[12.5rem_1fr]",
        "transition-[height] duration-400 ease-out-quart motion-reduce:transition-none",
        active ? "h-(--open-h,auto)" : "h-10 sm:h-11 lg:h-13.25",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pt-2 header-xs font-medium tabular-nums transition-colors duration-300 sm:pt-2.5 sm:header-sm lg:pt-0 lg:header-md",
          tone,
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div ref={contentRef} className="min-w-0">
        <h3 className="pt-2 header-sm font-medium sm:header-md lg:pt-0 lg:header-lg">
          <button
            type="button"
            aria-expanded={active}
            aria-controls={panelId}
            onClick={onToggle}
            className={cn(
              "cursor-default text-left transition-colors duration-300 outline-none after:absolute after:inset-0",
              "focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-8",
              tone,
            )}
          >
            {activity.title}
          </button>
        </h3>

        <div
          id={panelId}
          inert={!active}
          className={cn(
            "pt-4 pb-4 transition-[opacity,translate] duration-400 ease-out-quart lg:pb-3.75",
            !active && "translate-y-3 opacity-0",
          )}
        >
          <p className="paragraph-md font-medium text-foreground lg:max-w-262 lg:paragraph-lg">
            {activity.description}
          </p>
        </div>
      </div>
    </li>
  )
}
