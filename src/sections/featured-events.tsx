import { ActiveEventProvider } from "@/components/featured-events/active-event"
import { CursorBadge } from "@/components/featured-events/cursor-badge"
import { EventCategoryLabel } from "@/components/featured-events/event-category-label"
import { EventChain } from "@/components/featured-events/event-chain"
import { EventList } from "@/components/featured-events/event-list"
import { SectionContainer } from "@/components/shared/section-container"
import { FEATURED_EVENTS } from "@/const/featured-events"

/**
 * Full-viewport section: title, diagonal chain of event photos (see `EventChain`), the event
 * list and the active event's category. Hovering a photo makes its event active.
 */
export function FeaturedEvents() {
  return (
    <SectionContainer
      id="featured-events"
      bleed
      theme="dark"
      aria-label="Featured Events"
      className="relative h-svh min-h-screen overflow-hidden cursor-[url(/EventsHub/cursor/Cursor.svg)_2_1,crosshair]"
    >
      <ActiveEventProvider>
        <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20">
          <header >
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
          <EventCategoryLabel events={FEATURED_EVENTS} className="absolute lg:top-10 2xl:top-28 left-1/2 -translate-x-1/2 whitespace-nowrap" />
          <EventList
            events={FEATURED_EVENTS}
            className="absolute right-0 bottom-0 lg:px-20 lg:py-5  hidden md:flex"
          />
        </div>
        <CursorBadge events={FEATURED_EVENTS} />
      </ActiveEventProvider>
    </SectionContainer>
  )
}
