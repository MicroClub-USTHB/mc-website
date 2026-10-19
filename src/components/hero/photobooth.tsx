"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowDownIcon } from "lucide-react"
import * as motion from "motion/react-client"

import { McButton } from "@/components/ui/mc-button"
import { EASE_OUT_QUART } from "@/lib/easing"
import photoOne from "@/assets/hero/photobooth-1.webp"
import photoTwo from "@/assets/hero/photobooth-2.webp"

/** How far the strip is printed at each click (px from fully out); the last click resets it. */
const STRIP_OFFSETS = [-185, -130, 0]

/**
 * Figma "Photobooth": a printer slot with a photo strip coming out of it. Each press of the button
 * prints the strip a bit further (0.6s slide); after the third state it goes back to the first.
 */
export function Photobooth() {
  const [step, setStep] = useState(0)

  return (
    <div className="flex w-64 flex-col items-center gap-4">
      <McButton
        size="sm"
        icon="trailing"
        iconDefinition={<ArrowDownIcon className="size-4" />}
        onClick={() => setStep((current) => (current + 1) % STRIP_OFFSETS.length)}
      >
        PHOTOS HERE
      </McButton>

      {/* Printer slot, metallic. */}
      <div className="relative z-10 h-5 w-full rounded-full bg-linear-to-b from-muted-foreground/60 via-muted to-muted-foreground/70 p-1.5 shadow-[0_0.25rem_0.5rem_rgb(0_0_0/0.2)]">
        <div className="h-full rounded-full bg-foreground/80" />
      </div>

      {/* The strip only shows below the slot. */}
      <div className="-mt-6.5 overflow-hidden px-4 pb-6">
        <motion.div
          initial={false}
          animate={{ y: STRIP_OFFSETS[step] }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
          className="flex flex-col items-center gap-2 bg-background px-3 pt-3 pb-2 shadow-[0_0.5rem_1rem_rgb(0_0_0/0.2)]"
        >
          {[photoOne, photoTwo].map((photo, i) => (
            <Image
              key={i}
              src={photo}
              alt={i === 0 ? "Micro Club members at an event" : "Micro Club members having fun"}
              sizes="89px"
              draggable={false}
              className="h-25.5 w-22.25 object-cover"
            />
          ))}
          <p className="paragraph-xs font-medium text-muted-foreground uppercase">Micro Club</p>
        </motion.div>
      </div>
    </div>
  )
}
