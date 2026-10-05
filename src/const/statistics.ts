/** Background tone of a statistic step (mcoli-ui tokens, see `statistics-scroller.tsx`). */
export type StatTone = "light" | "blue" | "dark"

export type Stat = {
  label: string
  value: number
  description: string
  tone: StatTone
}

/** Statistics shown in the pinned Statistics section, in scroll order. */
export const STATISTICS: Stat[] = [
  {
    label: "Total Events",
    value: 80,
    description: "Bringing our community together through different events.",
    tone: "light",
  },
  {
    label: "Total Workshops",
    value: 188,
    description: "Learning, sharing, and creating together.",
    tone: "blue",
  },
  {
    label: "Total Trainings",
    value: 31,
    description: "Building skills through practical learning.",
    tone: "dark",
  },
]
