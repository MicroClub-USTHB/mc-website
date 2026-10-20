import { HERO_CANVAS } from "@/const/hero"

/**
 * Hero playground (Figma "lwasmo"): tools and skills badges piled at the bottom of the canvas,
 * with an input that drops new boxes from the sky. Everything moves in the whole canvas. Sizes in
 * px, positions on the Figma 1440×1024 frame (the pile at rest).
 */
export const PLAYGROUND = {
  /** The pile's Figma frame (1440×1024), centred on the floor of the canvas. */
  frame: { width: 1440, height: 1024 },
  /** Gravity (px/step²), heavier than the footer tiles so the pile feels solid. */
  gravity: 0.6,
  /** Most boxes dropped at once: the oldest fades out past it. */
  maxDropped: 24,
  /** Longest message a box can carry. */
  maxLength: 80,
} as const

/** Top left of the Figma frame on the canvas: centred, on its floor. */
export const PLAYGROUND_ORIGIN = {
  x: (HERO_CANVAS.width - PLAYGROUND.frame.width) / 2,
  y: HERO_CANVAS.height - PLAYGROUND.frame.height,
} as const

export type PlaygroundBodyId =
  | "photoshop"
  | "solidworks"
  | "unity"
  | "after-effects"
  | "tools"
  | "games"
  | "skills"
  | "figma"
  | "vscode"
  | "illustrator"
  | "event"
  | "notion"
  | "flutter"
  | "arduino"
  | "github"
  | "blender"
  | "code"

export type PlaygroundBody = {
  id: PlaygroundBodyId
  /** Top-left corner on the Figma frame, in px. */
  x: number
  y: number
  width: number
  height: number
}

/** Pile order, back to front. */
export const PLAYGROUND_BODIES: PlaygroundBody[] = [
  { id: "photoshop", x: 3, y: 944, width: 80, height: 80 },
  { id: "solidworks", x: 84, y: 876, width: 80, height: 80 },
  { id: "unity", x: 194, y: 808, width: 80, height: 80 },
  { id: "after-effects", x: 276, y: 807, width: 80, height: 80 },
  { id: "tools", x: 167, y: 888, width: 179.133, height: 67.354 },
  { id: "games", x: 100, y: 956, width: 191.067, height: 67.583 },
  { id: "skills", x: 294, y: 955, width: 317.055, height: 67.583 },
  { id: "figma", x: 706, y: 945, width: 80, height: 80 },
  { id: "vscode", x: 794, y: 944, width: 80, height: 80 },
  { id: "illustrator", x: 794, y: 864, width: 80, height: 80 },
  { id: "event", x: 874, y: 922, width: 119.313, height: 103.46 },
  { id: "notion", x: 1029, y: 944, width: 80, height: 80 },
  { id: "flutter", x: 1081, y: 864, width: 80, height: 80 },
  { id: "arduino", x: 1144, y: 944, width: 80, height: 80 },
  { id: "github", x: 1224, y: 943, width: 80, height: 80 },
  { id: "blender", x: 1304, y: 943, width: 80, height: 80 },
  { id: "code", x: 1185, y: 876, width: 191.067, height: 67.583 },
]

/** The input (Figma "Input Field"): part of the pile, it can be dragged like the rest. */
export const PLAYGROUND_INPUT = {
  x: 348,
  y: 910,
  width: 372,
  height: 44,
  placeholder: "Type Something...",
} as const
