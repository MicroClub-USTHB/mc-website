"use client"

import { useLayoutEffect, useRef } from "react"
import { motion, useAnimation, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type SendIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Icon size in px. */
  size?: number
}

/**
 * Animated Lucide icon from lucide-animated.com. Plays while the link or button it sits in (or
 * the icon itself, when it is not inside one) is hovered by a mouse or focused. Decorative:
 * hidden from assistive tech, so the parent carries the accessible name. No animation with
 * reduced motion.
 */
export function SendIcon({ className, size = 16, ...props }: SendIconProps) {
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
        className="overflow-visible"
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
        <motion.g
          animate={controls}
          transition={{ duration: 0.5 }}
          variants={{
            normal: { x: 0, y: 0, scale: 1 },
            animate: {
              x: 3,
              y: -3,
              scale: 0.8,
            },
          }}
        >
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </motion.g>
        <motion.path
          animate={controls}
          d="M -3 28 C -0.5 26.8 1.6 24.6 3.3 22 C 4.8 19.7 5.2 17.6 4.2 16.1 C 3.2 14.7 1.4 14.5 0.3 15.8 C -0.9 17.2 -0.6 19.4 1.2 20.4 C 3.4 21.5 6.4 19.4 9 15.8"
          fill="none"
          initial={{ opacity: 0, pathLength: 0 }}
          stroke="currentColor"
          strokeDasharray="2 2"
          strokeWidth="1"
          transition={{ duration: 0.55, delay: 0.1 }}
          variants={{
            normal: {
              pathLength: 0,
              opacity: 0,
              translateX: -3,
              translateY: 3,
              transition: { duration: 0.3 },
            },
            animate: {
              pathLength: 1,
              opacity: 1,
              translateX: 0,
              translateY: 0,
            },
          }}
        />
      </svg>
    </span>
  )
}
