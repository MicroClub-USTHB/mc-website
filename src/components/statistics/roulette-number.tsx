"use client"

import { motion, useTransform } from "motion/react"

import { useStatisticsStep } from "@/components/statistics/statistics-scroll"
import { cn } from "@/lib/utils"

/** Angle between two faces of the drum and drum radius (in em of the number font size). */
const FACE_ANGLE = 36
const RADIUS = "1.7em"
/** Opacity lost per face away from the front one. */
const FADE_PER_FACE = 0.45

/** One face: Figma line height (161 px for a 132 px number), vertically centered on the drum. */
const FACE = "top-1/2 -mt-[0.61em] leading-[1.22em]"

/**
 * 3D roulette drum: values sit on the faces of a cylinder that rotates on the X axis
 * with the scroll-linked step, so neighbours peek above and below in perspective.
 * Decorative: each value is exposed to assistive tech and crawlers by its stat heading.
 */
export function RouletteNumber({ values }: { values: number[] }) {
  return (
    <div
      aria-hidden
      className="relative h-full w-full mask-[linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] perspective-[6em]"
    >
      <div className="absolute inset-0 transform-3d">
        {values.map((value, index) => (
          <Face key={index} value={value} index={index} />
        ))}
      </div>
    </div>
  )
}

function Face({ value, index }: { value: number; index: number }) {
  const step = useStatisticsStep()
  const transform = useTransform(
    step,
    (s) => `translateZ(-${RADIUS}) rotateX(${(s - index) * FACE_ANGLE}deg) translateZ(${RADIUS})`,
  )
  const opacity = useTransform(step, (s) => Math.max(0, 1 - Math.abs(s - index) * FADE_PER_FACE))

  return (
    <motion.span
      style={{ transform, opacity }}
      className={cn(
        FACE,
        "absolute inset-x-0 block text-center will-change-transform backface-hidden",
      )}
    >
      {value}
    </motion.span>
  )
}
