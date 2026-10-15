"use client"

import { motion, useReducedMotion } from "motion/react"

import { EASE_IN_OUT_QUART } from "@/lib/easing"

const ROWS = 3
const COLS = 3

/** Dot-grid loading indicator (Figma "Loading indicator"): a wave runs through the dots. */
export function LoadingDots() {
  const reduceMotion = useReducedMotion()

  return (
    <span
      aria-hidden
      className="grid h-[1.22581rem] w-4.5 shrink-0 grid-cols-3 grid-rows-3 place-items-center px-0.75 py-0.75"
    >
      {Array.from({ length: ROWS * COLS }, (_, i) => {
        const row = Math.floor(i / COLS)
        const col = i % COLS
        return (
          <motion.span
            key={i}
            className="size-[0.15rem] rounded-full bg-primary"
            style={{ opacity: 1 - row * 0.3 }}
            animate={reduceMotion ? undefined : { opacity: [1 - row * 0.3, 0.15, 1 - row * 0.3] }}
            transition={{
              duration: 1.2,
              delay: (row + col) * 0.12,
              repeat: Infinity,
              ease: EASE_IN_OUT_QUART,
            }}
          />
        )
      })}
    </span>
  )
}
