import { SectionStack } from "@/components/shared/section-stack"
import { About } from "@/sections/about"
import { ClubSections } from "@/sections/club-sections"
import { Community } from "@/sections/community"
import { Contact } from "@/sections/contact"
import { Departments } from "@/sections/departments"
import { FeaturedEvents } from "@/sections/featured-events"
import { FeaturedProjects } from "@/sections/featured-projects"
import { Hero } from "@/sections/hero"
import { Statistics } from "@/sections/statistics"
import { TrustedBy } from "@/sections/trusted-by"

// Section order is intentional: keep it in sync with `homeSections` in src/config/site.ts.
// `SectionStack`: the next section scrolls over the previous one where the theme changes.
export default function HomePage() {
  return (
    <>
      <SectionStack>
        <Hero />
        <About />
      </SectionStack>
      <Statistics />
      <SectionStack>
        <ClubSections />
        <FeaturedProjects />
      </SectionStack>
      <SectionStack>
        <Departments />
        <SectionStack>
          <FeaturedEvents />
          {/* Sponsors alone is shorter than the screen: the rest of the page covers with it. */}
          <TrustedBy />
          <Community />
          <Contact />
        </SectionStack>
      </SectionStack>
    </>
  )
}
