import { ActiveEventProvider } from "@/components/featured-events/active-event"
import { CursorBadge } from "@/components/featured-events/cursor-badge"
import { EventCategoryLabel } from "@/components/featured-events/event-category-label"
import { EventChain } from "@/components/featured-events/event-chain"
import { EventDialogProvider } from "@/components/featured-events/event-dialog"
import { EventList } from "@/components/featured-events/event-list"
import { SectionContainer } from "@/components/shared/section-container"
import { FEATURED_EVENTS } from "@/const/featured-events"

/**
 * Full-viewport section: title, diagonal chain of event photos (see `EventChain`), the event
 * list and the active event's category. Hovering a photo makes its event active, clicking it opens
 * the event card (see `EventDialogProvider`).
 */
export function FeaturedEvents() {
  return (
    <SectionContainer
      id="featured-events"
      bleed
      theme="dark"
      aria-label="Featured Events"
      className="relative h-svh min-h-screen cursor-[url(/EventsHub/cursor/Cursor.svg)_2_1,crosshair] overflow-hidden"
    >
      <ActiveEventProvider>
        <EventDialogProvider events={FEATURED_EVENTS}>
          <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20">
            <header>
              <h2
                id="featured-events-title"
                className="header-lg text-primary uppercase lg:w-93.5 lg:header-xl"
              >
                EVENT HUB
              </h2>
            </header>
          </div>
          <EventChain events={FEATURED_EVENTS} />
          {/* Figma positions on the 1440px frame, kept within the site width on larger screens. */}
          <div className="pointer-events-none absolute inset-0 mx-auto max-w-site">
            <EventCategoryLabel
              events={FEATURED_EVENTS}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap lg:top-10 2xl:top-28"
            />
            <EventList
              events={FEATURED_EVENTS}
              className="absolute right-0 bottom-0 hidden md:flex lg:px-20 lg:py-5"
            />
          </div>
          <CursorBadge events={FEATURED_EVENTS} />
        </EventDialogProvider>
      </ActiveEventProvider>
    </SectionContainer>
  )
}
