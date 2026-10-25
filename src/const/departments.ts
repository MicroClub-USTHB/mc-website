export type DepartmentId =
  "design" | "marketing" | "dev" | "comm" | "multi" | "relex" | "irhr" | "ops"

export type DepartmentLink = {
  /** Text before the link, e.g. "Discover the visuals and experiences crafted by our team:". */
  lead: string
  label: string
  href: string
}

export type Department = {
  id: DepartmentId
  /** Short name in the panel's footer tab (Figma "DESIGN", "DEV", ...). */
  tab: string
  /** Full name, the title of the open card. */
  name: string
  tagline: string
  description: string
  /** Closing line under the description (Relex). */
  note?: string
  link?: DepartmentLink
}

/** Micro Club's departments ("Our Departments"), in panel order. */
export const DEPARTMENTS: Department[] = [
  {
    id: "design",
    tab: "Design",
    name: "Design",
    tagline: "Create experiences that inspire.",
    description:
      "Our creative minds, where creativity meets user experience. The Design department shapes the club’s visual identity. From visuals to UI/UX, they create modern interfaces and ensure every experience is clear, attractive, and impactful. They give Micro Club its unique shape, look and feel.",
    link: {
      lead: "Discover the visuals and experiences crafted by our team:",
      label: "Behance",
      href: "https://www.behance.net/Microclub",
    },
  },
  {
    id: "marketing",
    tab: "Marketing",
    name: "Marketing",
    tagline: "Build the brand. Create the impact.",
    description:
      "The strategic engine behind the club’s visibility, our team that keeps the club shining. The Marketing department builds the image of Micro Club, makes sure people know who we are and what we do, promotes its events, and creates strategies to reach, engage, and grow our community and create real impact.",
  },
  {
    id: "dev",
    tab: "Dev",
    name: "Development",
    tagline: "Code the future.",
    description:
      "The builders of ideas, our team that turns ideas into real solutions. Dev is where creativity meets code. The department creates the club’s digital tools and technical projects: websites, tech challenges, automation, and innovative solutions.",
    link: {
      lead: "Explore our projects, articles and more!",
      label: "Linktree",
      href: "https://linktr.ee/microclub_dev",
    },
  },
  {
    id: "comm",
    tab: "Comm",
    name: "Communication",
    tagline: "Share the story. Connect the people.",
    description:
      "The storytellers, the voice of our club. The Communication department manages what the world sees and hears about the club and our online presence. They share important updates, create posts, announcements, and content that keeps the connection strong between Micro Club and its community.",
  },
  {
    id: "multi",
    tab: "Multi",
    name: "Multimedia",
    tagline: "Capture moments. Create memories.",
    description:
      "The content creators behind our visual story. The Multimedia department captures special moments and transforms them into photos, videos, reels, and creative media that showcase the club’s energy. They bring our content to life, make our presence visible, and turn the club’s projects into engaging media experiences.",
  },
  {
    id: "relex",
    tab: "Relex",
    name: "Relex",
    tagline: "Open doors. Build partnerships.",
    description:
      "The connection makers, our bridge between the club and the outside world. The External Relations department builds partnerships, secures sponsorships, and creates collaboration opportunities with companies, organizations and partners which help the club to grow bigger.",
    note: "Relex connects the club with valuable external opportunities.",
  },
  {
    id: "irhr",
    tab: "IRHR",
    name: "IRHR",
    tagline: "Support people. Strengthen teams.",
    description:
      "The human side of the club, our people-first team. The Internal Relations & Human Resources department supports members and helps maintain a healthy and positive environment. IRHR focuses on members and internal life, solving internal issues, and making sure everyone feels welcomed, valued, and motivated.",
  },
  {
    id: "ops",
    tab: "Ops",
    name: "OPS",
    tagline: "Make it happen.",
    description:
      "The team that makes everything possible, our masters behind the scenes. The Operations department handles the planning, logistics, coordination, and ensures workshops, events and activities run smoothly from start to finish.",
  },
]
