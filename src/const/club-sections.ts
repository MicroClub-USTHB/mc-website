export type ClubSectionId = "it" | "game-dev" | "robotics"

export type ClubSection = {
  id: ClubSectionId
  /** Short label of the tag shown above the hovered illustration. */
  tag: string
  title: string
  description: string
  href: string
}

/** Micro Club's sections ("Our Sections"), in carousel order. */
export const CLUB_SECTIONS: ClubSection[] = [
  {
    id: "it",
    tag: "IT",
    title: "IT",
    description:
      "Covers Artificial Intelligence, Cybersecurity, Mobile Development, and Web Development, giving members hands on experience through practical projects, workshops, and technical challenges.",
    // TODO: real "Meet our projects" link for this section.
    href: "/#featured-projects",
  },
  {
    id: "game-dev",
    tag: "GameDev",
    title: "Game Dev",
    description:
      "Creative space dedicated to game programming, 2D and 3D design, and full game development. Members build real games through workshops, game jams, and collaborative projects.",
    // TODO: real "Meet our projects" link for this section.
    href: "/#featured-projects",
  },
  {
    id: "robotics",
    tag: "Robotics",
    title: "Robotics",
    description:
      "Covers robot design, construction, and programming, combining electronics, mechanics, embedded systems, and AI through practical hands-on projects.",
    // TODO: real "Meet our projects" link for this section.
    href: "/#featured-projects",
  },
]
