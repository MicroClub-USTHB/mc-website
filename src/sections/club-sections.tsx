import { ClubSectionDetails } from "@/components/club-sections/club-section-details"
import { ClubSectionsShowcase } from "@/components/club-sections/club-sections-showcase"
import { DevSectionIcon } from "@/components/club-sections/dev-section-icon"
import { GameDevSectionIcon } from "@/components/club-sections/game-dev-section-icon"
import { RoboticsSectionIcon } from "@/components/club-sections/robotics-section-icon"
import type { SectionIconProps } from "@/components/club-sections/svg-effects"
import { JsonLd } from "@/components/shared/json-ld"
import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"
import { CLUB_SECTIONS, type ClubSectionId } from "@/const/club-sections"

const ILLUSTRATIONS: Record<ClubSectionId, (props: SectionIconProps) => React.ReactNode> = {
  it: DevSectionIcon,
  "game-dev": GameDevSectionIcon,
  robotics: RoboticsSectionIcon,
}

/** schema.org Organization listing Micro Club's sections as departments. */
const SECTIONS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  department: CLUB_SECTIONS.map((section) => ({
    "@type": "Organization",
    name: `${siteConfig.name} ${section.title}`,
    description: section.description,
  })),
}

/**
 * Our Sections (Figma): the three section illustrations, hovered or opened in a carousel with
 * each section's details. Server Component: the illustrations, texts and links are in the
 * server-rendered HTML; only the hover / carousel state is a client island.
 */
export function ClubSections() {
  return (
    <SectionContainer
      id="club-sections"
      theme="dark"
      aria-labelledby="club-sections-title"
      bleed
      className="h-[111svh] overflow-x-clip"
    >
      <JsonLd data={SECTIONS_JSON_LD} />

      {/*
        Pinned one screen tall while the section scrolls by (a short hold, like Statistics): the
        illustrations shrink to fit. The top padding clears the fixed menu toggle, the bottom one
        follows the screen height.
      */}
      <div className="sticky top-0 mx-auto flex h-svh max-h-screen max-w-site flex-col px-4 pt-24 pb-[min(5.25rem,8svh)] sm:px-6 lg:px-20 lg:pt-20 short:py-[min(2.5rem,6svh)]">
        <ClubSectionsShowcase
          heading={
            <h2
              id="club-sections-title"
              className="header-md font-normal text-primary uppercase sm:header-lg lg:header-xl short:header-xs compact:header-xs"
            >
              <span className="lg:block short:inline">Our</span>{" "}
              <span className="lg:block short:inline">Sections</span>
            </h2>
          }
          sections={CLUB_SECTIONS.map((section) => {
            const Illustration = ILLUSTRATIONS[section.id]
            return {
              id: section.id,
              title: section.title,
              tag: section.tag,
              looks: { rest: <Illustration />, active: <Illustration active /> },
              details: <ClubSectionDetails section={section} />,
            }
          })}
        />
      </div>
    </SectionContainer>
  )
}
