"use client"

import { motion, useTransform, type MotionValue } from "motion/react"

/** Angle between two faces of the drum and drum radius (in em of the number font size). */
const FACE_ANGLE = 36
const RADIUS = "1.7em"

type RouletteNumberProps = {
  values: number[]
  /** Continuous scroll-linked step: 0 = first value centered, 1 = second, ... */
  step: MotionValue<number>
}

/**
 * 3D roulette drum: values sit on the faces of a cylinder that rotates on the X axis
 * as `step` changes, so neighbours peek above and below in perspective.
 */
export function RouletteNumber({ values, step }: RouletteNumberProps) {
  return (
    <div
      aria-hidden
      className="relative h-full w-full mask-[linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] perspective-[6em]"
    >
      <div className="absolute inset-0 transform-3d">
        {values.map((value, index) => (
          <Face key={index} value={value} index={index} step={step} />
        ))}
      </div>
    </div>
  )
}

function Face({ value, index, step }: { value: number; index: number; step: MotionValue<number> }) {
  const transform = useTransform(
    step,
    (s) => `translateZ(-${RADIUS}) rotateX(${(s - index) * FACE_ANGLE}deg) translateZ(${RADIUS})`,
  )
  const opacity = useTransform(step, (s) => Math.max(0, 1 - Math.abs(s - index) * 0.45))

  return (
    <motion.span
      style={{ transform, opacity }}
      className="absolute inset-x-0 top-1/2 -mt-[0.61em] block text-center leading-[1.22em] will-change-transform backface-hidden"
    >
      {value}
    </motion.span>
  )
}
