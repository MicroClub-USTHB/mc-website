"use client"

import { motion, type Variants } from "motion/react"

import { useIconAnimation } from "@/components/icons/use-icon-animation"
import { cn } from "@/lib/utils"

const PATH_VARIANTS: Variants = {
  normal: { d: "m5 12 7-7 7 7", translateY: 0 },
  animate: {
    d: "m5 12 7-7 7 7",
    translateY: [0, 3, 0],
    transition: {
      duration: 0.4,
    },
  },
}

const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: "M12 19V5" },
  animate: {
    d: ["M12 19V5", "M12 19V10", "M12 19V5"],
    transition: {
      duration: 0.4,
    },
  },
}

type ArrowUpIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Icon size in px. */
  size?: number
}

/**
 * Animated Lucide icon from lucide-animated.com. Plays while the link or button it sits in (or
 * the icon itself, when it is not inside one) is hovered by a mouse or focused. Decorative:
 * hidden from assistive tech, so the parent carries the accessible name. No animation with
 * reduced motion.
 */
export function ArrowUpIcon({ className, size = 16, ...props }: ArrowUpIconProps) {
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
        <motion.path animate={controls} d="m5 12 7-7 7 7" variants={PATH_VARIANTS} />
        <motion.path animate={controls} d="M12 19V5" variants={SECOND_PATH_VARIANTS} />
      </svg>
    </span>
  )
}
