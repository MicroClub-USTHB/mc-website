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
    <SectionContainer id="departments" aria-labelledby="departments-title" bleed>
      <JsonLd data={DEPARTMENTS_JSON_LD} />

      <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20 lg:pb-22">
        <header className="flex flex-col gap-2">
          <h2
            id="departments-title"
            className="header-md text-primary uppercase md:header-lg lg:header-xl"
          >
            Our Departments
          </h2>
          <p className="max-w-297 paragraph-lg text-muted-foreground lg:paragraph-xl">
            Behind every successful event, project, and achievement, there’s a team of motivated
            members working through different departments. Discover the teams behind.
          </p>
        </header>

        <div className="mt-10 lg:mt-14">
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
