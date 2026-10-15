/** Resolves any CSS color (rgb, oklch, ...) to sRGB channels and alpha through a 1×1 canvas. */
function toRgba(ctx: CanvasRenderingContext2D, color: string) {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return { r, g, b, a: a / 255 }
}

/** Opacity of `el` combined with the ones of its ancestors (a fading layer is partly see-through). */
function effectiveOpacity(el: Element) {
  let opacity = 1
  for (let node: Element | null = el; node; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity)
  }
  return opacity
}

/**
 * Whether the page behind the viewport point is dark. Composites the backgrounds of the elements
 * under the point, top-most first, with their opacity, so a section fading from light to dark
 * (statistics) is judged on what is visible right now. `ignore` elements (the header) are skipped.
 */
export function isBackdropDark(x: number, y: number, ignore: Element | null) {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!ctx) return false

  const layers = [...document.body.querySelectorAll("*")].filter((el) => {
    if (ignore?.contains(el)) return false
    const rect = el.getBoundingClientRect()
    return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom
  })

  let [r, g, b, transmittance] = [0, 0, 0, 1]
  for (const el of layers.reverse()) {
    const bg = toRgba(ctx, getComputedStyle(el).backgroundColor)
    const alpha = bg.a * effectiveOpacity(el)
    if (alpha === 0) continue
    r += transmittance * alpha * bg.r
    g += transmittance * alpha * bg.g
    b += transmittance * alpha * bg.b
    transmittance *= 1 - alpha
    if (transmittance < 0.01) break
  }
  // Whatever is still see-through is the white page.
  r += transmittance * 255
  g += transmittance * 255
  b += transmittance * 255

  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5
}

/**
 * Whether the section filling most of the viewport is dark. Picks the section with the largest
 * visible height, then judges the backdrop at the middle of its visible part along the vertical
 * line `x`, so the theme flips once a section takes over half the screen, not once the previous
 * one is fully gone.
 */
export function isDominantSectionDark(x: number, ignore: Element | null) {
  let best: { y: number; visible: number } | null = null
  for (const section of document.querySelectorAll("main > section, footer")) {
    const { top, bottom } = section.getBoundingClientRect()
    const from = Math.max(top, 0)
    const to = Math.min(bottom, window.innerHeight)
    if (to - from > (best?.visible ?? 0)) best = { y: (from + to) / 2, visible: to - from }
  }
  return best ? isBackdropDark(x, best.y, ignore) : false
}
