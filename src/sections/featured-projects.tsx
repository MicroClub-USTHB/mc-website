import { Accordion } from "@base-ui/react/accordion"

import { ProjectItem } from "@/components/featured-projects/project-item"
import { JsonLd } from "@/components/shared/json-ld"
import { SectionContainer } from "@/components/shared/section-container"
import { siteConfig } from "@/config/site"
import { ORGANIZATION_URL, PROJECT_CATEGORIES } from "@/const/featured-projects"

const PROJECTS = PROJECT_CATEGORIES.flatMap((category) =>
  category.projects.map((project) => ({ ...project, category: category.name })),
)

/** schema.org ItemList describing every project, with Micro Club as creator. */
const PROJECTS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${siteConfig.name} Hall of Projects`,
  numberOfItems: PROJECTS.length,
  itemListElement: PROJECTS.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "CreativeWork",
      name: project.name,
      description: project.description,
      url: project.url,
      dateCreated: String(project.year),
      genre: project.category,
      keywords: project.tags.join(", "),
      creator: { "@type": "Organization", name: siteConfig.name, url: ORGANIZATION_URL },
    },
  })),
}

/**
 * Hall of Projects (Figma): projects grouped by section, one expandable row per project.
 * Server Component: every name, tag, year, description and link is in the server-rendered HTML
 * (plus JSON-LD); only the accordion behaviour runs on the client (Base UI).
 */
export function FeaturedProjects() {
  return (
    <SectionContainer id="featured-projects" aria-labelledby="featured-projects-title" bleed>
      <JsonLd data={PROJECTS_JSON_LD} />

      <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-26">
          <h2
            id="featured-projects-title"
            className="header-lg text-primary uppercase lg:w-93.5 lg:header-xl"
          >
            Hall of Projects
          </h2>
          <p className="header-sm text-muted-foreground lg:py-3.25 lg:header-lg">
            {PROJECTS.length} projects
          </p>
        </header>

        <Accordion.Root className="flex flex-col gap-20 lg:gap-35">
          {PROJECT_CATEGORIES.map((category) => (
            <section
              key={category.id}
              aria-labelledby={`projects-${category.id}`}
              className="flex flex-col gap-8 border-t border-border pt-8 lg:flex-row lg:items-start lg:justify-between lg:pt-13"
            >
              <h3
                id={`projects-${category.id}`}
                className="header-xs font-semibold text-foreground"
              >
                {category.name}
              </h3>
              <div className="lg:w-227">
                {category.projects.map((project) => (
                  <ProjectItem key={project.name} project={project} />
                ))}
              </div>
            </section>
          ))}
        </Accordion.Root>
      </div>
    </SectionContainer>
  )
}
