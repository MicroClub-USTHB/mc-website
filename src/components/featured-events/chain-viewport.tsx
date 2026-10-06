"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

/** Chain progress in slots, from 0 to `slots`, shared by every slice of the chain. */
const ChainProgressContext = createContext<MotionValue<number> | null>(null)

/**
 * Box of the event chain and its clock: one Motion value runs from 0 to `slots` in a linear,
 * infinite loop (`stepDuration` seconds per slot), and every `ChainSlot` derives its position
 * from it, so there is no React render per frame. The loop pauses while the box is offscreen and
 * never starts when the user prefers reduced motion (the chain then stays still).
 */
export function ChainViewport({
  slots,
  stepDuration,
  className,
  ...props
}: React.ComponentProps<"div"> & { slots: number; stepDuration: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduceMotion = useReducedMotion()
  const progress = useMotionValue(0)
  const controls = useRef<AnimationPlaybackControls>(null)

  useEffect(() => {
    if (reduceMotion) return
    const animation = animate(progress, [0, slots], {
      duration: slots * stepDuration,
      ease: "linear",
      repeat: Infinity,
    })
    animation.pause()
    controls.current = animation
    return () => {
      animation.stop()
      controls.current = null
    }
  }, [progress, slots, stepDuration, reduceMotion])

  useEffect(() => {
    if (inView) controls.current?.play()
    else controls.current?.pause()
  }, [inView, reduceMotion])

  return (
    <ChainProgressContext value={progress}>
      <div ref={ref} className={cn(className)} {...props} />
    </ChainProgressContext>
  )
}

/**
 * One slice of the chain. Its slot is `index + progress`, wrapped to `[0, slots)`: it slides
 * toward the bottom left by one `step` per slot (in % of its own size), jumps back to slot 0 at
 * the end of the loop (offscreen), and its depth follows the slot, so the slice further down is
 * always in front.
 */
export function ChainSlot({
  index,
  slots,
  step,
  className,
  style,
  children,
}: {
  index: number
  slots: number
  /** Move per slot, in % of the slice width (`x`) and height (`y`). */
  step: { x: number; y: number }
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const progress = useContext(ChainProgressContext)
  if (!progress) throw new Error("ChainSlot must be rendered inside ChainViewport")

  const slot = useTransform(progress, (value) => (index + value) % slots)
  const x = useTransform(slot, (value) => `${value * step.x}%`)
  const y = useTransform(slot, (value) => `${value * step.y}%`)
  const zIndex = useTransform(slot, (value) => Math.floor(value) + 1)

  return (
    <motion.div style={{ ...style, x, y, zIndex }} className={className}>
      {children}
    </motion.div>
  )
}
