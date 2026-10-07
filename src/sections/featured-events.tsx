import { ActiveEventProvider } from "@/components/featured-events/active-event"
import { CursorBadge } from "@/components/featured-events/cursor-badge"
import { EventCategoryLabel } from "@/components/featured-events/event-category-label"
import { EventChain } from "@/components/featured-events/event-chain"
import { EventDialogProvider } from "@/components/featured-events/event-dialog"
import { EventList } from "@/components/featured-events/event-list"
import { SpotlightPanel } from "@/components/featured-events/spotlight-panel"
import { SectionContainer } from "@/components/shared/section-container"
import { FEATURED_EVENTS } from "@/const/featured-events"

/**
 * Full-viewport section: title, diagonal chain of event photos (see `EventChain`), the event
 * list and the active event's category. Hovering a photo makes its event active, clicking it opens
 * the event card (see `EventDialogProvider`).
 *
 * Two modes: with a mouse or trackpad (`any-pointer: fine`), from `md` and as long as the event
 * list fits (17 rows × 20px min + 40px padding + ~100px top ≈ 30rem tall; recompute if the
 * number of events changes a lot), the Figma desktop (event list, category label, cursor badge).
 * Otherwise the panel at the bottom: hover-driven on desktop, spotlight + "View event" on touch.
 */
export function FeaturedEvents() {
  return (
    <SectionContainer
      id="featured-events"
      bleed
      theme="dark"
      aria-label="Featured Events"
      className="relative h-svh min-h-80 cursor-[url(/EventsHub/cursor/Cursor.svg)_2_1,crosshair] overflow-hidden"
    >
      <ActiveEventProvider>
        <EventDialogProvider events={FEATURED_EVENTS}>
          <div className="pointer-events-none relative z-10 mx-auto max-w-site px-4 pt-24 sm:px-6 lg:px-20 [@media(max-height:520px)]:pt-20">
            <header>
              <h2
                id="featured-events-title"
                className="header-lg text-primary uppercase lg:w-93.5 lg:header-xl [@media(max-height:520px)]:header-md"
              >
                EVENT HUB
              </h2>
            </header>
          </div>
          <EventChain events={FEATURED_EVENTS} />
          {/* Figma positions on the 1440px frame, kept within the site width on larger screens. */}
          <div className="pointer-events-none absolute inset-0 mx-auto hidden max-w-site any-pointer-fine:md:[@media(min-height:30rem)]:block">
            <EventCategoryLabel
              events={FEATURED_EVENTS}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap lg:top-10 2xl:top-28"
            />
            <EventList
              events={FEATURED_EVENTS}
              className="absolute right-0 bottom-0 isolate before:absolute before:-inset-x-10 before:-inset-y-8 before:-z-10 before:bg-[radial-gradient(closest-side,var(--background)_55%,transparent)] lg:px-20 lg:py-5"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-background via-background/85 to-transparent pt-20 any-pointer-fine:md:[@media(min-height:30rem)]:hidden">
            <SpotlightPanel
              events={FEATURED_EVENTS}
              className="mx-auto max-w-site px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-20"
            />
          </div>
          <CursorBadge events={FEATURED_EVENTS} />
        </EventDialogProvider>
      </ActiveEventProvider>
    </SectionContainer>
  )
}
