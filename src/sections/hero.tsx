import { HeroCanvas } from "@/components/hero/hero-canvas"
import { HeroItems } from "@/components/hero/hero-items"
import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"

/**
 * Hero (Figma "HERO SECTION"): one screen of an explorable whiteboard (see `HeroCanvas`), under the
 * menu and the MicroBot launcher. Its elements are placed from `HERO_ITEMS` in
 * `src/const/hero.ts`. The page title stays in the HTML for search engines and
 * screen readers.
 */
export function Hero() {
  return (
    <SectionContainer id="hero" aria-labelledby="hero-title" bleed className="h-svh scroll-mt-0">
      <h1 id="hero-title" className="sr-only">
        {siteConfig.name}: {siteConfig.description}
      </h1>
      <HeroCanvas>
        <HeroItems />
      </HeroCanvas>
    </SectionContainer>
  )
}
