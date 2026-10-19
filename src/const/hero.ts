/**
 * Hero canvas (Figma "HERO SECTION"): a whiteboard larger than the screen that visitors explore by
 * dragging, like significa.co/careers. Sizes in px.
 */
export const HERO_CANVAS = {
  width: 3000,
  height: 3000,
  /** Dot grid of the Figma background: one dot every 38px. */
  gridSpacing: 38,
} as const

export type HeroCanvasItem = {
  id: string
  /** Top-left corner on the canvas, in px from its top-left corner. */
  x: number
  y: number
}

/** Elements placed on the canvas, found while exploring it. Empty for now. */
export const HERO_ITEMS: HeroCanvasItem[] = []
