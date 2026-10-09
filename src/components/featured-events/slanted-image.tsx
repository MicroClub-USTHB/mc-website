import Image from "next/image"
import type { CSSProperties } from "react"

import type { EventImage } from "@/const/featured-events"
import { cn } from "@/lib/utils"

/**
 * Figma "Event image" slice: the photo is stretched into a 975×1314 frame, then sheared
 * vertically with a slope of 2/3 (`skewY(atan(2/3))` ≈ 33.69°). Left and right edges stay
 * vertical, top and bottom edges drop to the right, and the whole slice fits a 975×1966 box.
 *
 * The outer box reserves that 975×1966 footprint (transforms do not affect layout); the inner
 * frame is skewed from its top-left corner so it fills the box exactly. Size it with a width or
 * height on `className`/`style`, the aspect ratio does the rest. `frameClassName` styles the
 * slanted frame itself (shadow, outline...), so it follows the slant; `imageClassName` styles
 * the photo (filters...).
 *
 * Only the slanted frame takes the pointer: the empty corners of the box let hover and clicks
 * through to whatever lies below (e.g. the overlapped slice of a chain).
 */
export function SlantedImage({
  image,
  sizes,
  className,
  frameClassName,
  imageClassName,
  style,
}: {
  image: EventImage
  sizes: string
  className?: string
  frameClassName?: string
  imageClassName?: string
  style?: CSSProperties
}) {
  return (
    <div style={style} className={cn("pointer-events-none relative aspect-975/1966", className)}>
      <div
        data-slot="slanted-frame"
        className={cn(
          "pointer-events-auto absolute inset-x-0 top-0 aspect-975/1314 origin-top-left skew-y-[33.69deg]",
          frameClassName,
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          // Pressing and moving on a slice drags the chain, never the photo itself.
          draggable={false}
          className={cn("object-fill", imageClassName)}
        />
      </div>
    </div>
  )
}
