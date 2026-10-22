import Image, { type StaticImageData } from "next/image"

import { cn } from "@/lib/utils"
import chess from "@/assets/hero/activities/chess.webp"
import chessOutline from "@/assets/hero/activities/chess-outline.svg"
import chessPiece from "@/assets/hero/activities/chess-piece.webp"
import craft from "@/assets/hero/activities/craft.webp"
import curvedArrow from "@/assets/hero/activities/curved-arrow.svg"
import foosball from "@/assets/hero/activities/foosball.webp"
import printedPaper from "@/assets/hero/activities/printed-paper.webp"

type Print = {
  /** Box that holds the tilted print, in px (its bounding box, tilt included). */
  box: { left: number; top: number; width: number; height: number }
  rotate: number
  /** Size of the print and padding around the photo, as in Figma (the border is drawn inside). */
  print: { width: number; height: number; padding: string }
  /** Drop shadow offset and blur (Figma, 5% black). */
  shadow: string
  /** Photo size in px. */
  photo: { width: number; height: number }
  /** Crop of the photo inside its frame (Figma image fill), when it is not a plain cover. */
  crop?: { left: string; top: string; width: string }
  src: StaticImageData
  alt: string
}

/** Figma "Printed Photo" frames, painted in this order (the last one on top). */
const PRINTS: Print[] = [
  {
    box: { left: 210.53, top: 0, width: 265.327, height: 195.727 },
    rotate: 13.17,
    print: { width: 238.519, height: 145.209, padding: "px-[4.969px] py-[11.043px]" },
    shadow: "drop-shadow-[0_2.816px_7.51px_rgb(0_0_0/0.05)]",
    photo: { width: 211.465, height: 120.916 },
    src: foosball,
    alt: "Members playing foosball at a Micro Club event",
  },
  {
    box: { left: 134.34, top: 129.55, width: 185.507, height: 221.544 },
    rotate: -12.61,
    print: { width: 146.653, height: 194.219, padding: "p-[10.555px]" },
    shadow: "drop-shadow-[0_2.692px_7.179px_rgb(0_0_0/0.05)]",
    photo: { width: 125.543, height: 167.391 },
    src: chess,
    alt: "Members playing chess at a Micro Club event",
  },
  {
    box: { left: 0, top: 37.92, width: 202.144, height: 231.521 },
    rotate: 19.11,
    print: { width: 146.653, height: 194.219, padding: "p-[10.555px]" },
    shadow: "drop-shadow-[0_2.692px_7.179px_rgb(0_0_0/0.05)]",
    photo: { width: 125.543, height: 167.391 },
    crop: { left: "-33.25%", top: "-1.61%", width: "199.98%" },
    src: craft,
    alt: "A member drawing on the Micro Craft board",
  },
]

/** One tilted printed photo: off-white paper, a hairline border and the photo inside. */
function PrintedPhoto({ box, rotate, print, shadow, photo, crop, src, alt }: Print) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      <div
        style={{ rotate: `${rotate}deg`, width: print.width, height: print.height }}
        className={cn(
          "relative flex shrink-0 flex-col items-center justify-center",
          shadow,
          print.padding,
        )}
      >
        <span aria-hidden className="absolute inset-0 bg-background ring-1 ring-border ring-inset">
          <Image
            src={printedPaper}
            alt=""
            sizes="240px"
            className="size-full max-w-none object-cover"
          />
        </span>
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ width: photo.width, height: photo.height }}
        >
          <Image
            src={src}
            alt={alt}
            sizes="360px"
            draggable={false}
            className={cn("max-w-none", crop ? "absolute h-full" : "size-full object-cover")}
            style={crop && { left: crop.left, top: crop.top, width: crop.width }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Figma "Activities": three tilted printed photos of club events (foosball, chess, a craft board)
 * with a chess rook sticking out of the pile, and "At MC, the fun never stops too!" with a hand
 * drawn arrow pointing at the photos. Static decoration: no interaction, so a press on it still
 * pans the canvas.
 */
export function Activities() {
  return (
    <div className="pointer-events-none relative h-[351.097px] w-[685px] select-none">
      {PRINTS.map((print) => (
        <PrintedPhoto key={print.alt} {...print} />
      ))}

      <div className="absolute top-[125.2px] left-[319.06px] size-[111.091px]">
        <Image
          src={chessOutline}
          alt=""
          // Exact size (the import rounds it): sized by CSS, it is never mistaken for a squash.
          width={118.506}
          height={119.08}
          unoptimized
          draggable={false}
          className="absolute inset-[-3.25%_-3.49%_-3.48%_-3.18%] block h-[calc(100%*1.0673)] w-[calc(100%*1.0667)] max-w-none"
        />
      </div>
      <Image
        src={chessPiece}
        alt="A chess rook, black and white"
        sizes="118px"
        draggable={false}
        className="absolute top-[122px] left-[317px] size-[118px] max-w-none object-cover"
      />

      <div className="absolute top-[46px] left-[476px] h-[117.157px] w-[209px]">
        <p className="absolute top-0 left-1/2 w-[209px] -translate-x-1/2 text-center font-sans text-2xl leading-[25px] text-muted-foreground">
          At MC, the fun never stops too!
        </p>
        <div className="absolute top-[50px] left-[12px] flex h-[67.157px] w-[67.193px] items-center justify-center">
          <Image
            src={curvedArrow}
            alt=""
            unoptimized
            draggable={false}
            className="h-[48.648px] w-[48.526px] max-w-none -rotate-[57.14deg]"
          />
        </div>
      </div>
    </div>
  )
}
