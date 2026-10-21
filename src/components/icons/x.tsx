"use client"

import { useLayoutEffect, useRef } from "react"
import { motion, useAnimation, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
}

type XIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Icon size in px. */
  size?: number
}

/**
 * Animated Lucide icon from lucide-animated.com. Plays while the link or button it sits in (or
 * the icon itself, when it is not inside one) is hovered by a mouse or focused. Decorative:
 * hidden from assistive tech, so the parent carries the accessible name. No animation with
 * reduced motion.
 */
export function XIcon({ className, size = 16, ...props }: XIconProps) {
  const controls = useAnimation()
  const reduceMotion = useReducedMotion()
  const root = useRef<HTMLSpanElement>(null)

  // A layout effect: its cleanup runs before React removes the DOM, so the blur / pointerleave
  // events that removal fires (a link that navigates away) no longer reach `controls.start`.
  useLayoutEffect(() => {
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
        <motion.path animate={controls} d="M18 6 6 18" variants={PATH_VARIANTS} />
        <motion.path
          animate={controls}
          d="m6 6 12 12"
          transition={{ delay: 0.2 }}
          variants={PATH_VARIANTS}
        />
      </svg>
    </span>
  )
}
