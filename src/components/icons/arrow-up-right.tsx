"use client"

import { motion, type Variants } from "motion/react"

import { useIconAnimation } from "@/components/icons/use-icon-animation"
import { cn } from "@/lib/utils"

const ARROW_VARIANTS: Variants = {
  normal: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  animate: {
    scale: [1, 0.85, 1],
    translateX: [0, -4, 0],
    translateY: [0, 4, 0],
    originX: 1,
    originY: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
}

type ArrowUpRightIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Icon size in px. */
  size?: number
}

/**
 * Animated Lucide icon from lucide-animated.com. Plays while the link or button it sits in (or
 * the icon itself, when it is not inside one) is hovered by a mouse or focused. Decorative:
 * hidden from assistive tech, so the parent carries the accessible name. No animation with
 * reduced motion.
 */
export function ArrowUpRightIcon({ className, size = 16, ...props }: ArrowUpRightIconProps) {
  const { controls, ref: root } = useIconAnimation()

  return (
    <span ref={root} aria-hidden className={cn("inline-flex", className)} {...props}>
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.g animate={controls} variants={ARROW_VARIANTS}>
          <path d="M7 7H17" />
          <path d="M17 7V17" />
          <path d="M7 17L17 7" />
        </motion.g>
      </svg>
    </span>
  )
}
