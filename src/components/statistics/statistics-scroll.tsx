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
  const { screens, keyframes } = stepLayout(count)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.0005 })
  const step = useTransform(progress, ...keyframes)

  return (
    <div ref={ref} style={{ height: `${100 + screens * 100}svh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <StepContext value={step}>{children}</StepContext>
      </div>
    </div>
  )
}

/**
 * Scroll length of the section (in viewport heights) and the keyframes mapping its progress
 * (0 → 1) to a continuous step (0 → count - 1) with a short rest on each stat, e.g.
 * [0, 0, 1, 1, 2, 2] for 3 stats. The last stat rests twice as long as the others, so the
 * section does not scroll away right after the last roll (the rest before the first roll is
 * the same as the one added after the last).
 */
function stepLayout(count: number) {
  const base = (count - 1) * SCREENS_PER_STEP
  const hold = HOLD * base
  const move = (base - hold * count) / (count - 1)
  const screens = base + hold

  const input = Array.from({ length: count }, (_, i) => {
    const start = i * (hold + move)
    return [start / screens, (start + hold) / screens]
  }).flat()
  input[input.length - 1] = 1
  const output = Array.from({ length: count }, (_, i) => [i, i]).flat()
  return { screens, keyframes: [input, output] as [number[], number[]] }
}
