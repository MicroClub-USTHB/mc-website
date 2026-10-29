import { CONTACT } from "@/const/contact"

export type CommunityActivity = {
  title: string
  /** Shown under the title of the active activity. */
  description: string
  /** Illustration following the cursor over the row (native SVG size). */
  icon: { src: string; width: number; height: number }
}

/** MC Community copy (Figma "MC Community"). */
export const COMMUNITY = {
  // Two spaces, as in Figma (kept by `whitespace-pre` on the title).
  title: "MC  Community",
  intro:
    "Don't miss our biggest announcements: events, registrations, activities… and stay always up to date and experience it, not just IT.",
  cta: { label: "Join MCC on Discord Now!", href: CONTACT.discord },
} as const

/** Community activities, in display order. */
export const COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  {
    title: "Workshops & Activities",
    icon: { src: "/MCC/lampe.svg", width: 59, height: 72 },
    description:
      "Our workshops are built to get your hands dirty with real skills, real tools, real projects. From web dev to AI, cybersecurity to UI/UX design and from robotics to game dev, there's always something new to explore and master.",
  },
  {
    title: "Exam revision sessions",
    icon: { src: "/MCC/books.svg", width: 67, height: 67 },
    description:
      "When exam season comes knocking, MCC shows up. Our members organize a couple of revision sessions where seniors help juniors, notes get shared and panic gets replaced with preparation. No one gets left behind.",
  },
  {
    title: "Projects & Real Opportunities",
    icon: { src: "/MCC/folders.svg", width: 60, height: 51 },
    description:
      "Built something cool? Show it off. Looking for a hackathon team, an internship lead, or a collab partner? This is where opportunities find you. The MCC family members are always building, always sharing, always opening doors for each other.",
  },
]
