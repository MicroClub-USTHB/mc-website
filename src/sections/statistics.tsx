import { SectionContainer } from "@/components/shared/section-container"
import { StatisticsScroller } from "@/components/statistics/statistics-scroller"
import { STATISTICS } from "@/const/statistics"

export function Statistics() {
  return (
    <SectionContainer id="statistics" aria-label="Statistics" bleed>
      <StatisticsScroller stats={STATISTICS} />
    </SectionContainer>
  )
}
