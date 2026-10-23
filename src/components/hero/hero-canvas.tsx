"use client"

import { useEffect, useRef, useState } from "react"
import { useLenis } from "lenis/react"

import { XIcon } from "@/components/icons/x"
import { McButton } from "@/components/ui/mc-button"
import { CanvasNavigator, type NavigatorHandle } from "@/components/hero/canvas-navigator"
import { ScrollHint } from "@/components/hero/scroll-hint"
import { HERO_CANVAS } from "@/const/hero"
import { cn } from "@/lib/utils"

/** Elements whose pointer presses are theirs, not a canvas drag. */
const INTERACTIVE =
  "button, a, input, label, textarea, [contenteditable='true'], audio, [data-sticker], [data-body]"

const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, gridSpacing, initialView } = HERO_CANVAS

/** Centre of the first view (Figma "Desktop - 21"), in fractions of the canvas. */
const START = {
  x: (initialView.x + initialView.width / 2) / CANVAS_WIDTH,
  y: (initialView.y + initialView.height / 2) / CANVAS_HEIGHT,
}

/**
 * Hero whiteboard, explored like significa.co/careers: the canvas is larger than the screen and
 * starts on the Figma first view (`HERO_CANVAS.initialView`).
 *
 * - Mouse: drag anywhere to pan, 1:1 with the pointer (grab / grabbing cursor), clamped to the
 *   canvas. The page wheel keeps scrolling the page.
 * - Touch: a swipe keeps scrolling the page (the canvas never traps it). The navigator opens an
 *   explore mode that fills the screen, panned with native touch scrolling and its momentum, with
 *   the page behind locked; the close button or Escape leaves it.
 * - Navigator (bottom left): shows the visible part of the canvas; drag or click it to jump there.
 *
 * The visible area is the scroll position of the viewport (overflow hidden, so only this code
 * moves it): panning is native scrolling, no transform is animated per frame.
 */
export function HeroCanvas({ children }: { children?: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const navigatorRef = useRef<NavigatorHandle>(null)
  const [exploring, setExploring] = useState(false)
  const [grabbing, setGrabbing] = useState(false)
  const lenis = useLenis()

  /** Keeps the navigator in sync with the visible area. */
  function sync() {
    const viewport = viewportRef.current
    if (!viewport) return
    navigatorRef.current?.update({
      x: viewport.scrollLeft / CANVAS_WIDTH,
      y: viewport.scrollTop / CANVAS_HEIGHT,
      width: Math.min(1, viewport.clientWidth / CANVAS_WIDTH),
      height: Math.min(1, viewport.clientHeight / CANVAS_HEIGHT),
    })
  }

  /** Scrolls so that the canvas point at fractions (`fx`, `fy`) is at the centre of the view. */
  function centerOn(fx: number, fy: number) {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollLeft = fx * CANVAS_WIDTH - viewport.clientWidth / 2
    viewport.scrollTop = fy * CANVAS_HEIGHT - viewport.clientHeight / 2
    sync()
  }

  // Start on the Figma first view, and keep the same centre when the view is resized (or enters explore mode).
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    let center = START
    centerOn(center.x, center.y)
    const remember = () => {
      center = {
        x: (viewport.scrollLeft + viewport.clientWidth / 2) / CANVAS_WIDTH,
        y: (viewport.scrollTop + viewport.clientHeight / 2) / CANVAS_HEIGHT,
      }
    }
    viewport.addEventListener("scroll", remember, { passive: true })
    const observer = new ResizeObserver(() => centerOn(center.x, center.y))
    observer.observe(viewport)
    return () => {
      viewport.removeEventListener("scroll", remember)
      observer.disconnect()
    }
    // `centerOn` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Explore mode: the page behind stays still, Escape leaves it.
  useEffect(() => {
    if (!exploring) return
    lenis?.stop()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExploring(false)
    }
    // The menu bar stays usable over the canvas: opening the menu (to go to another section) or
    // following a link from the bar leaves the explore mode first.
    const onBarClick = (event: MouseEvent) => {
      if ((event.target as Element).closest("header a, header button")) setExploring(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("click", onBarClick, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("click", onBarClick, true)
      lenis?.start()
    }
  }, [exploring, lenis])

  /** Mouse (and pen) drag to pan; touch is left to the page, or to native scrolling while exploring. */
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || event.button !== 0) return
    // Controls on the canvas keep their own clicks, text selection and editing.
    if ((event.target as Element).closest(INTERACTIVE)) return
    const viewport = event.currentTarget
    viewport.setPointerCapture(event.pointerId)
    setGrabbing(true)
    let last = { x: event.clientX, y: event.clientY }

    const move = (moveEvent: PointerEvent) => {
      viewport.scrollLeft -= moveEvent.clientX - last.x
      viewport.scrollTop -= moveEvent.clientY - last.y
      last = { x: moveEvent.clientX, y: moveEvent.clientY }
      sync()
    }
    const end = () => {
      setGrabbing(false)
      viewport.removeEventListener("pointermove", move)
      viewport.removeEventListener("pointerup", end)
      viewport.removeEventListener("pointercancel", end)
    }
    viewport.addEventListener("pointermove", move)
    viewport.addEventListener("pointerup", end)
    viewport.addEventListener("pointercancel", end)
  }

  return (
    <div
      data-exploring={exploring || undefined}
      className={cn("relative h-full", exploring && "fixed inset-0 z-60 h-auto bg-background")}
    >
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onScroll={sync}
        data-lenis-prevent={exploring || undefined}
        className={cn(
          "absolute inset-0 overflow-hidden select-none",
          // Native touch panning (with momentum) only while exploring.
          exploring
            ? "[scrollbar-width:none] overflow-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
            : "touch-pan-y",
          grabbing ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <div
          // Opaque (bg-background under the dots): the browser can then scroll it on the compositor,
          // panning without repainting the board.
          className="relative bg-background"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            // Figma dot grid: 4px dots, measured #f7f7f7 on white.
            backgroundImage: "radial-gradient(var(--color-canvas-dot) 2px, transparent 2.25px)",
            backgroundSize: `${gridSpacing}px ${gridSpacing}px`,
          }}
        >
          {children}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-site px-4 pb-4 sm:px-6 sm:pb-6 lg:px-20 lg:pb-16">
        <CanvasNavigator
          ref={navigatorRef}
          aspectRatio={CANVAS_WIDTH / CANVAS_HEIGHT}
          onNavigate={centerOn}
          onExplore={exploring ? undefined : () => setExploring(true)}
          className="pointer-events-auto"
        />
      </div>

      {/* Figma: 95px above the bottom of the 1024px frame, centred. */}
      {!exploring && (
        <ScrollHint className="absolute bottom-[95px] left-1/2 -translate-x-1/2 max-lg:bottom-6 low:bottom-6" />
      )}

      {exploring && (
        <McButton
          variant="secondary"
          icon="only"
          iconDefinition={<XIcon size={20} />}
          aria-label="Close the canvas"
          onClick={() => setExploring(false)}
          // Under the fixed menu bar (which stays over the canvas, with its registrations button).
          className="absolute top-[calc(var(--menu-top)+var(--menu-size)+0.75rem)] right-(--menu-left) size-11"
        />
      )}
    </div>
  )
}
