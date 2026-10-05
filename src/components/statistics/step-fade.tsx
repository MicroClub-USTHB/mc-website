"use client"

import { motion, useTransform } from "motion/react"

import { useStatisticsStep } from "@/components/statistics/statistics-scroll"

/** Decorative layer that fades in while the step goes from `index - 1` to `index`. */
export function StepFade({ index, className }: { index: number; className: string }) {
  const opacity = useTransform(useStatisticsStep(), [index - 1, index], [0, 1])
  return <motion.div aria-hidden style={{ opacity }} className={className} />
}
