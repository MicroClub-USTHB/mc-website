import { CONTACT } from "@/const/contact"

export type CommunityActivity = {
  title: string
  /** Shown under the title of the active activity. */
  description?: string
}

/** MC Community copy (Figma "MC Community"). */
export const COMMUNITY = {
  title: "MC Community",
  intro:
    "Don't miss our biggest announcements: events, registrations, activities… and stay always up to date and experience it, not just IT.",
  cta: { label: "Join MCC on Discord Now!", href: CONTACT.discord },
} as const

/** Community activities, in display order. */
export const COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  {
    title: "Workshops & Activities",
    description:
      "Our workshops are built to get your hands dirty with real skills, real tools, real projects. From web dev to AI, cybersecurity to UI/UX design and from robotics to game dev, there's always something new to explore and master.",
  },
  { title: "Exam revision sessions" },
  { title: "Projects & Real Opportunities" },
  { title: "Games & Movie Nights" },
]
