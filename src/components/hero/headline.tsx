"use client"

import Image, { type StaticImageData } from "next/image"
import { motion, useReducedMotion } from "motion/react"

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

/**
 * The plain letters the icons replace, where the font would set them next to the Figma letters
 * (their advance widths, tracking included): "EXPERIENCE" reads in full first. `swap` is the icon
 * that takes its place (0 = the E chips).
 */
const SWAPPED = [
  { text: "e", left: 10.68, swap: 0 },
  { text: "r", left: 229.48, swap: 1 },
  { text: "n", left: 366.63, swap: 2 },
  { text: "c", left: 436.23, swap: 3 },
]

/** On-load timing (s): "EXPERIENCE" first, then each letter springs into its icon, in turn. */
const ICONS_START = 0.8
const ICON_STAGGER = 0.25

/**
 * The words fade up as the splash screen plays it (0.6s, ease-out-quart). A CSS animation, not Motion: it runs from the
 * server HTML on, so the headline paints without waiting for JavaScript (it is the page's largest
 * text). None with reduced motion.
 */
const FADE_IN = "motion-safe:animate-[headline-in_0.6s_var(--ease-out-quart)_both]"

const TEXT = "text-[91.78px] leading-[114.725px] tracking-[-1.8356px] uppercase whitespace-nowrap"

/**
 * Figma hero headline: "LET'S EXPERIENCE IT", where E, R, N and C are drawn as icons (a stack of
 * DEBUG / CODE / DEPLOY chips, a branch, a network and a signal), centred in the first view.
 * In the hero it is drawn as it ends, icons in place. The splash screen of a page load (`Splash`)
 * plays it: "EXPERIENCE" fades in as plain letters, then E, R, N and C spring into their icons one
 * after another (not with reduced motion), and `onSettled` is called once the last icon has landed.
 */
export function Headline({
  animated = false,
  onSettled,
}: { animated?: boolean; onSettled?: () => void } = {}) {
  const still = useReducedMotion() || !animated

  // Icon `i` lands after the previous one; the E chips stack one by one first.
  const pop = (i: number) =>
    still
      ? { initial: false as const }
      : {
          initial: { opacity: 0, scale: 0.3, rotate: -14 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          transition: {
            delay: ICONS_START + i * ICON_STAGGER,
            type: "spring" as const,
            stiffness: 420,
            damping: 16,
            mass: 0.9,
          },
        }
  // The letter an icon replaces shrinks away as the icon springs up in its place.
  const swapOut = (i: number) => ({
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.4 },
    transition: {
      delay: ICONS_START + i * ICON_STAGGER,
      type: "spring" as const,
      stiffness: 380,
      damping: 26,
    },
  })

  return (
    // Phones see the canvas at full size: the headline shrinks to fit their width.
    <div
      data-headline
      className="flex w-[656.648px] shrink-0 origin-center flex-col items-center max-[479px]:scale-[0.52] min-[480px]:max-sm:scale-[0.68] sm:max-md:scale-90"
    >
      <p className="flex w-full flex-col items-center font-heading">
        {/* The words are drawn in pieces (and icons): screen readers get the sentence. */}
        <span className="sr-only">Let’s experience it</span>
        <span
          aria-hidden
          className={cn(TEXT, animated && FADE_IN, "mb-[-19px] text-center text-headline-soft")}
        >
          let’s
        </span>
        <span aria-hidden className="relative block h-[114.725px] w-full">
          {LETTERS.map(({ text, left, top }) => (
            <span
              key={text}
              className={cn(TEXT, animated && FADE_IN, "absolute text-foreground")}
              style={{ left, top }}
            >
              {text}
            </span>
          ))}

          {/* Not played (the hero, reduced motion): the icons are simply there, no letters to swap. */}
          {!still &&
            SWAPPED.map(({ text, left, swap }) => (
              <span
                key={text}
                className={cn(TEXT, animated && FADE_IN, "absolute top-0 text-foreground")}
                style={{ left }}
              >
                <motion.span {...swapOut(swap)} className="block">
                  {text}
                </motion.span>
              </span>
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
              onAnimationComplete={i === ICONS.length - 1 ? onSettled : undefined}
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
    </div>
  )
}
