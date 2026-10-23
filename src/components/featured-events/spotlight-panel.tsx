"use client"

import { AnimatePresence, motion } from "motion/react"

import { useActiveEvent } from "@/components/featured-events/active-event"
import { useOpenEvent } from "@/components/featured-events/event-dialog"
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right"
import { McButton } from "@/components/ui/mc-button"
import { EVENT_CATEGORY_LABELS, type FeaturedEvent } from "@/const/featured-events"
import { EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/**
 * Compact counterpart of the event list, category label and cursor badge, for touch and short
 * screens: names the active event (category and name). On desktop it follows the hovered
 * slice (empty otherwise, a click on a slice opens the card); on touch screens it follows the
 * chain's spotlight and adds a "View event" button that opens the card.
 */
export function SpotlightPanel({
  events,
  className,
}: {
  events: Pick<FeaturedEvent, "id" | "name" | "category">[]
  className?: string
}) {
  // Desktop: only while a slice is hovered. Touch: the spotlight keeps an event active.
  const { activeId } = useActiveEvent()
  const openEvent = useOpenEvent()
  const event = events.find((event) => event.id === activeId)

  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {event && (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
            >
              <p className="paragraph-xs text-muted-foreground">
                {"{"}
                {EVENT_CATEGORY_LABELS[event.category]}
                {"}"}
              </p>
              <p className="truncate header-xs text-primary sm:header-sm">{event.name}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <McButton
        variant="primary"
        size="lg"
        icon="trailing"
        iconDefinition={<ArrowUpRightIcon />}
        disabled={!event}
        onClick={() => event && openEvent(event.id)}
        className="pointer-events-auto any-pointer-fine:hidden"
      >
        View event
        {event && <span className="sr-only">: {event.name}</span>}
      </McButton>
    </div>
  )
}
