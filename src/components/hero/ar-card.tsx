"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"

import { McBadge } from "@/components/ui/mc-badge"
import { EASE_OUT_QUART } from "@/lib/easing"
import cardShape from "@/assets/hero/ar/card-shape.svg"
import cursor from "@/assets/hero/ar/cursor.svg"
import flipArrow from "@/assets/hero/ar/flip-arrow.svg"
import qrCorner from "@/assets/hero/ar/qr-corner.svg"
import illustration from "@/assets/hero/ar-card-front.webp"
import qrCode from "@/assets/hero/ar-card-qr.png"

/** Pixel dots around the computer (Figma "Decorative Detail"), [left, top, height]. */
const DOTS = [
  [205.5, 39.38, 6.7],
  [214.99, 56.13, 6.7],
  [204.94, 72.88, 6.7],
  [208.29, 46.08, 10.05],
  [208.29, 62.83, 10.05],
  [191.53, 72.88, 6.7],
  [182.04, 56.13, 6.7],
  [192.09, 39.38, 6.7],
  [188.75, 66.18, 10.05],
  [188.75, 49.43, 10.05],
] as const

/** Figma "Menu Icon" bars, [left, top, width, height]. */
const MENU_LINES = [
  [31.63, 201.41, 7.95, 23.18],
  [31.63, 228.56, 7.95, 7.95],
  [48.18, 217.3, 23.18, 7.95],
  [48.18, 229.22, 23.18, 7.95],
] as const

/** QR frame corners: top left, top right, bottom left, bottom right. */
const CORNERS = [
  "top-0 left-0",
  "top-0 right-0 -scale-x-100",
  "bottom-0 left-0 -scale-y-100",
  "right-0 bottom-0 rotate-180",
]

/** The die-cut card outline with its drop shadow, shared by both faces. */
function CardShape() {
  return (
    <Image
      src={cardShape}
      alt=""
      unoptimized
      draggable={false}
      className="absolute top-[-3.45px] left-[-10.31px] max-w-none"
    />
  )
}

/**
 * Figma "AR card" (Event Card): the club computer on the front, the AR QR code on the back.
 * Clicking the card (or Enter / Space) flips it in 3D. The "flip me !" prompt points at it.
 */
export function ArCard() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="relative h-[415.4px] w-[401px]">
      <div aria-hidden className="absolute top-0 left-[250.95px] h-[66.38px] w-[150px]">
        <div className="absolute top-0 left-0 grid size-[66.34px] place-items-center">
          <Image
            src={flipArrow}
            alt=""
            unoptimized
            draggable={false}
            className="max-w-none rotate-[150.04deg]"
          />
        </div>
        <p className="absolute top-[50px] right-0 font-sans text-2xl leading-4 text-muted-foreground lowercase">
          FLIP ME !
        </p>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Show the computer side of the card" : "Flip the card to its QR code"}
        aria-pressed={flipped}
        className="absolute top-[58.09px] left-0 h-[357.3px] w-[294.9px] cursor-pointer rounded-md outline-none perspective-[1000px] focus-visible:ring-4 focus-visible:ring-secondary"
      >
        <motion.span
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
          className="relative block size-full transform-3d"
        >
          {/* Front. */}
          <span className="absolute inset-0 backface-hidden">
            <CardShape />
            <span className="absolute top-[16.14px] left-[19.37px] h-[308.57px] w-[236.27px] overflow-clip rounded-[5.164px] bg-primary shadow-[inset_0_0_9.683px_0_rgb(255_255_255/0.81),inset_0_0_7.23px_0_rgb(255_255_255/0.25)]">
              <Image
                src={illustration}
                alt="Retro Micro Club computer"
                sizes="275px"
                draggable={false}
                className="absolute top-[16.02px] left-[-11.68px] h-[382.8px] w-[275.03px] max-w-none object-cover"
              />
              {DOTS.map(([left, top, height]) => (
                <span
                  key={`${left}-${top}`}
                  className="absolute w-[6.7px] bg-blue-primary-500"
                  style={{ left, top, height }}
                />
              ))}
              {MENU_LINES.map(([left, top, width, height]) => (
                <span
                  key={`${left}-${top}`}
                  className="absolute bg-blue-primary-500"
                  style={{ left, top, width, height }}
                />
              ))}
              <span className="absolute top-[141px] left-[38.71px] grid h-[26.39px] w-[32.47px] place-items-center">
                <Image
                  src={cursor}
                  alt=""
                  unoptimized
                  draggable={false}
                  className="max-w-none rotate-[70.92deg]"
                />
              </span>
            </span>
          </span>

          {/* Back. */}
          <span className="absolute inset-0 rotate-y-180 backface-hidden">
            <CardShape />
            <span className="absolute top-[57.77px] left-[49.01px] h-[226.81px] w-[176.32px]">
              <span className="absolute inset-x-0 top-0 h-[181px]">
                {CORNERS.map((position) => (
                  <Image
                    key={position}
                    src={qrCorner}
                    alt=""
                    unoptimized
                    draggable={false}
                    className={`absolute size-5.25 max-w-none ${position}`}
                  />
                ))}
                <Image
                  src={qrCode}
                  alt="QR code that opens the Micro Club AR experience"
                  sizes="167px"
                  draggable={false}
                  className="absolute top-[6.72px] left-[2.86px] size-[167.06px] max-w-none"
                />
              </span>
              <McBadge
                size="lg"
                className="absolute top-[194.8px] left-[calc(50%-0.65px)] -translate-x-1/2 text-base capitalize"
              >
                animate me !
              </McBadge>
            </span>
          </span>
        </motion.span>
      </button>
    </div>
  )
}
