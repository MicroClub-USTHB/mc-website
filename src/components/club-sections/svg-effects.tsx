import { Fragment } from "react"

import { cn } from "@/lib/utils"

export type SectionIconProps = React.ComponentProps<"svg"> & {
  /** Hovered / selected look from the Figma prototype. */
  active?: boolean
}

/** Glows and shadows reach past the viewBox, so the SVG must not clip them. */
export function sectionIconClassName(className?: string) {
  return cn("overflow-visible", className)
}

export type Shadow = {
  dx?: number
  dy?: number
  blur: number
  color: string
  opacity: number
}

export type GradientStop = { offset: number; color: string; opacity?: number }

/**
 * Gradient stops styled through CSS, so colors can be `var()` tokens (presentation attributes
 * don't resolve them).
 */
export function GradientStops({ stops }: { stops: GradientStop[] }) {
  return stops.map(({ offset, color, opacity = 1 }) => (
    <stop key={offset} offset={offset} style={{ stopColor: color, stopOpacity: opacity }} />
  ))
}

/** Fills the `mask` result with a flat color, set through CSS so it can be a `var()` token. */
function Tint({ color, opacity, result }: Pick<Shadow, "color" | "opacity"> & { result?: string }) {
  return (
    <>
      <feFlood style={{ floodColor: color, floodOpacity: opacity }} />
      <feComposite in2="mask" operator="in" result={result} />
    </>
  )
}

/** Paints a copy of the outline opaque (`!important` beats the shapes' inline styles). */
const OPAQUE = "**:fill-black! **:[fill-opacity:1]! **:opacity-100!"

type ShadowedProps = React.ComponentProps<"g"> & {
  id: string
  /** Filter region in user space, as in the Figma export. */
  region: Pick<React.ComponentProps<"filter">, "x" | "y" | "width" | "height">
  drop?: Shadow
  /**
   * Applied in order. A shadow that only exists in one state gets `opacity: 0` in the other,
   * which skips it.
   */
  inner?: Shadow[]
  /** The shapes casting the shadows, when the children are not plain shapes. */
  outline?: React.ReactNode
}

/**
 * A layer with Figma drop and inner shadows. Figma's export derives them from a "hard alpha"
 * (the layer's alpha × 127), which stair-steps every anti-aliased edge. Here they come from an
 * opaque copy of the outline instead: same full-strength shadows on translucent fills, smooth
 * edges. Drop shadows go under the layer, inner shadows over it.
 */
export function Shadowed({
  id,
  region,
  drop,
  inner = [],
  outline,
  children,
  ...group
}: ShadowedProps) {
  const shadows = inner.filter((shadow) => shadow.opacity > 0)
  const filter = {
    filterUnits: "userSpaceOnUse",
    colorInterpolationFilters: "sRGB",
    ...region,
  } as const

  return (
    <g {...group}>
      {drop && (
        <g filter={`url(#${id}-drop)`} className={OPAQUE}>
          {outline ?? children}
        </g>
      )}
      {children}
      {shadows.length > 0 && (
        <g filter={`url(#${id}-inner)`} className={OPAQUE}>
          {outline ?? children}
        </g>
      )}
      <defs>
        {drop && (
          <filter id={`${id}-drop`} {...filter}>
            <feOffset in="SourceAlpha" dx={drop.dx} dy={drop.dy} />
            <feGaussianBlur stdDeviation={drop.blur} />
            <feComposite in2="SourceAlpha" operator="out" result="mask" />
            <Tint color={drop.color} opacity={drop.opacity} />
          </filter>
        )}
        {shadows.length > 0 && (
          <filter id={`${id}-inner`} {...filter}>
            {shadows.map((shadow, index) => (
              <Fragment key={index}>
                <feOffset in="SourceAlpha" dx={shadow.dx} dy={shadow.dy} />
                <feGaussianBlur stdDeviation={shadow.blur} result="blur" />
                {/* Outline × (1 − blur): keeps the glow on anti-aliased edge pixels. */}
                <feComposite in="SourceAlpha" in2="blur" operator="out" result="mask" />
                <Tint color={shadow.color} opacity={shadow.opacity} result={`shadow${index}`} />
              </Fragment>
            ))}
            <feMerge>
              {shadows.map((_, index) => (
                <feMergeNode key={index} in={`shadow${index}`} />
              ))}
            </feMerge>
          </filter>
        )}
      </defs>
    </g>
  )
}
