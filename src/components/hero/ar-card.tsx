"use client"

import { useState } from "react"
import Image from "next/image"
import { CornerLeftDownIcon } from "lucide-react"
import { motion } from "motion/react"

import { EASE_OUT_QUART } from "@/lib/easing"
import front from "@/assets/hero/ar-card-front.webp"
import qrCode from "@/assets/hero/ar-card-qr.png"

const FACE =
  "absolute inset-0 grid place-items-center rounded-3xl border border-border backface-hidden"

/**
 * Figma "AR card": the club computer on the front, the AR QR code on the back. Clicking the card
 * (or Enter / Space) flips it in 3D.
 */
export function ArCard() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="relative">
      <p
        aria-hidden
        className="absolute -top-12 left-full flex -translate-x-12 items-start gap-1 font-heading text-xl whitespace-nowrap text-primary italic"
      >
        <CornerLeftDownIcon className="mt-3 size-6" />
        flip me !
      </p>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Show the computer side of the card" : "Flip the card to its QR code"}
        aria-pressed={flipped}
        className="block h-80 w-60 cursor-pointer rounded-3xl outline-none perspective-[1000px] focus-visible:ring-4 focus-visible:ring-secondary"
      >
        <motion.span
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
          className="relative block size-full transform-3d"
        >
          <span className={`${FACE} bg-background shadow-[0_0.75rem_2rem_rgb(0_0_0/0.12)]`}>
            <Image
              src={front}
              alt="Retro Micro Club computer"
              sizes="240px"
              draggable={false}
              className="h-72 w-auto object-contain"
            />
          </span>
          <span
            className={`${FACE} rotate-y-180 content-center gap-4 bg-background shadow-[0_0.75rem_2rem_rgb(0_0_0/0.12)]`}
          >
            <Image
              src={qrCode}
              alt="QR code that opens the Micro Club AR experience"
              sizes="160px"
              draggable={false}
              className="size-40"
            />
            <span className="rounded-full border border-border bg-background px-3 py-1 paragraph-sm font-medium text-primary">
              animate me !
            </span>
          </span>
        </motion.span>
      </button>
    </div>
  )
}
