import { EventChain } from "@/components/featured-events/event-chain"
import { SectionContainer } from "@/components/shared/section-container"
import { FEATURED_EVENTS } from "@/const/featured-events"

/** Full-viewport section: diagonal chain of event photos (see `EventChain`). */
export function FeaturedEvents() {
  return (
    <SectionContainer
      id="featured-events"
      bleed
      theme="dark"
      aria-label="Featured Events"
      className="relative h-svh min-h-160 overflow-hidden"
    >
      <EventChain events={FEATURED_EVENTS} />
    </SectionContainer>
  )
}
