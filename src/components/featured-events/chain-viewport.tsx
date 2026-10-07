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

import { useSetActiveEvent } from "@/components/featured-events/active-event"
import { EASE_IN_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/** Whether the chain should move: on screen and motion allowed. */
const ChainPlayingContext = createContext(false)
/** Playback rate of every slice: 1 while moving, eased down to 0 while a slice is hovered. */
const ChainSpeedContext = createContext<MotionValue<number> | null>(null)

/** Visible slanted part of a slice (see `SlantedImage`), the only part that takes the pointer. */
const SLICE_SELECTOR = '[data-slot="slanted-frame"]'

/**
 * Box of the event chain: plays its slices while it is on screen, pauses them offscreen, and
 * never plays them when the user prefers reduced motion (the chain then stays still).
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

  return (
    <ChainPlayingContext value={inView && !reduceMotion}>
      <ChainSpeedContext value={speed}>
        <div
          ref={ref}
          onPointerMove={updateHover}
          onPointerLeave={clearHover}
          className={cn(className)}
          {...props}
        />
      </ChainSpeedContext>
    </ChainPlayingContext>
  )
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
 * in front without touching every `z-index` at each step.
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
  const controls = useRef<AnimationPlaybackControls>(null)
  const playingRef = useRef(playing)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Local slot runs 0 → slots; the slice has wrapped while it is below `index`.
    const wrapAt = index / slots
    const animation = animate(
      element,
      {
        transform: ["translate(0%, 0%)", `translate(${slots * step.x}%, ${slots * step.y}%)`],
        zIndex: [index - slots, index - slots, index, index],
      },
      {
        duration: slots * stepDuration,
        ease: "linear",
        repeat: Infinity,
        zIndex: { times: [0, wrapAt, wrapAt, 1] },
      },
    )
    animation.pause()
    animation.time = index * stepDuration
    animation.speed = speed.get()
    if (playingRef.current) animation.play()
    controls.current = animation

    return () => {
      animation.stop()
      controls.current = null
    }
  }, [index, slots, stepDuration, step.x, step.y, speed])

  useEffect(() => {
    playingRef.current = playing
    if (playing) controls.current?.play()
    else controls.current?.pause()
  }, [playing])

  useEffect(
    () =>
      speed.on("change", (value) => {
        if (controls.current) controls.current.speed = value
      }),
    [speed],
  )

  return (
    <div
      ref={ref}
      data-event-id={eventId}
      style={{
        ...style,
        // Resting place (slot `index`), also used before hydration and with reduced motion.
        transform: `translate(${index * step.x}%, ${index * step.y}%)`,
        zIndex: index,
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </div>
  )
}
