import Link from "next/link"

import { SectionContainer } from "@/components/shared/section-container"
import { Button } from "@/components/ui/button"
import { featuredEvents } from "@/data/featured-events"

/** 3-4 highlighted events + link to the full /events page. */
export function FeaturedEventsSection() {
  return (
    <SectionContainer id="featured-events" title="Featured Events">
      {/* TODO: event card design. */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredEvents.map((event) => (
          <li key={event.slug}>{event.name}</li>
        ))}
      </ul>
      <Button className="mt-10" nativeButton={false} render={<Link href="/events" />}>
        Explore more
      </Button>
    </SectionContainer>
  )
}
