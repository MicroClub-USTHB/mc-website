import { AboutSection } from "@/components/sections/home/about-section"
import { ClubSectionsSection } from "@/components/sections/home/club-sections-section"
import { CommunitySection } from "@/components/sections/home/community-section"
import { ContactSection } from "@/components/sections/home/contact-section"
import { DepartmentsSection } from "@/components/sections/home/departments-section"
import { FeaturedEventsSection } from "@/components/sections/home/featured-events-section"
import { FeaturedProjectsSection } from "@/components/sections/home/featured-projects-section"
import { HeroSection } from "@/components/sections/home/hero-section"
import { MicroBotSection } from "@/components/sections/home/microbot-section"
import { StatisticsSection } from "@/components/sections/home/statistics-section"
import { TrustedBySection } from "@/components/sections/home/trusted-by-section"

// Section order is intentional: keep it in sync with `homeSections` in src/config/site.ts.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatisticsSection />
      <ClubSectionsSection />
      <FeaturedProjectsSection />
      <DepartmentsSection />
      <FeaturedEventsSection />
      <TrustedBySection />
      <CommunitySection />
      <MicroBotSection />
      <ContactSection />
    </>
  )
}
