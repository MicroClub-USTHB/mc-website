"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"

import { RouletteNumber } from "@/components/statistics/roulette-number"
import { cn } from "@/lib/utils"

export type Stat = {
  label: string
  value: number
  description: string
}

/**
 * Pinned statistics: the section is `stats.length` screens tall and its content sticks to the
 * viewport. Everything is scroll-linked: each stat holds for a while, then the next one rolls in
 * (3D drum for the number, bottom-to-top fade for the texts, background fade).
 */
export function StatisticsScroller({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.0005 })

  // Hold on each stat, transition between them: [0,0, 1,1, 2,2] for 3 stats.
  const last = stats.length - 1
  const input = stats.flatMap((_, i) => [(i * 2) / (last * 2 + 1), (i * 2 + 1) / (last * 2 + 1)])
  const output = stats.flatMap((_, i) => [i, i])
  const step = useTransform(progress, input, output)

  // Background gradient fade: white -> light blue -> dark (Figma note), driven by the same step.
  const blueOpacity = useTransform(step, [0, 1], [0, 1])
  const darkOpacity = useTransform(step, [1, 2], [0, 1])

  return (
    <div ref={ref} style={{ height: `${stats.length * 100}svh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-background" />
        <motion.div
          aria-hidden
          style={{ opacity: blueOpacity }}
          className="absolute inset-0 bg-blue-primary-300"
        />
        <motion.div
          aria-hidden
          style={{ opacity: darkOpacity }}
          className="dark absolute inset-0 bg-background"
        />

        <div className="relative flex h-full flex-col items-center justify-center gap-10 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-20 lg:text-left">
          <TextStack className="lg:w-60">
            {stats.map((stat, i) => (
              <StatText key={stat.label} index={i} step={step} dark={i === last}>
                <p className="header-md font-medium text-primary uppercase">{stat.label}</p>
              </StatText>
            ))}
          </TextStack>

          <div className="relative h-[2.18em] w-[4.17em] shrink-0 overflow-hidden rounded-full border-[1.5px] border-border bg-background font-heading text-[4.5rem] font-medium tracking-[-0.02em] text-foreground sm:text-[6rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 xl:text-[8.25rem]">
            <motion.div
              aria-hidden
              style={{ opacity: darkOpacity }}
              className="dark pointer-events-none absolute inset-0 rounded-full border-[1.5px] border-border"
            />
            <RouletteNumber values={stats.map((s) => s.value)} step={step} />
          </div>

          <TextStack className="max-w-70 lg:text-right">
            {stats.map((stat, i) => (
              <StatText key={stat.label} index={i} step={step} dark={i === last}>
                <p className="header-xs font-medium text-muted-foreground">{stat.description}</p>
                <p className="sr-only">
                  {stat.label}: {stat.value}
                </p>
              </StatText>
            ))}
          </TextStack>
        </div>
      </div>
    </div>
  )
}

/** Stacks its children in the same grid cell so they can cross-fade. */
function TextStack({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid items-center", className)}>{children}</div>
}

/** Scroll-linked text: enters from below, leaves upward, fully visible while its stat holds. */
function StatText({
  index,
  step,
  dark,
  children,
}: {
  index: number
  step: MotionValue<number>
  dark: boolean
  children: React.ReactNode
}) {
  const y = useTransform(step, [index - 1, index, index + 1], [48, 0, -48])
  const opacity = useTransform(step, [index - 0.6, index, index + 0.6], [0, 1, 0])

  return (
    <motion.div
      style={{ y, opacity }}
      className={cn("col-start-1 row-start-1 will-change-transform", dark && "dark")}
    >
      {children}
    </motion.div>
  )
}
