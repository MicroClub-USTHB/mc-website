import { SectionContainer } from "@/components/shared/section-container"
import { RouletteNumber } from "@/components/statistics/roulette-number"
import { StatText } from "@/components/statistics/stat-text"
import { StatisticsScroll } from "@/components/statistics/statistics-scroll"
import { StepFade } from "@/components/statistics/step-fade"
import { STATISTICS, type StatTone } from "@/const/statistics"
import { cn } from "@/lib/utils"

/** Background of each tone, using mcoli-ui tokens only. */
const TONE_BACKGROUND: Record<StatTone, string> = {
  light: "bg-background",
  blue: "bg-blue-primary-300",
  dark: "dark bg-background",
}

/**
 * Figma metric pill (550 × 288 px for a 132 px number), expressed in em of the number font size
 * so it scales with the responsive font sizes.
 */
const PILL = "h-[2.18em] w-[4.17em] text-[4.5rem] sm:text-[6rem] xl:text-[8.25rem]"

/**
 * Statistics section. Server Component: every label, value and description is in the
 * server-rendered HTML; only the scroll animations are client islands.
 */
export function Statistics() {
  return (
    <SectionContainer id="statistics" aria-labelledby="statistics-title" bleed>
      <h2 id="statistics-title" className="sr-only">
        Micro Club in numbers
      </h2>

      <StatisticsScroll count={STATISTICS.length}>
        {STATISTICS.map((stat, i) => (
          <StepFade
            key={stat.label}
            index={i}
            className={cn("absolute inset-0", TONE_BACKGROUND[stat.tone])}
          />
        ))}

        <div className="relative mx-auto flex h-full max-w-site flex-col items-center justify-center gap-10 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-20 lg:text-left">
          <div className="grid items-center lg:w-60">
            {STATISTICS.map((stat, i) => (
              <StatText key={stat.label} index={i} dark={stat.tone === "dark"}>
                <h3 className="header-md font-medium text-primary uppercase">
                  {stat.label}
                  <span className="sr-only">: {stat.value}</span>
                </h3>
              </StatText>
            ))}
          </div>

          <div
            className={cn(
              PILL,
              "relative shrink-0 overflow-hidden rounded-full border-[1.5px] border-border bg-background font-heading font-medium tracking-[-0.02em] text-foreground",
              "lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
            )}
          >
            {STATISTICS.map(
              (stat, i) =>
                stat.tone === "dark" && (
                  <StepFade
                    key={stat.label}
                    index={i}
                    className="dark pointer-events-none absolute inset-0 rounded-full border-[1.5px] border-border"
                  />
                ),
            )}
            <RouletteNumber values={STATISTICS.map((stat) => stat.value)} />
          </div>

          <div className="grid max-w-70 items-center lg:text-right">
            {STATISTICS.map((stat, i) => (
              <StatText key={stat.label} index={i} dark={stat.tone === "dark"}>
                <p className="header-xs font-medium text-muted-foreground">{stat.description}</p>
              </StatText>
            ))}
          </div>
        </div>
      </StatisticsScroll>
    </SectionContainer>
  )
}
