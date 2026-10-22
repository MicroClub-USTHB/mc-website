"use client"

import Image, { type StaticImageData } from "next/image"
import { motion, useReducedMotion } from "motion/react"

import { Registration } from "@/components/hero/registration"
import { EASE_OUT_QUART } from "@/lib/easing"
import { hasRegistrationsWindow } from "@/lib/registrations/window"
import { cn } from "@/lib/utils"
import branch from "@/assets/hero/headline/branch.svg"
import network from "@/assets/hero/headline/network.svg"
import signal from "@/assets/hero/headline/signal.svg"

/** Figma letters of "EXPERIENCE IT" (left offset in px on the 656.65px wide line). */
const LETTERS = [
  { text: "xpe", left: 65.01, top: 0 },
  { text: "ie", left: 290.64, top: 1.27 },
  { text: "e", left: 506.07, top: 0 },
  { text: "it", left: 587.65, top: 0 },
]

/**
 * The "E" icon: three chips, painted in the Figma order (DEBUG over CODE and DEPLOY). `step` is
 * their entrance order, top to bottom.
 */
const CHIPS = [
  { label: "code", top: 50.93, left: 0, width: 43.396, height: 17.957, soft: true, step: 1 },
  { label: "deploy", top: 68.89, left: 0, width: 59.857, height: 25.439, soft: false, step: 2 },
  { label: "debug", top: 25.49, left: 0.06, width: 55.357, height: 26.018, soft: false, step: 0 },
]

/** Icon letters: R (branch), N (network), C (signal), with their glow drawn outside the box. */
type IconLetter = {
  src: StaticImageData
  alt: string
  box: { left: number; top: number; width: number; height: number }
  /** Offset of the SVG (glow included) from the letter box. */
  offset: { left: number; top: number }
  /** The SVG's exact size: the imported one is rounded to whole pixels. */
  size: { width: number; height: number }
}

const ICONS: IconLetter[] = [
  {
    src: branch,
    alt: "R",
    box: { left: 236, top: 23, width: 55.682, height: 76.484 },
    offset: { left: -9.9, top: -5.9 },
    size: { width: 75.482, height: 96.284 },
  },
  {
    src: network,
    alt: "N",
    box: { left: 378.82, top: 22.95, width: 59.838, height: 72.659 },
    offset: { left: -9.9, top: -5.9 },
    size: { width: 79.638, height: 92.459 },
  },
  {
    src: signal,
    alt: "C",
    box: { left: 447.43, top: 17.85, width: 57.415, height: 81.582 },
    offset: { left: -9.9, top: -3.88 },
    size: { width: 77.215, height: 97.351 },
  },
]

/** On-load timing (s): letters first, then the icons one after another. */
const ICONS_START = 0.45
const ICON_STAGGER = 0.22

const TEXT = "text-[91.78px] leading-[114.725px] tracking-[-1.8356px] uppercase whitespace-nowrap"

/**
 * Figma hero headline: "LET'S EXPERIENCE IT", where E, R, N and C are drawn as icons (a stack of
 * DEBUG / CODE / DEPLOY chips, a branch, a network and a signal), above the registration button
 * and its countdown. On page load the words fade in, then the icons drop into their letters one
 * after another and settle in place. It plays once, and not at all with reduced motion.
 */
export function Headline() {
  const reduceMotion = useReducedMotion()

  // Icon `i` lands after the previous one; the E chips stack one by one first.
  const pop = (i: number) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: -28, scale: 0.6, rotate: -14 },
          animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          transition: {
            delay: ICONS_START + i * ICON_STAGGER,
            type: "spring" as const,
            stiffness: 420,
            damping: 16,
            mass: 0.9,
          },
        }
  const fadeIn = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE_OUT_QUART },
      }

  return (
    // Phones see the canvas at full size: the headline shrinks to fit their width.
    <div className="flex w-[656.648px] origin-center flex-col items-center gap-7 max-[479px]:scale-[0.52] min-[480px]:max-sm:scale-[0.68] sm:max-md:scale-90">
      <p
        aria-label="Let's experience it"
        className="flex w-full flex-col items-center font-heading"
      >
        <motion.span
          aria-hidden
          {...fadeIn}
          className={cn(TEXT, "mb-[-19px] text-center text-headline-soft")}
        >
          let’s
        </motion.span>
        <span aria-hidden className="relative block h-[114.725px] w-full">
          {LETTERS.map(({ text, left, top }) => (
            <motion.span
              key={text}
              {...fadeIn}
              className={cn(TEXT, "absolute text-foreground")}
              style={{ left, top }}
            >
              {text}
            </motion.span>
          ))}

          {CHIPS.map(({ label, top, left, width, height, soft, step }) => (
            <motion.span
              key={label}
              {...pop(step * 0.45)}
              className={cn(
                "absolute grid place-items-center overflow-hidden font-heading text-[11.071px] leading-[0.91] font-medium uppercase",
                soft
                  ? "bg-chip-soft text-blue-primary-500 shadow-[inset_0_0_4.429px_0_rgb(255_255_255/0.58),inset_0_0_7.639px_0_rgb(255_255_255/0.4)]"
                  : "bg-primary text-blue-primary-300 shadow-[inset_0_0_4.761px_0_rgb(255_255_255/0.71),inset_0_0_9.854px_0_rgb(255_255_255/0.67)]",
              )}
              style={{ top, left, width, height }}
            >
              {label}
            </motion.span>
          ))}

          {ICONS.map(({ src, box, offset, size }, i) => (
            <motion.span
              key={src.src}
              {...pop(1 + i)}
              className="absolute"
              style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            >
              <Image
                src={src}
                alt=""
                {...size}
                unoptimized
                draggable={false}
                className="absolute max-w-none"
                style={{ left: offset.left, top: offset.top }}
              />
            </motion.span>
          ))}
        </span>
      </p>

      {/* Without a registrations window, the headline stands alone in the first view. */}
      {hasRegistrationsWindow && (
        // Empty (no gap left) once the registrations close.
        <motion.div {...fadeIn} className="empty:hidden">
          <Registration />
        </motion.div>
      )}
    </div>
  )
}
