import type { CSSProperties } from "react"

import { SlantedImage } from "@/components/featured-events/slanted-image"
import type { FeaturedEvent } from "@/const/featured-events"

/*
 * Geometry fitted (least squares) on the slice corners of the Figma frame (1440 × 980), in `--u`
 * units (1u = 1% of the frame width): each slice is 14.44u wide; the next one sits 6.64u to the
 * right and 3.76u higher. The middle slice's top-left corner is 0.47u left of and 18.08u above
 * the section center.
 */
const TILE_WIDTH = 14.44
const STEP_X = 6.64
const STEP_Y = 3.76
const CENTER_OFFSET_X = -0.47
const CENTER_OFFSET_Y = -18.08

/**
 * Diagonal chain of slanted event photos, from the top right (first event) down to the bottom
 * left. Each slice overlaps the previous one and sits in front of it, so the chain reads as a
 * stack seen from the side; its ends run off the section and fade out.
 *
 * Fills its positioned parent. Everything is laid out from the center of that box in `--u`
 * units: 1% of its width (as in Figma), but never less than 0.8% of its height, so the chain
 * keeps crossing the whole box on narrow, tall screens.
 */
export function EventChain({ events }: { events: FeaturedEvent[] }) {
  const middle = (events.length - 1) / 2

  return (
    <div
      aria-hidden
      className="border-2 border-red-600[container-type:size] absolute inset-0 [mask-image:linear-gradient(to_top_right,transparent,black_16%,black_84%,transparent)]"
    >
      <ul style={{ "--u": "max(1cqw, 0.8cqh)" } as CSSProperties} className="absolute inset-0">
        {events.map((event, index) => {
          const fromMiddle = index - middle
          return (
            <li key={event.id}>
              <SlantedImage
                image={event.cover}
                sizes="20vw"
                style={{
                  left: `calc(50% + ${CENTER_OFFSET_X - fromMiddle * STEP_X} * var(--u))`,
                  top: `calc(50% + ${CENTER_OFFSET_Y + fromMiddle * STEP_Y} * var(--u))`,
                  width: `calc(${TILE_WIDTH} * var(--u))`,
                  zIndex: index + 1,
                }}
                className="absolute"
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
