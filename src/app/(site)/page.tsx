import { About } from "@/components/sections/home/about"
import { ClubSections } from "@/components/sections/home/club-sections"
import { Community } from "@/components/sections/home/community"
import { Contact } from "@/components/sections/home/contact"
import { Departments } from "@/components/sections/home/departments"
import { FeaturedEvents } from "@/components/sections/home/featured-events"
import { FeaturedProjects } from "@/components/sections/home/featured-projects"
import { Hero } from "@/components/sections/home/hero"
import { MicroBot } from "@/components/sections/home/microbot"
import { Statistics } from "@/components/sections/home/statistics"
import { TrustedBy } from "@/components/sections/home/trusted-by"

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
