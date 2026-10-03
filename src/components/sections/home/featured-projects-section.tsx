import Link from "next/link"

import { SectionContainer } from "@/components/shared/section-container"
import { Button } from "@/components/ui/button"
import { featuredProjects } from "@/data/featured-projects"

/** "What we've built": 2-3 highlighted projects + link to the full /projects page. */
export function FeaturedProjectsSection() {
  return (
    <SectionContainer id="featured-projects" title="What We've Built">
      {/* TODO: project card design. */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((project) => (
          <li key={project.slug}>{project.name}</li>
        ))}
      </ul>
      <Button className="mt-10" nativeButton={false} render={<Link href="/projects" />}>
        Explore more
      </Button>
    </SectionContainer>
  )
}
