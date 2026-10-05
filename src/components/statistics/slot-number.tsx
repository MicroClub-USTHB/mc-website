"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/** Digits rendered per reel. Reels start in the middle so they can spin both ways. */
const STRIP_LENGTH = 100
export const REEL_START = STRIP_LENGTH / 2
const STRIP = Array.from({ length: STRIP_LENGTH }, (_, i) => i % 10)

/**
 * Next resting position of a reel: at least one full turn in the scroll direction,
 * then land on `digit` (casino roulette effect).
 */
export function spinReel(position: number, digit: number, direction: 1 | -1) {
  const base = position + 10 * direction
  const offset =
    direction === 1 ? (digit - (base % 10) + 10) % 10 : -(((base % 10) - digit + 10) % 10)
  return base + offset
}

type SlotNumberProps = {
  /** Digits to display, left-padded with `null` to the reel count. */
  digits: (number | null)[]
  /** Current resting position of each reel (see `spinReel`). */
  positions: number[]
  className?: string
}

/** Number made of vertical digit reels that spin and settle with a spring. */
export function SlotNumber({ digits, positions, className }: SlotNumberProps) {
  return (
    <span
      aria-hidden
      className={cn("flex h-[1.22em] justify-center overflow-hidden tabular-nums", className)}
    >
      {digits.map((digit, i) => (
        <motion.span
          key={i}
          className="block h-full overflow-hidden"
          initial={false}
          animate={{ width: digit === null ? 0 : "1ch", opacity: digit === null ? 0 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.span
            className="flex flex-col will-change-transform"
            initial={false}
            animate={{ y: `${(-positions[i] / STRIP_LENGTH) * 100}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 14, mass: 1, delay: i * 0.07 }}
          >
            {STRIP.map((n, j) => (
              <span key={j} className="block h-[1.22em] leading-[1.22em]">
                {n}
              </span>
            ))}
          </motion.span>
        </motion.span>
      ))}
    </span>
  )
}
