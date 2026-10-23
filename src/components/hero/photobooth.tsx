"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"

import { buttonVariants } from "@/components/ui/mc-button"
import { EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"
import arrowDown from "@/assets/hero/photobooth/arrow-down.svg"
import booth from "@/assets/hero/photobooth/booth.webp"
import paper from "@/assets/hero/photobooth/paper.webp"
import photoOne from "@/assets/hero/photobooth/photo-1.webp"
import photoTwo from "@/assets/hero/photobooth/photo-2.webp"

/** Strip position (px from the top of the printer) of the three Figma variants. */
const STRIP_OFFSETS = [-173, -109, 6.08]

const PHOTOS = [
  { src: photoOne, alt: "Micro Club members together at an event" },
  { src: photoTwo, alt: "Micro Club members gathered for a group photo" },
]

/** The printer, from the Figma photo booth render. */
function Booth({ className }: { className?: string }) {
  return (
    <Image
      src={booth}
      alt=""
      sizes="241px"
      draggable={false}
      className={cn("absolute top-0 left-0 h-[53px] w-[241px] max-w-none", className)}
    />
  )
}

/**
 * Figma "Photobooth": each press prints the photo strip further out of the printer slot (0.6s
 * slide); after the third state it goes back to the first. The strip slides between the printer
 * body and its slot, so it comes out of the middle of the machine.
 */
export function Photobooth() {
  const [step, setStep] = useState(0)

  return (
    <button
      type="button"
      onClick={() => setStep((current) => (current + 1) % STRIP_OFFSETS.length)}
      aria-label={`Print the photo strip, step ${step + 1} of ${STRIP_OFFSETS.length}`}
      className="group/booth flex w-[241px] cursor-pointer flex-col items-center gap-4 outline-none"
    >
      <span
        className={cn(
          buttonVariants({ variant: "primary", size: "sm", icon: "trailing" }),
          "border-primary shadow-[0_1px_2px_0_rgb(10_13_18/0.05)] group-hover/booth:bg-secondary-foreground group-hover/booth:text-secondary group-focus-visible/booth:ring-4 group-focus-visible/booth:ring-secondary",
        )}
      >
        PHOTOS HERE
        <Image src={arrowDown} alt="" unoptimized className="size-[11px] max-w-none" />
      </span>

      <span className="relative block h-[313.96px] w-full overflow-clip">
        <Booth className="-top-px" />

        <motion.span
          initial={false}
          animate={{ y: STRIP_OFFSETS[step] }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
          className="absolute top-0 left-[calc(50%+0.94px)] flex -translate-x-1/2 flex-col items-center gap-[12.764px] bg-primary-foreground px-[12.764px] pt-[25.528px] pb-[6.382px] drop-shadow-[0_1.915px_5.106px_rgb(0_0_0/0.05)]"
        >
          <Image src={paper} alt="" fill sizes="115px" draggable={false} className="object-cover" />
          {PHOTOS.map((photo) => (
            <Image
              key={photo.alt}
              src={photo.src}
              alt={photo.alt}
              sizes="90px"
              draggable={false}
              className="relative h-[102.111px] w-[89.347px] max-w-none object-cover"
            />
          ))}
          <span className="relative paragraph-xs font-medium whitespace-nowrap text-muted-foreground">
            MICRO CLUB
          </span>
        </motion.span>

        {/* The slot lip, drawn over the strip. */}
        <span className="absolute -top-px left-0 h-5 w-[241px] overflow-hidden">
          <Booth />
        </span>
      </span>
    </button>
  )
}
