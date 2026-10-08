"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react"

import { useActiveEvent, useSetActiveEvent } from "@/components/featured-events/active-event"
import { useEventDialogOpen, useOpenEvent } from "@/components/featured-events/event-dialog"
import { EASE_IN_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/** Whether the chain should move: on screen, no event card open, and motion allowed. */
const ChainPlayingContext = createContext(false)
/** Playback rate of every slice: 1 while moving, eased down to 0 while a slice is hovered. */
const ChainSpeedContext = createContext<MotionValue<number> | null>(null)

/** Visible slanted part of a slice (see `SlantedImage`), the only part that takes the pointer. */
const SLICE_SELECTOR = '[data-slot="slanted-frame"]'

/** How often the spotlight looks for the slice at the center of the chain, in ms. */
const FOCUS_INTERVAL = 100
/**
 * The spotlight point sits this many slots up the chain from its center (toward the top right,
 * where slices come from), so a slice gets colored a bit before it reaches the middle and loses
 * its color a bit before it leaves it. One slot is 6.64u right and 3.76u up, with
 * u = max(1% width, 1.1% height) of the chain box (see `EventChain`).
 */
const FOCUS_LEAD = 0.5
const SLOT = { x: 6.64, y: -3.76 }

/**
 * Event id of the slice whose visible part is centered closest to the spotlight point of `box`.
 * Picking by slice centers (not by the slice drawn at that point, often the next one overlapping
 * it) keeps the colored slice in the middle of the screen.
 */
function centeredEvent(box: HTMLElement) {
  const rect = box.getBoundingClientRect()
  const u = Math.max(rect.width / 100, (1.1 * rect.height) / 100)
  const x = rect.left + rect.width / 2 + FOCUS_LEAD * SLOT.x * u
  const y = rect.top + rect.height / 2 + FOCUS_LEAD * SLOT.y * u
  let closest: Element | null = null
  let closestDistance = Infinity
  for (const slice of box.querySelectorAll(SLICE_SELECTOR)) {
    const r = slice.getBoundingClientRect()
    const distance = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y)
    if (distance < closestDistance) {
      closest = slice
      closestDistance = distance
    }
  }
  return closest?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId ?? null
}

/**
 * Box of the event chain: plays its slices while it is on screen, pauses them offscreen or while
 * an event card is open, and never plays them when the user prefers reduced motion (the chain
 * then stays still). Clicking a slice opens its event card (see `EventDialogProvider`).
 *
 * Hovering a slice (mouse or pen) slows the whole chain down to a stop, and leaving it speeds the
 * chain back up, by easing the slices' playback rate, so the photo under the pointer stays put.
 * The hovered slice's event is the active event (see `ActiveEventProvider`), none otherwise.
 */
export function ChainViewport({ className, ...props }: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const speed = useMotionValue(1)
  const setActiveEvent = useSetActiveEvent()
  const openEvent = useOpenEvent()
  const dialogOpen = useEventDialogOpen()

  // Last pointer position over the chain, to find the slice under it once the chain has stopped.
  const pointer = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    /*
     * The chain keeps sliding a few pixels while it slows down, so another slice may end up under
     * the still pointer: once stopped, take the slice really under it (or resume if there is none).
     */
    function settleHover() {
      const position = pointer.current
      const element = position && document.elementFromPoint(position.x, position.y)
      const slice = element?.closest(SLICE_SELECTOR)
      const eventId = slice?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId
      if (!eventId) setHovered(false)
      setActiveEvent(eventId ?? null)
    }

    const animation = animate(speed, hovered ? 0 : 1, {
      duration: 0.6,
      ease: EASE_IN_OUT_QUART,
      onComplete: hovered ? settleHover : undefined,
    })
    return () => animation.stop()
  }, [hovered, speed, setActiveEvent])

  /*
   * Delegated on real pointer moves only (non-zero movement): the browser also reports hover when
   * a moving slice slides under a still pointer, or when the page scrolls under it, and a still
   * pointer somewhere on the chain's path would otherwise end up pausing it for good.
   */
  function updateHover(event: React.PointerEvent) {
    if (event.pointerType === "touch") return
    if (event.movementX === 0 && event.movementY === 0) return
    pointer.current = { x: event.clientX, y: event.clientY }
    const slice = event.target instanceof Element ? event.target.closest(SLICE_SELECTOR) : null
    setHovered(slice !== null)
    setActiveEvent(slice?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId ?? null)
  }

  function clearHover() {
    setHovered(false)
    setActiveEvent(null)
  }

  /*
   * Touch-only screens (no mouse or trackpad) have no hover: the slice passing through the center
   * of the chain becomes the active event instead (colored, named in the panel), while on screen.
   */
  useEffect(() => {
    const box = ref.current
    if (!box || !inView || dialogOpen || window.matchMedia("(any-pointer: fine)").matches) return

    function spotlight() {
      const eventId = centeredEvent(box!)
      if (eventId) setActiveEvent(eventId)
    }

    spotlight()
    const timer = window.setInterval(spotlight, FOCUS_INTERVAL)
    return () => window.clearInterval(timer)
  }, [inView, dialogOpen, setActiveEvent])

  function openClickedEvent(event: React.MouseEvent) {
    const slice = event.target instanceof Element ? event.target.closest(SLICE_SELECTOR) : null
    const eventId = slice?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId
    if (eventId) openEvent(eventId)
  }

  return (
    <ChainPlayingContext value={inView && !dialogOpen && !reduceMotion}>
      <ChainSpeedContext value={speed}>
        <div
          ref={ref}
          onPointerMove={updateHover}
          onPointerLeave={clearHover}
          onClick={openClickedEvent}
          className={cn(className)}
          {...props}
        />
      </ChainSpeedContext>
    </ChainPlayingContext>
  )
}

/**
 * A slice's two animations, driven together: its movement (Motion, `transform` on the compositor)
 * and its depth (native Web Animation, as Motion does not animate `z-index` next to an accelerated
 * `transform`). Both run on the document timeline, so setting their time, speed and play state
 * together keeps them in sync.
 */
class SliceAnimations {
  constructor(
    private movement: AnimationPlaybackControls,
    private depth: Animation,
  ) {}

  play() {
    this.movement.play()
    this.depth.play()
  }

  pause() {
    this.movement.pause()
    this.depth.pause()
  }

  stop() {
    this.movement.stop()
    this.depth.cancel()
  }

  /** Seconds into the loop. */
  set time(seconds: number) {
    this.movement.time = seconds
    this.depth.currentTime = seconds * 1000
  }

  set speed(rate: number) {
    this.movement.speed = rate
    this.depth.playbackRate = rate
  }
}

/**
 * One slice of the chain, moving toward the bottom left in an infinite linear loop.
 *
 * Each slice runs its own Motion animation over the whole loop (`slots` steps of `stepDuration`
 * seconds): it starts at slot 0 (top right, offscreen), slides one `step` per slot (in % of its
 * own size) and wraps back offscreen. Its clock starts `index` steps in, so the slices stay one
 * slot apart. The `transform` is a full string, so Motion hands it to the browser (WAAPI): it runs
 * on the compositor, on the slice's own GPU layer (`will-change`), unaffected by main-thread work.
 * Its playback rate follows the chain speed, so all slices slow down and stop together.
 *
 * Depth only changes when needed: a slice drops behind everything when it wraps (offscreen),
 * then all slices rise together when the loop restarts, so the slice further down always stays
 * in front without touching every `z-index` at each step (see `SliceAnimations`).
 */
export function ChainSlot({
  eventId,
  index,
  slots,
  stepDuration,
  step,
  className,
  style,
  children,
}: {
  /** Event shown by the slice, made active when the slice is hovered. */
  eventId: string
  index: number
  slots: number
  stepDuration: number
  /** Move per slot, in % of the slice width (`x`) and height (`y`). */
  step: { x: number; y: number }
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const playing = useContext(ChainPlayingContext)
  const speed = useContext(ChainSpeedContext)
  if (!speed) throw new Error("ChainSlot must be rendered inside ChainViewport")
  const { activeId } = useActiveEvent()
  const animations = useRef<SliceAnimations>(null)
  const playingRef = useRef(playing)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const duration = slots * stepDuration
    const movement = animate(
      element,
      { transform: ["translate(0%, 0%)", `translate(${slots * step.x}%, ${slots * step.y}%)`] },
      { duration, ease: "linear", repeat: Infinity },
    )
    // Local slot runs 0 → slots; the slice has wrapped (drops behind) while it is below `index`.
    const wrapAt = index / slots
    const depth = element.animate(
      [
        { zIndex: index - slots },
        { zIndex: index - slots, offset: wrapAt },
        { zIndex: index, offset: wrapAt },
        { zIndex: index },
      ],
      { duration: duration * 1000, iterations: Infinity, easing: "linear" },
    )

    const slice = new SliceAnimations(movement, depth)
    slice.pause()
    slice.time = index * stepDuration
    slice.speed = speed.get()
    if (playingRef.current) slice.play()
    animations.current = slice

    return () => {
      slice.stop()
      animations.current = null
    }
  }, [index, slots, stepDuration, step.x, step.y, speed])

  useEffect(() => {
    playingRef.current = playing
    if (playing) animations.current?.play()
    else animations.current?.pause()
  }, [playing])

  useEffect(
    () =>
      speed.on("change", (value) => {
        if (animations.current) animations.current.speed = value
      }),
    [speed],
  )

  return (
    <div
      ref={ref}
      data-event-id={eventId}
      data-active={activeId === eventId || undefined}
      style={{
        ...style,
        // Resting place (slot `index`), also used before hydration and with reduced motion.
        transform: `translate(${index * step.x}%, ${index * step.y}%)`,
        zIndex: index,
      }}
      className={cn("group/tile will-change-transform", className)}
    >
      {children}
    </div>
  )
}
