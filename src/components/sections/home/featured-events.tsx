import Link from "next/link"

import { SectionContainer } from "@/components/shared/section-container"
import { featuredEvents } from "@/data/featured-events"

/** 3-4 highlighted events + link to the full /events page. */
export function FeaturedEvents() {
  return (
    <SectionContainer id="featured-events" title="Featured Events">
      {/* TODO: event card design. */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredEvents.map((event) => (
          <li key={event.slug}>{event.name}</li>
        ))}
      </ul>
      {/* TODO: use the mcoli-ui button once available. */}
      <Link
        href="/events"
        className="mt-10 inline-flex h-10 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Explore more
      </Link>
    </SectionContainer>
  )
}
