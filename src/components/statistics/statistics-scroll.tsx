"use client"

import { createContext, useContext, useRef } from "react"
import { useScroll, useSpring, useTransform, type MotionValue } from "motion/react"

/** Scroll share of each stat's resting state (the rest is spent transitioning). */
const HOLD = 0.08
/** Scroll distance per transition, in viewport heights. */
const SCREENS_PER_STEP = 0.7

const StepContext = createContext<MotionValue<number> | null>(null)

/** Continuous scroll-linked step: 0 = first stat, 1 = second, ... (fractions while rolling). */
export function useStatisticsStep() {
  const step = useContext(StepContext)
  if (!step) throw new Error("useStatisticsStep must be used inside <StatisticsScroll>")
  return step
}

/**
 * Client island of the Statistics section: makes the section tall enough to scroll through
 * `count` stats, pins its children to the viewport and shares the scroll-linked step.
 * Children stay Server Components, so all content is in the server-rendered HTML.
 */
export function StatisticsScroll({
  count,
  children,
}: {
  count: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.0005 })
  const step = useTransform(progress, ...stepKeyframes(count))

  return (
    <div
      ref={ref}
      style={{ height: `${100 + (count - 1) * SCREENS_PER_STEP * 100}svh` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <StepContext value={step}>{children}</StepContext>
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
