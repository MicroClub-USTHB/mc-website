"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

type SpiralScrollProps = {
  /** Rotation while the viewport center crosses the spiral, in degrees. */
  turn: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/**
 * Client island of the About Us spiral: rotates the server-rendered panels on the Y axis with the
 * scroll, and keeps the camera at the viewport center so the panels in view are seen at eye level.
 * The rotation is not dropped for reduced motion: it is scroll-driven and gentle, and the
 * paragraph placement depends on it.
 */
export function SpiralScroll({ turn, className, style, children }: SpiralScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Viewport center position along the spiral, 0 (top) → 1 (bottom). Both the rotation and the
  // camera follow it, so the paragraphs placed by `spiralClearSide` stay clear of photos.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] })
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, turn])
  const perspectiveOrigin = useTransform(scrollYProgress, (p) => `50% ${p * 100}%`)

  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={{ ...style, perspectiveOrigin }}
      className={cn("relative", className)}
    >
      <motion.div
        style={{ rotateY }}
        className="absolute inset-y-0 left-1/2 will-change-transform transform-3d"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
