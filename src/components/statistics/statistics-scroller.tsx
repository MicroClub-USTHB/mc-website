"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react"

import { REEL_START, SlotNumber, spinReel } from "@/components/statistics/slot-number"
import { cn } from "@/lib/utils"

export type Stat = {
  label: string
  value: number
  description: string
}

const REELS = 3

function toDigits(value: number): (number | null)[] {
  const digits = String(value).split("").map(Number)
  return [...Array<null>(Math.max(0, REELS - digits.length)).fill(null), ...digits]
}

/** Spin every reel toward the digits of `value`; empty reels stay where they are. */
function nextPositions(positions: number[], value: number, direction: 1 | -1) {
  return toDigits(value).map((digit, i) =>
    digit === null ? positions[i] : spinReel(positions[i], digit, direction),
  )
}

const textMotion = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
} as const

/**
 * Pinned statistics: the section is `stats.length` screens tall and its content sticks to the
 * viewport. Scroll progress picks the active stat, cross-fades the background
 * (light -> blue -> dark) and spins the number reels.
 */
export function StatisticsScroller({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const [state, setState] = useState(() => ({
    step: 0,
    positions: nextPositions(Array<number>(REELS).fill(REEL_START), stats[0].value, 1),
  }))
  const { step, positions } = state

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(stats.length - 1, Math.floor(progress * stats.length))
    if (next === step) return
    setState((prev) => ({
      step: next,
      positions: nextPositions(prev.positions, stats[next].value, next > prev.step ? 1 : -1),
    }))
  })

  // Background gradient fade: white -> light blue -> dark, centered on each step boundary.
  const blueOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])
  const darkOpacity = useTransform(scrollYProgress, [0.53, 0.73], [0, 1])

  const current = stats[step]
  const previous = stats[step - 1]
  const next = stats[step + 1]
  const isDark = step === stats.length - 1

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
          <div className={cn("grid lg:w-60", isDark && "dark")}>
            <AnimatePresence initial={false}>
              <motion.p
                key={current.label}
                {...textMotion}
                className="col-start-1 row-start-1 header-md font-medium text-primary uppercase"
              >
                {current.label}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="relative flex h-[2.18em] w-[4.17em] items-center justify-center rounded-full border-[1.5px] border-border bg-background text-center font-heading text-[4.5rem] font-medium tracking-[-0.02em] text-foreground sm:text-[6rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 xl:text-[8.25rem]">
            <motion.div
              aria-hidden
              style={{ opacity: darkOpacity }}
              className="dark pointer-events-none absolute -inset-[1.5px] rounded-full border-[1.5px] border-border"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full mask-[linear-gradient(to_bottom,transparent,black_45%,black_55%,transparent)]"
            >
              <AnimatePresence initial={false}>
                {previous && (
                  <motion.span
                    key={`prev-${previous.value}`}
                    {...textMotion}
                    className="absolute inset-x-0 top-1/2 mt-[-1.72em] leading-[1.22em]"
                  >
                    {previous.value}
                  </motion.span>
                )}
                {next && (
                  <motion.span
                    key={`next-${next.value}`}
                    {...textMotion}
                    className="absolute inset-x-0 top-1/2 mt-[0.5em] leading-[1.22em]"
                  >
                    {next.value}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <SlotNumber digits={toDigits(current.value)} positions={positions} />
            <span className="sr-only">{current.value}</span>
          </div>

          <div className={cn("grid max-w-70 lg:text-right", isDark && "dark")}>
            <AnimatePresence initial={false}>
              <motion.p
                key={current.description}
                {...textMotion}
                className="col-start-1 row-start-1 header-xs font-medium text-muted-foreground"
              >
                {current.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
