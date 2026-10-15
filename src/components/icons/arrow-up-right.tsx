"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useReducedMotion, type Variants } from "motion/react"

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
  const controls = useAnimation()
  const reduceMotion = useReducedMotion()
  const root = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const icon = root.current
    if (!icon || reduceMotion) return
    const host = icon.closest<HTMLElement>("a, button") ?? icon
    const play = (event: Event) => {
      if (!(event instanceof PointerEvent) || event.pointerType === "mouse")
        void controls.start("animate")
    }
    const stop = () => void controls.start("normal")
    host.addEventListener("pointerenter", play)
    host.addEventListener("pointerleave", stop)
    host.addEventListener("focusin", play)
    host.addEventListener("focusout", stop)
    return () => {
      host.removeEventListener("pointerenter", play)
      host.removeEventListener("pointerleave", stop)
      host.removeEventListener("focusin", play)
      host.removeEventListener("focusout", stop)
    }
  }, [controls, reduceMotion])

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
