"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react"

import { RegistrationsButton } from "@/components/shared/registrations-button"
import { useMenu } from "@/components/site-menu/menu-context"
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO } from "@/lib/easing"
import { useRegistrationsPhase } from "@/lib/registrations/use-registrations-phase"
import { cn } from "@/lib/utils"

/** Flight from the hero to the bar, and back (s). */
const DOCK_DURATION = 0.7
const UNDOCK_DURATION = 0.5

/** A flight frame: offset (px) of the dock's top-right corner and its scale, from its place. */
type Pose = { x: number; y: number; scale: number }

const REST: Pose = { x: 0, y: 0, scale: 1 }

const toTransform = ({ x, y, scale }: Pose) => `translate(${x}px, ${y}px) scale(${scale})`

/** The pose a running flight has reached (`matrix(a, b, c, d, e, f)` of translate + scale). */
function currentPose(element: HTMLElement): Pose {
  const match = getComputedStyle(element).transform.match(/matrix\(([^)]+)\)/)
  if (!match) return REST
  const [a, , , , e, f] = match[1].split(",").map(Number)
  return { x: e, y: f, scale: a }
}

/**
 * The hero's registrations button docked in the menu bar (Figma: at the right end of the bar,
 * centred on it). Once the hero button scrolls up to the dock's
 * line (or out of view), it flies from its place in the hero to the bar; scrolling back down, it
 * flies back into the hero, following the page as it scrolls. The hero keeps its slot (hidden by
 * `data-docked` meanwhile), so its layout never changes.
 *
 * Cheap by design: an IntersectionObserver whose root starts at the dock's line reports the
 * crossing, so scrolling reads no layout. The flight to the bar is a CSS transform animation
 * (run by the compositor); only the flight back, which tracks the scrolling page, sets a
 * transform per frame, for half a second. Instant with reduced motion. Hidden while the menu is
 * open (it would sit over the menu's wordmark) and on other pages than the landing page.
 */
export function RegistrationsDock() {
  const pathname = usePathname()
  const { open } = useMenu()
  const state = useRegistrationsPhase()
  const reduceMotion = useReducedMotion()
  const dockRef = useRef<HTMLDivElement>(null)
  const phase = state?.phase.status === "closed" ? null : state?.phase
  const active = pathname === "/" && !!phase

  useEffect(() => {
    const dock = dockRef.current
    const container = dock?.parentElement
    const slot = document.querySelector<HTMLElement>("[data-registrations-slot]")
    if (!active || !dock || !container || !slot) return

    let docked = false
    let flight: AnimationPlaybackControls | null = null
    let observer: IntersectionObserver | null = null

    /** The dock's top-right corner at its place, and its scale (transforms aside). */
    function place() {
      const box = container!.getBoundingClientRect()
      const scale = parseFloat(getComputedStyle(dock!.firstElementChild!).scale) || 1
      return {
        right: box.left + dock!.offsetLeft + dock!.offsetWidth,
        top: box.top + dock!.offsetTop,
        width: dock!.offsetWidth * scale,
      }
    }

    /** The pose that draws the dock over the hero button, at `slot` (its box on screen). */
    function poseOver(slot: DOMRectReadOnly): Pose {
      const { right, top, width } = place()
      return { x: slot.right - right, y: slot.top - top, scale: slot.width / width }
    }

    /** Stops a flight where it is and returns the pose it reached (`null`: none running). */
    function interrupt() {
      if (!flight) return null
      const pose = currentPose(dock!)
      flight.stop()
      flight = null
      return pose
    }

    function dockIn(slotBox: DOMRectReadOnly, instant: boolean) {
      docked = true
      const from = interrupt() ?? poseOver(slotBox)
      dock!.dataset.docked = ""
      slot!.dataset.docked = ""
      if (instant || reduceMotion) {
        dock!.style.transform = ""
        return
      }
      flight = animate(
        dock!,
        { transform: [toTransform(from), toTransform(REST)] },
        { duration: DOCK_DURATION, ease: EASE_OUT_EXPO },
      )
      flight.finished.then(() => (flight = null))
    }

    function dockOut(slotBox: DOMRectReadOnly, instant: boolean) {
      docked = false
      const from = interrupt() ?? REST
      const settle = () => {
        flight = null
        dock!.style.transform = ""
        delete dock!.dataset.docked
        delete slot!.dataset.docked
      }
      if (instant || reduceMotion) return settle()
      // The hero button keeps moving with the page: aim at where the scroll has taken it.
      const target = poseOver(slotBox)
      const scrollStart = window.scrollY
      flight = animate(0, 1, {
        duration: UNDOCK_DURATION,
        ease: EASE_IN_OUT_QUART,
        onUpdate: (progress) => {
          const y = target.y + scrollStart - window.scrollY
          dock!.style.transform = toTransform({
            x: from.x + (target.x - from.x) * progress,
            y: from.y + (y - from.y) * progress,
            scale: from.scale + (target.scale - from.scale) * progress,
          })
        },
        onComplete: settle,
      })
    }

    // The root starts at the dock's top: the hero button docks once its top passes that line (or
    // once it is out of view, the canvas dragged away), and comes back when it is below again.
    function observe() {
      observer?.disconnect()
      const { top } = place()
      let first = true
      observer = new IntersectionObserver(
        ([entry]) => {
          const shouldDock = !entry.isIntersecting || entry.boundingClientRect.top < top
          // On load (or resize), the button simply is where it belongs.
          if (shouldDock !== docked) {
            if (shouldDock) dockIn(entry.boundingClientRect, first)
            else dockOut(entry.boundingClientRect, first)
          }
          first = false
        },
        { rootMargin: `${-Math.max(0, Math.floor(top))}px 0px 0px 0px`, threshold: [0, 1] },
      )
      observer.observe(slot!)
    }

    observe()
    window.addEventListener("resize", observe)
    return () => {
      window.removeEventListener("resize", observe)
      observer?.disconnect()
      flight?.stop()
      dock.style.transform = ""
      delete dock.dataset.docked
      delete slot.dataset.docked
    }
  }, [active, reduceMotion])

  if (!active || !phase || !state) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      {/* Centred on the bar, scaled with it (the Figma 85px bar: 1, never under 0.75). */}
      <div
        ref={dockRef}
        className={cn(
          "invisible absolute right-(--menu-left) origin-top-right data-docked:visible",
          "[--dock-scale:clamp(0.75,tan(atan2(var(--menu-size),85px)),1)]",
          "top-[calc(var(--menu-top)+var(--menu-size)/2-32.1375px*var(--dock-scale))]",
        )}
      >
        <RegistrationsButton
          phase={phase}
          now={state.now}
          className={cn(
            "pointer-events-auto origin-top-right scale-(--dock-scale) transition-opacity duration-300",
            open && "pointer-events-none opacity-0",
          )}
        />
      </div>
    </div>
  )
}
