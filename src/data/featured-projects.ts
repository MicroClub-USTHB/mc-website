export type Project = {
  slug: string
  name: string
  description: string
}

/** Projects highlighted on the landing page (2-3 max). Full list lives on /projects. */
export const featuredProjects: Project[] = [
  {
    slug: "mcoli-ui",
    name: "Mcoli-UI",
    description: "TODO: short description.",
  },
  {
    slug: "maicro",
    name: "mAIcro",
    description: "TODO: short description.",
  },
]
