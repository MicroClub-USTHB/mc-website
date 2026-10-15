"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useReducedMotion, type Transition } from "motion/react"

import { cn } from "@/lib/utils"

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
}

type ChevronRightIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Icon size in px. */
  size?: number
}

/**
 * Animated Lucide icon from lucide-animated.com. Plays while the link or button it sits in (or
 * the icon itself, when it is not inside one) is hovered by a mouse or focused. Decorative:
 * hidden from assistive tech, so the parent carries the accessible name. No animation with
 * reduced motion.
 */
export function ChevronRightIcon({ className, size = 16, ...props }: ChevronRightIconProps) {
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
        <motion.path
          animate={controls}
          d="m9 18 6-6-6-6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { x: 0 },
            animate: { x: [0, 2, 0] },
          }}
        />
      </svg>
    </span>
  )
}
