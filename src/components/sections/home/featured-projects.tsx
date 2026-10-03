import Link from "next/link"

import { SectionContainer } from "@/components/shared/section-container"
import { featuredProjects } from "@/data/featured-projects"

/** "What we've built": 2-3 highlighted projects + link to the full /projects page. */
export function FeaturedProjects() {
  return (
    <SectionContainer id="featured-projects" title="What We've Built">
      {/* TODO: project card design. */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((project) => (
          <li key={project.slug}>{project.name}</li>
        ))}
      </ul>
      {/* TODO: use the mcoli-ui button once available. */}
      <Link
        href="/projects"
        className="mt-10 inline-flex h-10 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Explore more
      </Link>
    </SectionContainer>
  )
}
