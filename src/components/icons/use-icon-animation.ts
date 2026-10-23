"use client"

import { useLayoutEffect, useRef } from "react"
import { useAnimation, useReducedMotion } from "motion/react"

/**
 * Plays a lucide-animated icon while the link or button it sits in (or the icon itself, when it
 * is not inside one) is hovered by a mouse or focused: `animate` on enter, back to `normal` on
 * leave. Returns the controls for the icon's `motion` paths and the ref for its root element.
 * Nothing plays with reduced motion.
 *
 * The listeners live in a layout effect, not `useEffect`: Motion marks the controls unmounted in
 * its own layout effect cleanup, and when React removes a focused or hovered button the browser
 * fires `focusout` / `pointerleave` during that removal. A passive effect's listeners would
 * still be attached then and call `controls.start()` on unmounted controls, which throws.
 * Layout cleanups run in the same pass, before the element leaves the DOM.
 */
export function useIconAnimation<T extends HTMLElement = HTMLSpanElement>() {
  const controls = useAnimation()
  const reduceMotion = useReducedMotion()
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const icon = ref.current
    if (!icon || reduceMotion) return
    const host = icon.closest<HTMLElement>("a, button") ?? icon
    // Guard for events dispatched while React is tearing the icon down.
    let active = true
    const play = (event: Event) => {
      if (!active) return
      if (!(event instanceof PointerEvent) || event.pointerType === "mouse") {
        void controls.start("animate")
      }
    }
    const stop = () => {
      if (active) void controls.start("normal")
    }
    host.addEventListener("pointerenter", play)
    host.addEventListener("pointerleave", stop)
    host.addEventListener("focusin", play)
    host.addEventListener("focusout", stop)
    return () => {
      active = false
      host.removeEventListener("pointerenter", play)
      host.removeEventListener("pointerleave", stop)
      host.removeEventListener("focusin", play)
      host.removeEventListener("focusout", stop)
    }
  }, [controls, reduceMotion])

  return { controls, ref }
}
