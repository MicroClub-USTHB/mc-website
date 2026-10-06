"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion, type AnimationPlaybackControls } from "motion/react"

import { cn } from "@/lib/utils"

/** Whether the chain should move: on screen and motion allowed. */
const ChainPlayingContext = createContext(false)

/**
 * Box of the event chain: plays its slices while it is on screen, pauses them offscreen, and
 * never plays them when the user prefers reduced motion (the chain then stays still).
 */
export function ChainViewport({ className, ...props }: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduceMotion = useReducedMotion()

  return (
    <ChainPlayingContext value={inView && !reduceMotion}>
      <div ref={ref} className={cn(className)} {...props} />
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
 *
 * Depth only changes when needed: a slice drops behind everything when it wraps (offscreen),
 * then all slices rise together when the loop restarts, so the slice further down always stays
 * in front without touching every `z-index` at each step.
 */
export function ChainSlot({
  index,
  slots,
  stepDuration,
  step,
  className,
  style,
  children,
}: {
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
    if (playingRef.current) animation.play()
    controls.current = animation

    return () => {
      animation.stop()
      controls.current = null
    }
  }, [index, slots, stepDuration, step.x, step.y])

  useEffect(() => {
    playingRef.current = playing
    if (playing) controls.current?.play()
    else controls.current?.pause()
  }, [playing])

  return (
    <div
      ref={ref}
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
