import Image, { type StaticImageData } from "next/image"

import { cn } from "@/lib/utils"
import curvedArrow from "@/assets/hero/activities/curved-arrow.svg"
import printedPaper from "@/assets/hero/activities/printed-paper.webp"
import hackathonTeam from "@/assets/hero/wins/hackathon-team.webp"
import secondPlace from "@/assets/hero/wins/second-place.webp"
import trophy from "@/assets/hero/wins/trophy.svg"
import winner from "@/assets/hero/wins/winner.webp"

type Print = {
  /** Box that holds the tilted print, in px (its bounding box, tilt included). */
  box: { left: number; top: number; width: number; height: number }
  rotate: number
  /** Size of the print and padding around the photo, as in Figma (the border is drawn inside). */
  print: { width: number; height: number; padding: string }
  /** Photo size in px (the files are cropped to the part Figma shows). */
  photo: { width: number; height: number }
  src: StaticImageData
  alt: string
}

/** Figma "Printed Photo" frames, painted in this order (the last one on top). */
const PRINTS: Print[] = [
  {
    box: { left: 0, top: 40.71, width: 236.709, height: 287.766 },
    rotate: -10.06,
    print: { width: 194.697, height: 257.728, padding: "p-[14.007px]" },
    photo: { width: 166.596, height: 222.127 },
    src: secondPlace,
    alt: "Micro Club members holding a second place award",
  },
  {
    box: { left: 254.22, top: 26, width: 351.112, height: 287.377 },
    rotate: 19.04,
    print: { width: 302.551, height: 199.599, padding: "px-[6.303px] py-[14.007px]" },
    photo: { width: 268.234, height: 166.683 },
    src: hackathonTeam,
    alt: "A Micro Club team at a competition",
  },
  {
    box: { left: 118.36, top: 208.79, width: 317.039, height: 209.109 },
    rotate: -4.85,
    print: { width: 302.551, height: 184.192, padding: "px-[6.303px] py-[14.007px]" },
    photo: { width: 268.234, height: 153.376 },
    src: winner,
    alt: "Micro Club members celebrating a winner trophy",
  },
]

/** One tilted printed photo: off-white paper, a hairline border and the photo inside. */
function PrintedPhoto({ box, rotate, print, photo, src, alt }: Print) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      <div
        style={{ rotate: `${rotate}deg`, width: print.width, height: print.height }}
        className={cn(
          "relative flex shrink-0 flex-col items-center justify-center drop-shadow-[0_3.572px_9.526px_rgb(0_0_0/0.05)]",
          print.padding,
        )}
      >
        <span aria-hidden className="absolute inset-0 bg-background ring-1 ring-border ring-inset">
          <Image
            src={printedPaper}
            alt=""
            sizes="300px"
            className="size-full max-w-none object-cover"
          />
        </span>
        <Image
          src={src}
          alt={alt}
          sizes="270px"
          draggable={false}
          className="relative max-w-none shrink-0 object-cover"
          style={{ width: photo.width, height: photo.height }}
        />
      </div>
    </div>
  )
}

/**
 * Figma "MC Win": three tilted printed photos of club members with their awards, a golden trophy
 * over the pile and "MC members always bring trophies home" with a hand drawn arrow pointing at the
 * photos. Static decoration: no interaction, so a press on it still pans the canvas.
 */
export function Wins() {
  return (
    <div className="pointer-events-none relative h-[417.9px] w-[809px] select-none">
      {PRINTS.map((print) => (
        <PrintedPhoto key={print.alt} {...print} />
      ))}

      <div className="absolute top-0 left-[176px] flex h-[109.465px] w-[117.871px] items-center justify-center">
        <Image
          src={trophy}
          alt="A golden trophy"
          unoptimized
          draggable={false}
          className="h-[86.245px] w-[98.338px] max-w-none -rotate-[15.56deg]"
        />
      </div>

      <p className="absolute top-[83px] left-[600px] w-[209px] text-center font-sans text-2xl leading-[25px] text-muted-foreground">
        MC members always bring trophies home
      </p>
      <div className="absolute top-[164px] left-[600px] flex h-[67.157px] w-[67.193px] items-center justify-center">
        <Image
          src={curvedArrow}
          alt=""
          unoptimized
          draggable={false}
          className="h-[48.648px] w-[48.526px] max-w-none -rotate-[57.14deg]"
        />
      </div>
    </div>
  )
}
