"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"

import { RouletteNumber } from "@/components/statistics/roulette-number"
import { StatText } from "@/components/statistics/stat-text"
import type { Stat, StatTone } from "@/const/statistics"
import { cn } from "@/lib/utils"

/** Scroll share of each stat's resting state (the rest is spent transitioning). */
const HOLD = 0.08
/** Scroll distance per transition, in viewport heights. */
const SCREENS_PER_STEP = 0.7

/** Background of each tone, using mcoli-ui tokens only. */
const TONE_BACKGROUND: Record<StatTone, string> = {
  light: "bg-background",
  blue: "bg-blue-primary-300",
  dark: "dark bg-background",
}

/**
 * Figma metric pill (550 × 288 px for a 132 px number), expressed in em of the number font size
 * so it scales with the responsive font sizes below.
 */
const PILL = "h-[2.18em] w-[4.17em] text-[4.5rem] sm:text-[6rem] xl:text-[8.25rem]"

/**
 * Pinned statistics: content sticks to the viewport while the section scrolls by. Everything is
 * scroll-linked: each stat rests briefly, then the next one rolls in (3D drum for the number,
 * bottom-to-top fade for the texts, background fade between stat tones).
 */
export function StatisticsScroller({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.0005 })
  const step = useTransform(progress, ...stepKeyframes(stats.length))

  return (
    <div
      ref={ref}
      style={{ height: `${100 + (stats.length - 1) * SCREENS_PER_STEP * 100}svh` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {stats.map((stat, i) => (
          <FadeIn
            key={stat.label}
            index={i}
            step={step}
            className={cn("absolute inset-0", TONE_BACKGROUND[stat.tone])}
          />
        ))}

        <div className="relative flex h-full flex-col items-center justify-center gap-10 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-20 lg:text-left">
          <div className="grid items-center lg:w-60">
            {stats.map((stat, i) => (
              <StatText key={stat.label} index={i} step={step} dark={stat.tone === "dark"}>
                <p className="header-md font-medium text-primary uppercase">{stat.label}</p>
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
            {stats.map(
              (stat, i) =>
                stat.tone === "dark" && (
                  <FadeIn
                    key={stat.label}
                    index={i}
                    step={step}
                    className="dark pointer-events-none absolute inset-0 rounded-full border-[1.5px] border-border"
                  />
                ),
            )}
            <RouletteNumber values={stats.map((stat) => stat.value)} step={step} />
          </div>

          <div className="grid max-w-70 items-center lg:text-right">
            {stats.map((stat, i) => (
              <StatText key={stat.label} index={i} step={step} dark={stat.tone === "dark"}>
                <p className="header-xs font-medium text-muted-foreground">{stat.description}</p>
                <p className="sr-only">
                  {stat.label}: {stat.value}
                </p>
              </StatText>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Maps scroll progress (0 → 1) to a continuous step (0 → count - 1) with a short rest on each
 * stat: e.g. [0, 0, 1, 1, 2, 2] for 3 stats.
 */
function stepKeyframes(count: number): [number[], number[]] {
  const move = (1 - HOLD * count) / (count - 1)
  const input = Array.from({ length: count }, (_, i) => {
    const start = i * (HOLD + move)
    return [start, start + HOLD]
  }).flat()
  const output = Array.from({ length: count }, (_, i) => [i, i]).flat()
  return [input, output]
}

/** Layer that fades in while the step goes from `index - 1` to `index` (always visible at 0). */
function FadeIn({
  index,
  step,
  className,
}: {
  index: number
  step: MotionValue<number>
  className: string
}) {
  const opacity = useTransform(step, [index - 1, index], [0, 1])
  return <motion.div aria-hidden style={{ opacity }} className={className} />
}
