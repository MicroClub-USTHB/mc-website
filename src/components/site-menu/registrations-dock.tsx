"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useReducedMotion } from "motion/react"

import { RegistrationsButton } from "@/components/shared/registrations-button"
import { useMenu } from "@/components/site-menu/menu-context"
import { useRegistrationsPhase } from "@/lib/registrations/use-registrations-phase"
import { cn } from "@/lib/utils"

/** Scroll distance (px) of the glide into the bar: a share of the way across, within bounds. */
const GLIDE = { share: 0.6, min: 120, max: 360 }
/** The glide's curve across: ease-in-out (cubic), the same in CSS and in the fallback. */
const GLIDE_EASING = "cubic-bezier(0.65, 0, 0.35, 1)"
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/** Scroll-driven animations, missing from the DOM typings. */
type ScrollTimelineOptions = { source: Element; axis: "block" }
type ScrollAnimationOptions = KeyframeAnimationOptions & {
  timeline: AnimationTimeline
  rangeStart: string
  rangeEnd: string
}
declare const ScrollTimeline: { new (options: ScrollTimelineOptions): AnimationTimeline }

/**
 * Where the dock glides from and to, in page scroll offsets: from `start` the dock takes over from
 * the hero button (drawn exactly over it), and it lands in the bar at `end`, when the hero button
 * would reach the bar's line. Up there, it is `x` px across and `scale` times the hero button's
 * size away from its place in the bar (its top-right corner, its transform origin).
 */
type Glide = {
  start: number
  end: number
  x: number
  scale: number
  /** Viewport line the hero button's top crosses at `start`. */
  line: number
}

/**
 * The hero's registrations button docked in the menu bar (Figma: at the right end of the bar,
 * centred on it). Its move is tied to the scroll, not to a timer: over the last stretch before
 * the hero button would reach the bar, a copy fixed in the bar takes over from it, keeps rising
 * with the page (1 px per px scrolled, so the hand-over is seamless) and glides across to land in
 * the bar just as it gets there. Scrolling back plays it backwards, at the speed of the scroll.
 *
 * Cheap by design: scroll-driven Web Animations (a `ScrollTimeline` on the page), of `translate`,
 * `transform` and `opacity` only, which the browser runs on the compositor, in step with the
 * scroll, without any JavaScript while scrolling. Browsers without them get the same frames from
 * a passive scroll listener. The geometry is measured once, and again on resize or when the hero
 * canvas is dragged. With reduced motion, the button just swaps places. Hidden while the menu is
 * open (it would sit over the menu's wordmark) and on other pages than the landing page.
 */
export function RegistrationsDock() {
  const pathname = usePathname()
  const { open } = useMenu()
  const state = useRegistrationsPhase()
  const reduceMotion = useReducedMotion()
  const riseRef = useRef<HTMLDivElement>(null)
  const glideRef = useRef<HTMLDivElement>(null)
  const phase = state?.phase.status === "closed" ? null : state?.phase
  const active = pathname === "/" && !!phase

  useEffect(() => {
    const riseElement = riseRef.current
    const glideElement = glideRef.current
    const container = riseElement?.parentElement
    const slot = document.querySelector<HTMLElement>("[data-registrations-slot]")
    if (!active || !riseElement || !glideElement || !container || !slot) return
    const rise: HTMLDivElement = riseElement
    const glide: HTMLDivElement = glideElement

    let animations: Animation[] = []
    let observer: IntersectionObserver | null = null
    let removeFallback = () => {}

    function measure(): Glide {
      // The dock's place: its top-right corner, transforms aside (offsets ignore them).
      const box = container!.getBoundingClientRect()
      const right = box.left + rise!.offsetLeft + rise!.offsetWidth
      const top = box.top + rise!.offsetTop
      const scale = parseFloat(getComputedStyle(glide!.firstElementChild!).scale) || 1
      const width = rise!.offsetWidth * scale
      const hero = slot!.getBoundingClientRect()
      const end = Math.max(0, hero.top + window.scrollY - top)
      const x = hero.right - right
      const distance = reduceMotion
        ? 0
        : Math.min(GLIDE.max, Math.max(GLIDE.min, Math.abs(x) * GLIDE.share))
      const start = Math.max(0, end - distance)
      return { start, end, x, scale: hero.width / width, line: hero.top + window.scrollY - start }
    }

    /** One frame of the glide: `progress` 0 over the hero button, 1 in the bar. */
    const frames = ({ start, end, x, scale }: Glide) => ({
      rise: { translate: [`0px ${end - start}px`, "0px 0px"] },
      glide: { transform: [`translateX(${x}px) scale(${scale})`, "translateX(0px) scale(1)"] },
    })

    let current: Glide | null = null

    /** (Re)creates the glide, unless the geometry is unchanged. */
    function build() {
      const geometry = measure()
      const same =
        current &&
        (Object.keys(geometry) as (keyof Glide)[]).every(
          (key) => Math.abs(geometry[key] - current![key]) < 0.5,
        )
      if (same) return
      teardown()
      current = geometry
      const { start, end } = geometry
      const { rise: riseFrames, glide: glideFrames } = frames(geometry)

      // Who is shown: the hero button before `start`, the dock from there (a 1px cross-fade).
      if (typeof ScrollTimeline === "function") {
        const timeline = new ScrollTimeline({ source: document.documentElement, axis: "block" })
        const range = (from: number, to: number): ScrollAnimationOptions => ({
          timeline,
          rangeStart: `${from}px`,
          rangeEnd: `${Math.max(to, from + 1)}px`,
          fill: "both",
        })
        animations = [
          rise.animate({ opacity: [0, 1] }, range(start, start + 1)),
          slot!.animate({ opacity: [1, 0] }, range(start, start + 1)),
        ]
        if (end > start) {
          animations.push(
            rise.animate(riseFrames, range(start, end)),
            glide.animate(glideFrames, { ...range(start, end), easing: GLIDE_EASING }),
          )
        }
      } else {
        removeFallback = followScroll(geometry)
      }

      // Clicks, focus and screen readers go to the copy that is shown (the hero button's top
      // above the hand-over line, or the button out of view, the canvas dragged away).
      observer = new IntersectionObserver(
        ([entry]) => {
          const docked = !entry.isIntersecting || entry.boundingClientRect.top < geometry.line
          rise.inert = !docked
          slot!.inert = docked
        },
        {
          rootMargin: `${-Math.max(0, Math.floor(geometry.line))}px 0px 0px 0px`,
          threshold: [0, 1],
        },
      )
      observer.observe(slot!)
    }

    /** Without scroll timelines: the same frames, set from a passive scroll listener. */
    function followScroll(geometry: Glide) {
      const { start, end, x, scale } = geometry
      let last = -1
      const update = () => {
        const span = end - start
        const progress = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / span)) : 1
        const shown = window.scrollY >= start
        const key = shown ? progress : -1
        if (key === last) return
        last = key
        rise!.style.opacity = shown ? "1" : "0"
        slot!.style.opacity = shown ? "0" : "1"
        const eased = easeInOutCubic(progress)
        rise!.style.translate = `0px ${(end - start) * (1 - progress)}px`
        glide!.style.transform = `translateX(${x * (1 - eased)}px) scale(${scale + (1 - scale) * eased})`
      }
      update()
      window.addEventListener("scroll", update, { passive: true })
      return () => {
        window.removeEventListener("scroll", update)
        for (const element of [rise!, glide!, slot!]) {
          element.style.opacity = ""
          element.style.translate = ""
          element.style.transform = ""
        }
      }
    }

    function teardown() {
      animations.forEach((animation) => animation.cancel())
      animations = []
      observer?.disconnect()
      removeFallback()
      removeFallback = () => {}
    }

    build()
    // Measured again (only rebuilt if anything moved) once the headline's fade-in has settled the
    // button, on resize, and whenever a scroll ends: the page's, or the hero canvas dragged.
    const settled = window.setTimeout(build, 1000)
    window.addEventListener("resize", build)
    window.addEventListener("scrollend", build, { capture: true })
    return () => {
      window.clearTimeout(settled)
      window.removeEventListener("resize", build)
      window.removeEventListener("scrollend", build, { capture: true })
      teardown()
      slot.inert = false
    }
  }, [active, reduceMotion])

  if (!active || !phase || !state) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      {/* Centred on the bar, scaled with it (the Figma 85px bar: 1, never under 0.75). */}
      <div
        ref={riseRef}
        inert
        className={cn(
          "absolute right-(--menu-left) opacity-0",
          "[--dock-scale:clamp(0.75,tan(atan2(var(--menu-size),85px)),1)]",
          "top-[calc(var(--menu-top)+var(--menu-size)/2-32.1375px*var(--dock-scale))]",
        )}
      >
        <div ref={glideRef} className="origin-top-right">
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
    </div>
  )
}
