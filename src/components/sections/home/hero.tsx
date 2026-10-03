import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"

export function Hero() {
  return (
    <SectionContainer id="hero" className="flex min-h-svh items-center">
      {/* TODO: hero visual, tagline and primary call to action. */}
      <h1 className="header-lg font-bold sm:header-xl">{siteConfig.name}</h1>
    </SectionContainer>
  )
}
