import { DepartmentArt } from "@/components/departments/department-art"
import { DepartmentCard } from "@/components/departments/department-card"
import { DepartmentPanels } from "@/components/departments/department-panels"
import { JsonLd } from "@/components/shared/json-ld"
import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"
import { DEPARTMENTS } from "@/const/departments"

/** schema.org Organization listing Micro Club's departments. */
const DEPARTMENTS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  department: DEPARTMENTS.map((department) => ({
    "@type": "Organization",
    name: `${siteConfig.name} ${department.name}`,
    slogan: department.tagline,
    description: department.description,
    ...(department.link && { sameAs: department.link.href }),
  })),
}

/**
 * Our Departments (Figma): a row of department strips that widen into cards, an accordion on
 * narrow screens. Server Component: every name, description, link and illustration is in the
 * server-rendered HTML (plus JSON-LD); only the open state is a client island.
 */
export function Departments() {
  return (
    <SectionContainer
      id="departments"
      aria-labelledby="departments-title"
      bleed
      // One screen tall from `lg`: anchors land flush with the top.
      className="lg:scroll-mt-0"
    >
      <JsonLd data={DEPARTMENTS_JSON_LD} />

      {/*
        Pinned for 20% of a screen once its bottom reaches the bottom of the screen (a short hold,
        like Our Sections): the content sticks to the bottom while this spacer's height scrolls by,
        shifted up over it. Pure CSS, so it holds at any height (the accordion taller than the
        screen, opened or not), and hands over to the `SectionStack` cover right as it ends.
      */}
      <div aria-hidden className="h-[20svh]" />

      {/*
        From `lg`, one screen tall: the panel row takes the height the header leaves (a grid row:
        a flex item would not size its container query units), between a legible floor and its
        828px design height, and scales its cards and art to it. Laptops (`low`) put the intro
        beside the title to leave the panels more room.
      */}
      <div className="sticky bottom-0 mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:grid lg:min-h-svh lg:grid-rows-[auto_minmax(30rem,1fr)] lg:px-20 lg:pt-[min(6rem,10svh)] lg:pb-[min(2.5rem,5svh)]">
        <header className="flex flex-col gap-2 low:flex-row low:items-end low:justify-between low:gap-12">
          <h2
            id="departments-title"
            className="header-md text-primary uppercase sm:header-lg lg:header-xl short:header-md low:shrink-0 low:header-lg"
          >
            Our Departments
          </h2>
          <p className="max-w-297 paragraph-lg text-muted-foreground lg:paragraph-xl low:max-w-xl low:paragraph-md">
            Behind every successful event, project, and achievement, there’s a team of motivated
            members working through different departments. Discover the teams behind.
          </p>
        </header>

        <div className="mt-10 lg:[container-type:size] lg:mt-[min(2.5rem,4svh)] lg:max-h-207">
          <DepartmentPanels
            panels={DEPARTMENTS.map((department) => ({
              id: department.id,
              tab: department.tab,
              name: department.name,
              card: <DepartmentCard key={department.id} department={department} />,
              illustration: <DepartmentArt key={department.id} id={department.id} />,
            }))}
          />
        </div>
      </div>
    </SectionContainer>
  )
}
