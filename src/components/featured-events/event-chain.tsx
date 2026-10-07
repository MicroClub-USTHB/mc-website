import type { CSSProperties } from "react"

import { ChainSlot, ChainViewport } from "@/components/featured-events/chain-viewport"
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
/** Slice height over width (975×1966 slanted slice, see `SlantedImage`). */
const TILE_RATIO = 1966 / 975

/**
 * Minimum slots on the loop. 19 slots span the section on every aspect ratio (fewer on portrait
 * screens), so a slice always wraps around offscreen; the events are repeated to reach it.
 */
const MIN_SLOTS = 20
/** Seconds for a slice to move one slot: about 30px/s on a 1440px wide section. */
const STEP_DURATION = 3

/** One slot down the chain (toward the bottom left), in % of the slice width and height. */
const STEP = {
  x: (-STEP_X / TILE_WIDTH) * 100,
  y: (STEP_Y / (TILE_WIDTH * TILE_RATIO)) * 100,
}

/**
 * Diagonal chain of slanted event photos, from the top right (first event) down to the bottom
 * left. Each slice overlaps the previous one and sits in front of it, so the chain reads as a
 * stack seen from the side; its ends run off the section and fade into the background.
 *
 * Fills its positioned parent. Everything is laid out from the center of that box in `--u`
 * units: 1% of its width (as in Figma), but never less than 0.8% of its height, so the chain
 * keeps crossing the whole box on narrow, tall screens.
 *
 * It moves toward the bottom left in an infinite loop, driven by Motion on the compositor (see
 * `ChainSlot`): every slice is anchored on slot 0 (top right, offscreen) and offset by its
 * current slot.
 *
 * Photos are grayscale and fade to color while hovered (only the visible slanted part of a
 * slice reacts, see `SlantedImage`).
 */
export function EventChain({ events }: { events: FeaturedEvent[] }) {
  const tiles = Array.from({ length: Math.ceil(MIN_SLOTS / events.length) }, () => events).flat()
  const slots = tiles.length
  // Slot 0 (top right) sits `firstSlot` steps from the middle of the chain.
  const firstSlot = -(slots - 1) / 2

  return (
    <ChainViewport aria-hidden className="@container-[size] absolute inset-0">
      {/* `isolate` keeps the slices' z-indexes below the fade overlay. */}
      <ul
        style={{ "--u": "max(1cqw, 1.1cqh)" } as CSSProperties}
        className="absolute inset-0 isolate"
      >
        {tiles.map((event, index) => (
          // Tiles repeat events once the list is shorter than the loop.
          <li key={`${event.id}-${index}`}>
            <ChainSlot
              eventId={event.id}
              index={index}
              slots={slots}
              stepDuration={STEP_DURATION}
              step={STEP}
              style={{
                left: `calc(50% + ${CENTER_OFFSET_X - firstSlot * STEP_X} * var(--u))`,
                top: `calc(50% + ${CENTER_OFFSET_Y + firstSlot * STEP_Y} * var(--u))`,
                width: `calc(${TILE_WIDTH} * var(--u))`,
              }}
              className="pointer-events-none absolute"
            >
              <SlantedImage
                image={event.cover}
                sizes="20vw"
                frameClassName="group/slice"
                imageClassName="grayscale transition-[filter] duration-500 ease-out-quart group-hover/slice:grayscale-0 group-data-active/tile:grayscale-0"
              />
            </ChainSlot>
          </li>
        ))}
      </ul>
      {/*
        Ends of the chain fading into the background: a static overlay instead of a mask, so the
        moving slices never have to be re-masked (same look on the plain section background).
      */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top_right,var(--background),transparent_16%,transparent_84%,var(--background))]" />
    </ChainViewport>
  )
}
