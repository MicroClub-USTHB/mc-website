"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useLenis } from "lenis/react"

import { Headline } from "@/components/hero/headline"
import { HEADLINE_SIZE, HERO_CANVAS, HERO_ITEMS } from "@/const/hero"

const noSubscription = () => () => {}

/**
 * Where the hero draws the headline's centre in its first screen (100% wide, 100svh high): the
 * canvas scrolled to centre its first view, clamped to the canvas edges like the scroll itself
 * (screens wider than the canvas see it from its left edge). The same on every screen, from the
 * server HTML on, so the splash headline is already where the hero's is.
 */
const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, initialView } = HERO_CANVAS
const HEADLINE_ITEM = HERO_ITEMS.find((item) => item.id === "headline")!
const VIEW_CENTER = {
  x: initialView.x + initialView.width / 2,
  y: initialView.y + initialView.height / 2,
}
const HEADLINE_POSITION = {
  left: `calc(${HEADLINE_ITEM.x + HEADLINE_SIZE.width / 2}px - clamp(0px, ${VIEW_CENTER.x}px - 50%, ${CANVAS_WIDTH}px - 100%))`,
  top: `calc(${HEADLINE_ITEM.y + HEADLINE_SIZE.height / 2}px - clamp(0px, ${VIEW_CENTER.y}px - 50%, ${CANVAS_HEIGHT}px - 100%))`,
}

/** Where the visitor left the page (`{ path, y }`), saved as it unloads, read on its next load. */
const SCROLL_KEY = "mc-scroll"

/**
 * Runs as the HTML is parsed, before the first paint: the splash introduces the hero, so it is
 * skipped (`data-splash-skip` on the root, hidden by `globals.css`) when the visitor is not
 * arriving on it: a link to a section (`/#about`), or a reload / back to the page left scrolled
 * down, which the browser then puts back where it was. A history entry visited before has a state
 * (the router's): some returns to it report a plain navigation.
 */
const SKIP_SCRIPT = `(()=>{try{const r=document.documentElement;if(location.hash.length>1){r.dataset.splashSkip="";return}const n=performance.getEntriesByType("navigation")[0];if(!(n&&(n.type==="reload"||n.type==="back_forward"))&&history.state===null)return;const s=JSON.parse(sessionStorage.getItem("${SCROLL_KEY}")||"null");if(s&&s.path===location.pathname&&s.y>0)r.dataset.splashSkip=""}catch{}})()`

const subscribeToSkip = noSubscription
const isSkipped = () => document.documentElement.hasAttribute("data-splash-skip")

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const subscribeToMotion = (onChange: () => void) => {
  const query = matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * Splash screen of a page load: the hero headline alone, where the hero draws it, plays its
 * letters-to-icons animation (the only place it plays: the hero draws it as it ends), then the
 * screen fades out on the page (opacity only). It is drawn over the page, not the page hidden: the
 * page loads and paints underneath as usual (its largest paint is not delayed), and its headline is
 * lined up on the hero's before the fade, so the headline stays still while the rest appears.
 * Only on a load of the page that arrives on the hero (in the server HTML, see `SKIP_SCRIPT`), not
 * after a navigation inside the site, and not with reduced motion (nothing to watch). The page does
 * not scroll meanwhile (`globals.css`).
 */
export function Splash() {
  // True in the server HTML and while it hydrates: the splash then stays until it fades.
  const fromServer = useSyncExternalStore(
    noSubscription,
    () => false,
    () => true,
  )
  const [phase, setPhase] = useState<"playing" | "leaving" | "gone">(
    fromServer ? "playing" : "gone",
  )
  const reduceMotion = useSyncExternalStore(
    subscribeToMotion,
    () => matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
  // Set before the first paint by `SKIP_SCRIPT`; false while hydrating, like the server HTML.
  const skipped = useSyncExternalStore(subscribeToSkip, isSkipped, () => false)
  const ref = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const active = phase !== "gone" && !reduceMotion && !skipped

  // Where the visitor leaves the page, for the next load (`SKIP_SCRIPT`).
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(
          SCROLL_KEY,
          JSON.stringify({ path: location.pathname, y: Math.round(scrollY) }),
        )
      } catch {}
    }
    addEventListener("pagehide", save)
    return () => removeEventListener("pagehide", save)
  }, [])

  // No scrolling meanwhile: Lenis stopped, and touch scrolling (iOS scrolls past `overflow: hidden`).
  useEffect(() => {
    if (!active) return
    lenis?.stop()
    const block = (event: TouchEvent) => event.preventDefault()
    document.addEventListener("touchmove", block, { passive: false })
    return () => {
      document.removeEventListener("touchmove", block)
      lenis?.start()
    }
  }, [active, lenis])

  if (!active) return null

  const leave = () => {
    const splash = ref.current
    const copy = splash?.querySelector<HTMLElement>("[data-headline]")
    const original = document.querySelector<HTMLElement>("#hero [data-headline]")
    if (copy && original) {
      // Lined up to the subpixel on the hero's headline (when it is in view): the scroll rounds.
      const from = copy.getBoundingClientRect()
      const to = original.getBoundingClientRect()
      if (to.bottom > 0 && to.top < innerHeight) {
        copy.style.translate = `${to.left - from.left}px ${to.top - from.top}px`
      }
    }
    setPhase("leaving")
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      <div
        ref={ref}
        aria-hidden
        data-splash=""
        data-leaving={phase === "leaving" || undefined}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget) setPhase("gone")
        }}
        className="fixed inset-0 z-70 bg-background transition-opacity duration-700 ease-in-out-quart data-leaving:pointer-events-none data-leaving:opacity-0 motion-reduce:hidden"
      >
        {/* The hero's first screen, the headline centred on its point (wider than a phone, it
          overflows its zero-size box evenly on both sides). */}
        <div className="absolute inset-x-0 top-0 h-svh">
          <div
            className="absolute flex size-0 items-center justify-center"
            style={HEADLINE_POSITION}
          >
            <Headline animated onSettled={leave} />
          </div>
        </div>
      </div>
    </>
  )
}
