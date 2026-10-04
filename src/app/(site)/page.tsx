import { About } from "@/sections/about"
import { ClubSections } from "@/sections/club-sections"
import { Community } from "@/sections/community"
import { Contact } from "@/sections/contact"
import { Departments } from "@/sections/departments"
import { FeaturedEvents } from "@/sections/featured-events"
import { FeaturedProjects } from "@/sections/featured-projects"
import { Hero } from "@/sections/hero"
import { MicroBot } from "@/sections/microbot"
import { Statistics } from "@/sections/statistics"
import { TrustedBy } from "@/sections/trusted-by"

// Section order is intentional: keep it in sync with `homeSections` in src/config/site.ts.
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Statistics />
      <ClubSections />
      <FeaturedProjects />
      <Departments />
      <FeaturedEvents />
      <TrustedBy />
      <Community />
      <MicroBot />
      <Contact />
    </>
  )
}
