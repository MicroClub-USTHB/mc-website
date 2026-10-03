import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"

export function HeroSection() {
  return (
    <SectionContainer id="hero" className="flex min-h-svh items-center">
      {/* TODO: hero visual, tagline and primary call to action. */}
      <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-7xl">
        {siteConfig.name}
      </h1>
    </SectionContainer>
  )
}
