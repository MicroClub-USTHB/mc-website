"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { useReducedMotion } from "motion/react"

import StickerPeel from "@/components/shared/sticker-peel"
import { HERO_CANVAS } from "@/const/hero"
import { cssToken, renderTextSticker, TEXT_STICKER_FRAME } from "@/lib/text-sticker"
import learningOutline from "@/assets/hero/stickers/learning-outline.svg"
import microbot from "@/assets/hero/stickers/microbot.png"
import skillsOutline from "@/assets/hero/stickers/skills-outline.svg"
import tooltipArrow from "@/assets/hero/stickers/tooltip-arrow.svg"

/** Sticker centres on the canvas, in px from its top-left corner. */
const MICROBOT = { x: 2150, y: 1500 }
const TEXT_STICKERS = [
  {
    text: "# more_Than_Just_Learning",
    outline: learningOutline.src,
    outlineTop: 26,
    color: "--foreground",
    x: 1475,
    y: 1255,
  },
  {
    text: "#real_Projects_Real_Skills",
    outline: skillsOutline.src,
    outlineTop: 26.4,
    color: "--primary-foreground",
    x: 1473,
    y: 1362,
  },
]

const HOVER = "(any-hover: hover)"
const getCanHover = () => window.matchMedia(HOVER).matches
function subscribeToHover(onChange: () => void) {
  const query = window.matchMedia(HOVER)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** Offset of a canvas point from the centre of the canvas, where the sticker peel counts from. */
const fromCenter = (x: number, y: number) => ({
  x: x - HERO_CANVAS.width / 2,
  y: y - HERO_CANVAS.height / 2,
})

/** Figma "tooltip" over the Micro Bot sticker: it follows the sticker and fades once it is moved. */
function MicroBotTooltip({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden
      data-hidden={hidden || undefined}
      className="absolute bottom-[calc(50%+94px)] left-1/2 flex w-[136px] -translate-x-1/2 flex-col gap-2 rounded-sm bg-card p-4 drop-shadow-[0_1px_2px_var(--color-blue-primary-200)] transition-opacity duration-300 ease-out-quart data-hidden:opacity-0 motion-reduce:transition-none"
    >
      <p className="text-xs leading-[18px] font-semibold text-muted-foreground">
        Hi, I am Micro Bot !
      </p>
      <span className="absolute bottom-[-18px] left-[calc(50%+1.11px)] h-[18px] w-[20.785px] -translate-x-1/2 rotate-180">
        <Image
          src={tooltipArrow}
          alt=""
          unoptimized
          className="absolute inset-[11.11%_0_0_0] h-[88.89%] w-full max-w-none"
        />
      </span>
    </div>
  )
}

/**
 * Figma "Stickers": die-cut stickers stuck on the board, with React Bits' sticker peel: they peel
 * at the edge under the pointer, can be dragged anywhere on the canvas and thrown, and swing back.
 * The two hashtag stickers are drawn from their Figma outline and text once the font is ready.
 * Decorative: hidden from assistive tech, and calm with reduced motion.
 */
export function Stickers() {
  const reduceMotion = useReducedMotion()
  const [images, setImages] = useState<(string | null)[]>([])
  const [back, setBack] = useState<string>()
  const [moved, setMoved] = useState(false)
  // Stickers only peel toward a pointer that can hover.
  const canHover = useSyncExternalStore(subscribeToHover, getCanHover, () => true)

  useEffect(() => {
    let cancelled = false
    void Promise.all(
      TEXT_STICKERS.map((sticker) =>
        renderTextSticker({ ...sticker, color: cssToken(sticker.color) }),
      ),
    ).then((urls) => {
      if (cancelled) return
      setImages(urls)
      setBack(cssToken("--border"))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const common = {
    backColor: back,
    swing: reduceMotion ? 0 : 1,
    followPointer: canHover,
    intro: !reduceMotion,
  }

  return (
    <div
      aria-hidden
      // On touch screens the sticker hit areas would trap a swipe meant for the page, so they only
      // react while the canvas is explored.
      className="pointer-events-none absolute top-0 left-0 select-none pointer-coarse:[&_[data-sticker]]:pointer-events-none pointer-coarse:in-data-exploring:[&_[data-sticker]]:pointer-events-auto"
      style={{ width: HERO_CANVAS.width, height: HERO_CANVAS.height }}
    >
      {TEXT_STICKERS.map((sticker, i) =>
        images[i] ? (
          <StickerPeel
            key={sticker.text}
            imageSrc={images[i]}
            width={TEXT_STICKER_FRAME.width}
            initialPosition={fromCenter(sticker.x, sticker.y)}
            {...common}
          />
        ) : null,
      )}
      {back && (
        <StickerPeel
          imageSrc={microbot.src}
          width={136}
          initialPosition={fromCenter(MICROBOT.x, MICROBOT.y)}
          onDragStart={() => setMoved(true)}
          {...common}
        >
          <MicroBotTooltip hidden={moved} />
        </StickerPeel>
      )}
    </div>
  )
}
