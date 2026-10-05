import { Accordion } from "@base-ui/react/accordion"

import { ProjectItem } from "@/components/featured-projects/project-item"
import { SectionContainer } from "@/components/shared/section-container"
import { PROJECT_CATEGORIES } from "@/const/projects"

const PROJECT_COUNT = PROJECT_CATEGORIES.reduce((count, { projects }) => count + projects.length, 0)

/**
 * Hall of Projects (Figma): projects grouped by section, one expandable row per project.
 * Server Component: every name, tag, year, description and link is in the server-rendered HTML;
 * only the accordion behaviour runs on the client (Base UI).
 */
export function FeaturedProjects() {
  return (
    <SectionContainer id="featured-projects" aria-labelledby="featured-projects-title" bleed>
      <div className="mx-auto max-w-site px-4 pt-24 pb-20 sm:px-6 lg:px-20">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-[104px]">
          <h2
            id="featured-projects-title"
            className="header-lg text-primary uppercase lg:w-[374px] lg:header-xl"
          >
            Hall of Projects
          </h2>
          <p className="header-sm text-muted-foreground lg:py-[13px] lg:header-lg">
            {PROJECT_COUNT} projects
          </p>
        </header>

        <Accordion.Root className="flex flex-col gap-20 lg:gap-[140px]">
          {PROJECT_CATEGORIES.map((category) => (
            <section
              key={category.name}
              aria-label={category.name}
              className="flex flex-col gap-8 border-t border-border pt-8 lg:flex-row lg:items-start lg:justify-between lg:pt-[52px]"
            >
              <h3 className="header-xs font-semibold text-foreground">{category.name}</h3>
              <div className="lg:w-[908px]">
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
