/**
 * Hero canvas (Figma "HERO SECTION"): a whiteboard larger than the screen that visitors explore by
 * dragging, like significa.co/careers. Sizes in px.
 */
export const HERO_CANVAS = {
  /** Figma "Hero Section" frame. */
  width: 2481,
  height: 1821,
  /** Dot grid of the Figma background: one dot every 38px. */
  gridSpacing: 38,
  /** Figma "Desktop - 21": the part of the canvas seen first, centred in the screen. */
  initialView: { x: 469, y: 464, width: 1440, height: 1024 },
} as const

export type HeroCanvasItemId =
  | "sticky-note"
  | "todo-list"
  | "photobooth"
  | "voice-note"
  | "ar-card"
  | "activities"
  | "wins"
  | "level-up"
  | "robotics"
  | "stickers"
  | "playground"

export type HeroCanvasItem = {
  id: HeroCanvasItemId
  /** Top-left corner on the canvas, in px from its top-left corner. */
  x: number
  y: number
  /** Tilt in degrees, around the top-left corner (as Figma places rotated layers). */
  rotate?: number
}

/**
 * Elements on the canvas, placed as in the final Figma "HERO SECTION" (top-left corner of each
 * layer, before its rotation). The headline sits in the first view, the other elements around it.
 */
export const HERO_ITEMS: HeroCanvasItem[] = [
  { id: "wins", x: 256, y: 29 },
  { id: "robotics", x: 1689, y: 44 },
  { id: "sticky-note", x: 1306.71, y: 247, rotate: 19.63 },
  { id: "voice-note", x: 1829, y: 566 },
  { id: "activities", x: 114, y: 727 },
  { id: "photobooth", x: 1788, y: 816 },
  // The Figma button sits at (2130, 944): the "+1 LVL" space above it is part of the element.
  { id: "level-up", x: 2130, y: 858.44 },
  { id: "ar-card", x: 2029.32, y: 1107, rotate: 7.79 },
  { id: "todo-list", x: 234, y: 1215.42, rotate: -11.88 },
  // The playground spans the whole canvas: its pile sits on the canvas floor.
  { id: "playground", x: 0, y: 0 },
  // Last: the stickers sit over the other elements and span the whole canvas.
  { id: "stickers", x: 0, y: 0 },
]
