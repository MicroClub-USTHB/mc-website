/** Figma "sticker" frame (text on a die-cut outline), in px. */
const FRAME = { width: 345.281, height: 88 } as const
/** Left edge of the text in the frame: the outline sticks out 8px on each side of it. */
const TEXT_LEFT = 8
const TEXT_SIZE = 23.299
const TEXT_TRACKING = -1.3979
/** The line box of the Figma text, centred on the frame. */
const TEXT_CENTER = 43.93
/** Render scale: the sticker texture is capped at 1024px by the sticker peel. */
const SCALE = 2.96

export type TextSticker = {
  /** The die-cut outline (Figma vector), already sized for the frame. */
  outline: string
  text: string
  /** Text color, as a CSS color. */
  color: string
  /** Distance from the top of the frame to the top of the outline (Figma). */
  outlineTop: number
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

/**
 * Draws a text sticker (uppercase title on its outline) to a PNG data URL, at the Figma size,
 * so it can be used as the texture of a die-cut sticker. The text uses the page's sans font.
 */
export async function renderTextSticker({ outline, text, color, outlineTop }: TextSticker) {
  const family = getComputedStyle(document.body).fontFamily
  const font = `500 ${TEXT_SIZE * SCALE}px ${family}`
  // Waits for the web font alone (the first family): the `next/font` fallback face is
  // `local(Arial)`, which fails where Arial is not installed (Linux) and would reject the whole
  // load. Drawn anyway if the web font fails too (offline), in the fallback font.
  await document.fonts
    .load(`500 ${TEXT_SIZE * SCALE}px ${family.split(",")[0]}`, text)
    .catch(() => {})
  const image = await loadImage(outline)

  const canvas = document.createElement("canvas")
  canvas.width = Math.round(FRAME.width * SCALE)
  canvas.height = Math.round(FRAME.height * SCALE)
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.drawImage(
    image,
    0,
    outlineTop * SCALE,
    image.naturalWidth * SCALE,
    image.naturalHeight * SCALE,
  )

  ctx.font = font
  ctx.letterSpacing = `${TEXT_TRACKING * SCALE}px`
  ctx.fillStyle = color
  ctx.textBaseline = "alphabetic"
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText(text)
  // Like the CSS line box: the baseline sits below the centre by half of (ascent - descent).
  ctx.fillText(
    text.toUpperCase(),
    TEXT_LEFT * SCALE,
    (TEXT_CENTER + (ascent - descent) / (2 * SCALE)) * SCALE,
  )
  return canvas.toDataURL("image/png")
}

/** A CSS color from a token (`--foreground`), resolved for canvas and WebGL, which ignore `var()`. */
export function cssToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export const TEXT_STICKER_FRAME = FRAME
