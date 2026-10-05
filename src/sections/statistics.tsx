import { SectionContainer } from "@/components/shared/section-container"
import { StatisticsScroller, type Stat } from "@/components/statistics/statistics-scroller"

// TODO: replace with real figures once provided.
const stats: Stat[] = [
  {
    label: "Total Events",
    value: 80,
    description: "Bringing our community together through different events.",
  },
  {
    label: "Total Workshops",
    value: 188,
    description: "Learning, sharing, and creating together.",
  },
  {
    label: "Total Trainings",
    value: 31,
    description: "Building skills through practical learning.",
  },
]

export function Statistics() {
  return (
    <SectionContainer id="statistics" aria-label="Statistics" bleed>
      <StatisticsScroller stats={stats} />
    </SectionContainer>
  )
}
