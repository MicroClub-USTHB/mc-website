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

export type HeroCanvasItemId =
  | "sticky-note"
  | "todo-list"
  | "photobooth"
  | "voice-note"
  | "ar-card"
  | "activities"
  | "stickers"
  | "playground"

export type HeroCanvasItem = {
  id: HeroCanvasItemId
  /** Top-left corner on the canvas, in px from its top-left corner. */
  x: number
  y: number
  /** Slight tilt, in degrees, like things pinned on a board. */
  rotate?: number
}

/**
 * Elements on the canvas. The first view (canvas centre, about 1440×900 on desktop) shows the
 * sticky note, the to-do list and the top of the photobooth, so the board reads as a board with
 * things to play with; the voice note and the AR card wait just off screen, found by exploring.
 */
export const HERO_ITEMS: HeroCanvasItem[] = [
  { id: "sticky-note", x: 1010, y: 1170 },
  { id: "todo-list", x: 1760, y: 1220 },
  { id: "photobooth", x: 1400, y: 1560 },
  { id: "voice-note", x: 2330, y: 960 },
  { id: "ar-card", x: 470, y: 1520 },
  { id: "activities", x: 1790, y: 1690 },
  // The playground spans the whole canvas: its pile sits centred on the canvas floor.
  { id: "playground", x: 0, y: 0 },
  // Last: the stickers sit over the other elements and span the whole canvas.
  { id: "stickers", x: 0, y: 0 },
]
