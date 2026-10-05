"use client"

import { motion, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

/** Vertical travel of a text while it enters / leaves, in px. */
const TRAVEL = 48

type StatTextProps = {
  index: number
  step: MotionValue<number>
  dark: boolean
  children: React.ReactNode
}

/**
 * Scroll-linked text of one stat: enters from below, leaves upward, fully visible while its stat
 * rests. Siblings share one grid cell (`col-start-1 row-start-1`) so they cross-fade in place.
 */
export function StatText({ index, step, dark, children }: StatTextProps) {
  const y = useTransform(step, [index - 1, index, index + 1], [TRAVEL, 0, -TRAVEL])
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
