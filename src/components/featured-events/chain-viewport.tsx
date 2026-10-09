"use client"

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react"
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type MotionValue,
  type ValueAnimationTransition,
} from "motion/react"

import { useActiveEvent, useSetActiveEvent } from "@/components/featured-events/active-event"
import { useEventDialogOpen, useOpenEvent } from "@/components/featured-events/event-dialog"
import { EASE_IN_OUT_QUART, EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/** Whether the chain should move: on screen, no event card open, and motion allowed. */
const ChainPlayingContext = createContext(false)
/** Playback rate of every slice: 1 while moving, eased down to 0 while a slice is hovered. */
const ChainSpeedContext = createContext<MotionValue<number> | null>(null)
/** Slices of the chain, registered by `ChainSlot` so the viewport can move them all at once. */
const ChainSlicesContext = createContext<Set<ChainSlice> | null>(null)
/** Shows an event in the chain, set by `ChainViewport` (see `ChainControlProvider`). */
const ShowEventContext = createContext<RefObject<((id: string) => void) | null> | null>(null)

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

/** Pointer travel, in px, before a press on the chain becomes a drag (shorter is a click). */
const DRAG_THRESHOLD = 6
/** Pointer moves of the last ms before release that give the throw velocity. */
const VELOCITY_WINDOW = 100
/** Seconds the chain keeps gliding after a throw. */
const GLIDE_DURATION = 1
/**
 * Initial slope of `EASE_OUT_QUART` (0.84 / 0.165): a glide of `velocity × duration / slope`
 * starts at the release velocity, so the chain leaves the pointer without a jolt.
 */
const EASE_OUT_QUART_SLOPE = 5

/** One slice of the chain, as registered by `ChainSlot`. */
type ChainSlice = {
  eventId: string
  animations: SliceAnimations
  element: HTMLElement
  /** Move per slot, in % of the slice width (`x`) and height (`y`). */
  step: { x: number; y: number }
  /** Seconds per slot. */
  stepDuration: number
  /** Loop time at which the slice sits in the middle of the chain. */
  centerTime: number
}

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

/** Event id of the slice really under a screen point (its visible part), if any. */
function eventAt(x: number, y: number) {
  const slice = document.elementFromPoint(x, y)?.closest(SLICE_SELECTOR)
  return slice?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId ?? null
}

/** Loop seconds matching a pointer move of `dx`, `dy` px, projected on the chain's direction. */
function dragSeconds(slice: ChainSlice, dx: number, dy: number) {
  const x = (slice.step.x / 100) * slice.element.offsetWidth
  const y = (slice.step.y / 100) * slice.element.offsetHeight
  return ((dx * x + dy * y) / (x * x + y * y)) * slice.stepDuration
}

/** Velocity of the chain offset over the last moves of a drag, in loop seconds per second. */
function releaseVelocity(samples: { time: number; offset: number }[], releasedAt: number) {
  const recent = samples.filter((sample) => releasedAt - sample.time <= VELOCITY_WINDOW)
  const first = recent[0]
  const last = recent.at(-1)
  if (!first || !last || last.time === first.time) return 0
  return ((last.offset - first.offset) / (last.time - first.time)) * 1000
}

/**
 * Lets the event list show an event in the chain (see `useShowEvent`). Wraps both the chain and
 * the list, which are siblings.
 */
export function ChainControlProvider({ children }: { children: React.ReactNode }) {
  const showEvent = useRef<((id: string) => void) | null>(null)
  return <ShowEventContext value={showEvent}>{children}</ShowEventContext>
}

/** Brings an event's slice to the middle of the chain and makes it the active event. */
export function useShowEvent() {
  const showEvent = useContext(ShowEventContext)
  return (id: string) => showEvent?.current?.(id)
}

/**
 * Box of the event chain: plays its slices while it is on screen, pauses them offscreen or while
 * an event card is open, and never plays them when the user prefers reduced motion (the chain
 * then stays still). Clicking a slice opens its event card (see `EventDialogProvider`).
 *
 * Hovering a slice (mouse or pen) slows the whole chain down to a stop, and leaving it speeds the
 * chain back up, by easing the slices' playback rate, so the photo under the pointer stays put.
 * The hovered slice's event is the active event (see `ActiveEventProvider`), none otherwise.
 *
 * The chain can be dragged (mouse, pen or a horizontal swipe; vertical swipes still scroll the
 * page) to move through the events faster: it follows the pointer along its diagonal and glides on
 * when thrown. `useShowEvent` (the event list) slides an event's slice to the middle and holds the
 * chain there until the pointer comes back over it. Both shift the time of every slice's loop by
 * the same offset, so the chain resumes from where it was left.
 */
export function ChainViewport({ className, ...props }: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [gliding, setGliding] = useState(false)
  // An event shown from the list: the chain holds it in the middle.
  const [pinned, setPinned] = useState(false)
  const speed = useMotionValue(1)
  // Seconds the chain has been moved by (drags, glides, jumps), on top of its own loop.
  const offset = useMotionValue(0)
  const [slices] = useState(() => new Set<ChainSlice>())
  const showEventRef = useContext(ShowEventContext)
  const setActiveEvent = useSetActiveEvent()
  const openEvent = useOpenEvent()
  const dialogOpen = useEventDialogOpen()

  // Last pointer position over the chain, to find the slice under it once the chain has stopped.
  const pointer = useRef<{ x: number; y: number } | null>(null)
  // Pointer pressed on the chain, until released: a drag once it has moved past the threshold.
  const press = useRef<{
    pointerId: number
    x: number
    y: number
    dragging: boolean
    samples: { time: number; offset: number }[]
  } | null>(null)
  // Set by a drag, so the click that ends it does not open the slice under the pointer.
  const dragged = useRef(false)
  const glide = useRef<AnimationPlaybackControls | null>(null)

  const stopped = hovered || dragging || gliding || pinned

  useEffect(() => {
    /*
     * The chain keeps sliding a few pixels while it slows down, so another slice may end up under
     * the still pointer: once stopped, take the slice really under it (or resume if there is none).
     */
    function settleHover() {
      if (press.current?.dragging) return
      const position = pointer.current
      const eventId = position && eventAt(position.x, position.y)
      if (!eventId) setHovered(false)
      setActiveEvent(eventId ?? null)
    }

    const animation = animate(speed, stopped ? 0 : 1, {
      duration: 0.6,
      ease: EASE_IN_OUT_QUART,
      onComplete: hovered ? settleHover : undefined,
    })
    return () => animation.stop()
  }, [stopped, hovered, speed, setActiveEvent])

  // Moves every slice along with the offset.
  useEffect(() => {
    let last = offset.get()
    return offset.on("change", (value) => {
      for (const slice of slices) slice.animations.shift(value - last)
      last = value
    })
  }, [offset, slices])

  function glideBy(seconds: number, transition: ValueAnimationTransition<number>) {
    glide.current?.stop()
    setGliding(true)
    glide.current = animate(offset, offset.get() + seconds, {
      ...transition,
      onComplete: () => setGliding(false),
    })
  }

  function stopGlide() {
    glide.current?.stop()
    glide.current = null
    setGliding(false)
  }

  useEffect(() => {
    if (!showEventRef) return

    // Slides the copy of the event closest to the middle there, the shortest way round the loop.
    showEventRef.current = (id) => {
      let target: { slice: ChainSlice; seconds: number } | null = null
      for (const slice of slices) {
        if (slice.eventId !== id) continue
        const seconds = slice.animations.secondsTo(slice.centerTime)
        if (!target || Math.abs(seconds) < Math.abs(target.seconds)) target = { slice, seconds }
      }
      if (!target) return

      // Stop the loop right away, so it does not drift the slice off the middle while it slows down.
      speed.jump(0)
      setPinned(true)
      setActiveEvent(id)
      if (reduceMotion) {
        stopGlide()
        offset.set(offset.get() + target.seconds)
        return
      }
      const slots = Math.abs(target.seconds / target.slice.stepDuration)
      glideBy(target.seconds, {
        duration: Math.min(0.6 + slots * 0.06, 1.6),
        ease: EASE_IN_OUT_QUART,
      })
    }
    return () => {
      showEventRef.current = null
    }
  })

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
    setPinned(false)
    setHovered(slice !== null)
    setActiveEvent(slice?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId ?? null)
  }

  function clearHover() {
    if (press.current?.dragging) return
    setHovered(false)
    setActiveEvent(null)
  }

  function startPress(event: React.PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return
    dragged.current = false
    press.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: false,
      samples: [],
    }
  }

  /** Moves the chain with a drag; false while the pointer is not dragging it (hover instead). */
  function dragChain(event: React.PointerEvent) {
    const current = press.current
    const slice = slices.values().next().value
    if (!current || current.pointerId !== event.pointerId || !slice) return false
    const dx = event.clientX - current.x
    const dy = event.clientY - current.y

    if (!current.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return false
      current.dragging = true
      dragged.current = true
      ref.current?.setPointerCapture(event.pointerId)
      stopGlide()
      speed.jump(0)
      setPinned(false)
      setDragging(true)
    }

    offset.set(offset.get() + dragSeconds(slice, dx, dy))
    current.x = event.clientX
    current.y = event.clientY
    current.samples.push({ time: event.timeStamp, offset: offset.get() })
    current.samples = current.samples.filter(
      (sample) => event.timeStamp - sample.time <= VELOCITY_WINDOW,
    )
    // The pointer is captured: find the slice under it by position.
    if (event.pointerType !== "touch") setActiveEvent(eventAt(event.clientX, event.clientY))
    return true
  }

  function endPress(event: React.PointerEvent) {
    const current = press.current
    if (!current || current.pointerId !== event.pointerId) return
    press.current = null
    if (!current.dragging) return

    setDragging(false)
    const velocity =
      event.type === "pointerup" ? releaseVelocity(current.samples, event.timeStamp) : 0
    if (velocity !== 0 && !reduceMotion) {
      glideBy((velocity * GLIDE_DURATION) / EASE_OUT_QUART_SLOPE, {
        duration: GLIDE_DURATION,
        ease: EASE_OUT_QUART,
      })
    }
    // Hover resumes from what is under the pointer now that the drag is over.
    if (event.pointerType !== "touch") {
      pointer.current = { x: event.clientX, y: event.clientY }
      const eventId = eventAt(event.clientX, event.clientY)
      setHovered(eventId !== null)
      setActiveEvent(eventId)
    }
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
    if (dragged.current) {
      dragged.current = false
      return
    }
    const slice = event.target instanceof Element ? event.target.closest(SLICE_SELECTOR) : null
    const eventId = slice?.closest<HTMLElement>("[data-event-id]")?.dataset.eventId
    if (eventId) openEvent(eventId)
  }

  return (
    <ChainPlayingContext value={inView && !dialogOpen && !reduceMotion}>
      <ChainSpeedContext value={speed}>
        <ChainSlicesContext value={slices}>
          <div
            ref={ref}
            onPointerDown={startPress}
            onPointerMove={(event) => dragChain(event) || updateHover(event)}
            onPointerUp={endPress}
            onPointerCancel={endPress}
            onPointerLeave={clearHover}
            onClick={openClickedEvent}
            // Drags move the chain: no text or image selection, no long-press menu on touch.
            className={cn("touch-pan-y select-none [-webkit-touch-callout:none]", className)}
            {...props}
          />
        </ChainSlicesContext>
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
    /** Seconds of one loop. */
    private duration: number,
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
  get time() {
    return (Number(this.depth.currentTime ?? 0) / 1000) % this.duration
  }

  set time(seconds: number) {
    const time = ((seconds % this.duration) + this.duration) % this.duration
    this.movement.time = time
    this.depth.currentTime = time * 1000
  }

  set speed(rate: number) {
    this.movement.speed = rate
    this.depth.playbackRate = rate
  }

  /** Moves the slice along the loop by `seconds` (backward when negative), wrapping around. */
  shift(seconds: number) {
    this.time = this.time + seconds
  }

  /** Shortest shift, in seconds (either way round the loop), that brings the slice to `time`. */
  secondsTo(time: number) {
    const seconds = (((time - this.time) % this.duration) + this.duration) % this.duration
    return seconds > this.duration / 2 ? seconds - this.duration : seconds
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
 *
 * The slice registers with `ChainViewport`, which shifts its loop when the chain is dragged.
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
  const slices = useContext(ChainSlicesContext)
  if (!speed || !slices) throw new Error("ChainSlot must be rendered inside ChainViewport")
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

    const slice = new SliceAnimations(movement, depth, duration)
    slice.pause()
    slice.time = index * stepDuration
    slice.speed = speed.get()
    if (playingRef.current) slice.play()
    animations.current = slice

    // Slot (slots - 1) / 2 is the middle of the chain (see `EventChain`).
    const entry = {
      eventId,
      animations: slice,
      element,
      step: { x: step.x, y: step.y },
      stepDuration,
      centerTime: ((slots - 1) / 2) * stepDuration,
    }
    slices.add(entry)

    return () => {
      slices.delete(entry)
      slice.stop()
      animations.current = null
    }
  }, [eventId, index, slots, stepDuration, step.x, step.y, speed, slices])

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
