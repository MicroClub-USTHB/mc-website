"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Pixelify_Sans } from "next/font/google"
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react"

import { EASE_IN_OUT_QUART, EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"
import arrow from "@/assets/hero/level-up/arrow.svg"

/** Figma "+1 LVL" font. */
const pixelify = Pixelify_Sans({ weight: "500", subsets: ["latin"] })

/** Seconds to hold for a level up, to drain back on release, and to show "+1 LVL". */
const HOLD = 1.6
const RELEASE = 0.45
const CELEBRATE = 1.2
const FADE_OUT = 0.6

/** Figma "STAR": a 9×9 pixel sparkle, [column, row, shade]. */
const STAR_PIXELS: [number, number, "base" | "light" | "dark"][] = [
  [4, 0, "base"],
  [3, 1, "base"],
  [4, 1, "light"],
  [5, 1, "base"],
  [3, 2, "base"],
  [4, 2, "base"],
  [5, 2, "base"],
  [1, 3, "base"],
  [2, 3, "base"],
  [3, 3, "base"],
  [4, 3, "base"],
  [5, 3, "light"],
  [6, 3, "base"],
  [7, 3, "base"],
  [0, 4, "base"],
  [1, 4, "dark"],
  [2, 4, "base"],
  [3, 4, "base"],
  [4, 4, "base"],
  [5, 4, "base"],
  [6, 4, "base"],
  [7, 4, "light"],
  [8, 4, "base"],
  [1, 5, "base"],
  [2, 5, "base"],
  [3, 5, "dark"],
  [4, 5, "base"],
  [5, 5, "base"],
  [6, 5, "base"],
  [7, 5, "base"],
  [3, 6, "base"],
  [4, 6, "base"],
  [5, 6, "base"],
  [3, 7, "base"],
  [4, 7, "dark"],
  [5, 7, "base"],
  [4, 8, "base"],
]

const SHADES = { base: "fill-level", light: "fill-level-light", dark: "fill-level-dark" }

/** Figma sparkles around "+1 LVL": top-left corner and size, in px. */
const SPARKLES = [
  { left: 170, top: 16, size: 28 },
  { left: 0, top: 59, size: 15 },
  { left: 168, top: 63, size: 11 },
  { left: 12, top: 3, size: 19 },
  { left: 25, top: 34, size: 10 },
  { left: 87, top: 69, size: 11.556 },
  { left: 136, top: 0, size: 11.556 },
  { left: 85, top: 11.78, size: 8 },
]

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 9 9"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {STAR_PIXELS.map(([x, y, shade]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} className={SHADES[shade]} />
      ))}
    </svg>
  )
}

/**
 * Figma "LEVEL UP BUTTON": press and hold the button and a teal bar fills it (releasing early
 * drains it back). Once full, "+1 LVL" pops above it with pixel sparkles, then fades out and the
 * button empties for another go. Works with a mouse, a finger, or Space / Enter.
 */
export function LevelUp() {
  const fill = useMotionValue(0)
  // While filling, the bar sits 1px inside the button (Figma "while holding"); once full it covers
  // the whole button (Figma completed frame), hiding the dark edge.
  const width = useTransform(fill, (value) => (value >= 1 ? "100.29%" : `${value * 99.86}%`))
  const inset = useTransform(fill, (value) => (value >= 1 ? "0%" : "2.22%"))
  const left = useTransform(fill, (value) => (value >= 1 ? "0%" : "0.43%"))
  const animation = useRef<ReturnType<typeof animate> | null>(null)
  const [holding, setHolding] = useState(false)
  const [leveledUp, setLeveledUp] = useState(false)

  // After the celebration, "+1 LVL" fades out and the button drains back to its default state.
  useEffect(() => {
    if (!leveledUp) return
    const timer = setTimeout(() => {
      setLeveledUp(false)
      animation.current = animate(fill, 0, { duration: FADE_OUT, ease: EASE_IN_OUT_QUART })
    }, CELEBRATE * 1000)
    return () => clearTimeout(timer)
  }, [leveledUp, fill])

  function start() {
    if (leveledUp || holding) return
    setHolding(true)
    animation.current?.stop()
    animation.current = animate(fill, 1, {
      duration: HOLD * (1 - fill.get()),
      ease: "linear",
      onComplete: () => {
        setHolding(false)
        setLeveledUp(true)
      },
    })
  }

  function release() {
    if (!holding) return
    setHolding(false)
    animation.current?.stop()
    animation.current = animate(fill, 0, { duration: RELEASE, ease: EASE_OUT_QUART })
  }

  return (
    <div className="relative flex w-[233.337px] flex-col items-center gap-[5px] select-none">
      <div aria-live="polite" className="relative h-[80.556px] w-[198px]">
        <AnimatePresence>
          {leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: FADE_OUT, ease: EASE_OUT_QUART }}
              className="absolute inset-0"
            >
              <p
                className={cn(
                  pixelify.className,
                  "absolute top-[21px] left-[35px] flex gap-[10.737px] text-[40.263px] leading-[51px] font-medium whitespace-nowrap text-level drop-shadow-[0_4px_1.8px_rgb(0_193_198/0.28)]",
                )}
              >
                <span>+1</span>
                <span>LVL</span>
                <span className="sr-only">: level up!</span>
              </p>
              {SPARKLES.map(({ left, top, size }, i) => (
                <motion.span
                  key={`${left}-${top}`}
                  className="absolute"
                  style={{ left, top }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1], rotate: [0, 90, 90] }}
                  transition={{ duration: 0.5, delay: 0.05 * i, ease: EASE_OUT_QUART }}
                >
                  <Star size={size} />
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        aria-label="Hold to level up"
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          start()
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault()
            start()
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") release()
        }}
        onBlur={release}
        onContextMenu={(event) => event.preventDefault()}
        animate={{ scale: holding ? 0.97 : 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
        className="relative h-[45px] w-[231.337px] cursor-pointer touch-none rounded-lg bg-level-button shadow-[0_1.212px_2.425px_0_rgb(10_13_18/0.05)] outline-none [-webkit-touch-callout:none] focus-visible:ring-4 focus-visible:ring-secondary"
      >
        {/* Inner glow. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_4.6px_0_var(--color-level-glow)]"
        />
        {/* Fill: Figma highlight and fill layers (rendered there as a solid teal, measured). */}
        <motion.span
          aria-hidden
          style={{ width, top: inset, bottom: inset, left }}
          className="pointer-events-none absolute overflow-hidden rounded-[7px]"
        >
          <span className="absolute inset-0 bg-level shadow-[inset_0_0_10px_0_white]" />
          <span className="absolute inset-0 bg-level shadow-[inset_0_0_10px_0_rgb(255_255_255/0.25)]" />
        </motion.span>
        <span className="relative flex items-center justify-center gap-2.5 px-7 text-[16.974px] leading-[24.248px] font-medium whitespace-nowrap text-muted uppercase">
          Hold to level up
          <span className="grid size-[13.337px] place-items-center">
            <Image
              src={arrow}
              alt=""
              unoptimized
              draggable={false}
              className="max-w-none -rotate-90"
            />
          </span>
        </span>
      </motion.button>
    </div>
  )
}
