"use client"

import { motion, type Transition } from "motion/react"

import { useIconAnimation } from "@/components/icons/use-icon-animation"
import { cn } from "@/lib/utils"

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
}

type ChevronLeftIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Icon size in px. */
  size?: number
}

/**
 * Animated Lucide icon from lucide-animated.com. Plays while the link or button it sits in (or
 * the icon itself, when it is not inside one) is hovered by a mouse or focused. Decorative:
 * hidden from assistive tech, so the parent carries the accessible name. No animation with
 * reduced motion.
 */
export function ChevronLeftIcon({ className, size = 16, ...props }: ChevronLeftIconProps) {
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
        <motion.path
          animate={controls}
          d="m15 18-6-6 6-6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { x: 0 },
            animate: { x: [0, -2, 0] },
          }}
        />
      </svg>
    </span>
  )
}
