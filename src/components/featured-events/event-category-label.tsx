"use client"

import { useActiveEvent } from "@/components/featured-events/active-event"
import { EVENT_CATEGORY_LABELS, type FeaturedEvent } from "@/const/featured-events"
import { cn } from "@/lib/utils"

/**
 * Category of the hovered event, e.g. "{External Event}". It fades out when no slice is hovered,
 * keeping the last category's text while it fades.
 */
export function EventCategoryLabel({
  events,
  className,
}: {
  events: Pick<FeaturedEvent, "id" | "category">[]
  className?: string
}) {
  const { activeId, lastId } = useActiveEvent()
  const shown = events.find((event) => event.id === lastId)

  return (
    <p
      data-active={activeId !== null || undefined}
      className={cn(
        "paragraph-sm text-muted-foreground opacity-0 transition-opacity duration-300 ease-out-quart data-active:opacity-100",
        className,
      )}
    >
      {shown && `{${EVENT_CATEGORY_LABELS[shown.category]}}`}
    </p>
  )
}
