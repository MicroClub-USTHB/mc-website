"use client"

import { useActiveEvent } from "@/components/featured-events/active-event"
import type { FeaturedEvent } from "@/const/featured-events"
import { cn } from "@/lib/utils"

/**
 * Figma event list: every event name, right-aligned, dimmed; the hovered slice's event lights up
 * with a bar on its right (none while no slice is hovered). It is the readable counterpart of the
 * decorative chain. Rows are 28px as in Figma, and only get tighter (down to 20px) on short screens
 * so the list keeps fitting; the active bar follows the row height.
 */
export function EventList({
  events,
  className,
}: {
  events: Pick<FeaturedEvent, "id" | "name">[]
  className?: string
}) {
  const { activeId } = useActiveEvent()

  return (
    <ul aria-label="Events" className={cn("flex flex-col items-end", className)}>
      {events.map((event) => (
        <li
          key={event.id}
          data-active={event.id === activeId || undefined}
          className={cn(
            "relative pr-3 paragraph-sm leading-[clamp(1.25rem,3.1svh,1.75rem)] text-muted-foreground transition-colors duration-300 ease-out-quart data-active:text-primary",
            "after:absolute after:top-1/2 after:right-0 after:h-[min(1.375rem,80%)] after:w-0.5 after:-translate-y-1/2 after:bg-primary after:opacity-0 after:transition-opacity after:duration-300 data-active:after:opacity-100",
          )}
        >
          {event.name}
        </li>
      ))}
    </ul>
  )
}
