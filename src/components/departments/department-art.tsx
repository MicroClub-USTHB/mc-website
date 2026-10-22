import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { DepartmentId } from "@/const/departments"
import { cn } from "@/lib/utils"

const ART_DIR = join(process.cwd(), "src/components/departments/art")

/**
 * Splits a generated art SVG into its `<defs>` and its tagged shapes: each run of consecutive
 * `<g data-el>` with the same tag (same role and transforms) becomes one layer, in paint order.
 */
function splitArt(svg: string) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)![1]
  const inner = svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"))
  let defs = ""
  const layers: { tag: string; body: string }[] = []
  let depth = 0
  let start = 0
  let tag = ""
  for (const match of inner.matchAll(/<(\/?)[\w:-]+(?:\s[^>]*?)?(\/?)>/g)) {
    const [element, closing, selfClosing] = match
    if (selfClosing) continue
    if (!closing) {
      if (depth++ === 0) {
        start = match.index + element.length
        tag = element
      }
      continue
    }
    if (--depth > 0) continue
    const body = inner.slice(start, match.index)
    if (tag.startsWith("<defs")) defs += body
    else if (layers.at(-1)?.tag === tag) layers.at(-1)!.body += body
    else layers.push({ tag, body })
  }
  return { viewBox, defs, layers }
}

/**
 * A department's illustration, inlined so its shapes can move between the strip and the card
 * (see `scripts/department-art.mjs`, which generates `art/<id>.svg` from the Figma variants).
 * Each group of shapes moving together is its own `<svg>` (one shared `<defs>`), moved with a CSS
 * transform on that element: the browser composites it on the GPU, where a transform inside a
 * single SVG would repaint the whole art, filters and blurs included, every frame.
 * The layers are drawn at the art's size in px (one px per viewBox unit, so the transforms keep
 * the art's units), scaled to the panel (`--s`).
 * In the accordion, it opens the card under its header (`--hh`): its window shows the card art
 * down to the footer tab, the text follows. The closed bar's shapes sit on the window's top (see
 * `department-panels.tsx`), so the art keeps its place while the card unfolds below. From `lg`,
 * drawn over the whole panel in Figma card coordinates (the frame's 2px stroke sits outside the
 * panel), scaled with the row (`--k`).
 */
export function DepartmentArt({ id }: { id: DepartmentId }) {
  const { viewBox, defs, layers } = splitArt(readFileSync(join(ART_DIR, `${id}.svg`), "utf8"))
  const html =
    `<svg width="0" height="0" aria-hidden="true" focusable="false"><defs>${defs}</defs></svg>` +
    layers
      .map(
        ({ tag, body }) =>
          `${tag.replace("<g", `<svg viewBox="${viewBox}" fill="none" aria-hidden="true" focusable="false"`)}${body}</svg>`,
      )
      .join("")

  const [, , width, height] = viewBox.split(" ").map(Number)

  return (
    <div className="order-first aspect-606/420 lg:order-none lg:aspect-auto">
      <div
        // The window ends at the tab (785 of the 832 frame, 5.65% from the bottom) and starts at
        // 785 - 420 × 610/606, 43.54% down the art: that line sits under the header. Clipped to the
        // header and the window: the text follows.
        style={{ aspectRatio: `${width} / ${height}` }}
        className="absolute top-(--hh) left-0 -z-10 w-full -translate-y-[43.54%] [clip-path:inset(calc(43.54%-var(--hh))_0_5.65%_0)] motion-safe:transition-[top] motion-safe:duration-700 motion-safe:ease-out-expo lg:top-[calc(-0.125rem*var(--k))] lg:left-[calc(-0.125rem*var(--k))] lg:w-[calc(38.125rem*var(--k))] lg:translate-y-0 lg:[clip-path:none]"
      >
        <div
          // `--s` scales the art's units to the panel: below `lg`, the art spans the panel (`--pw`).
          style={{ width, height }}
          className={cn(
            "absolute top-0 left-0 origin-top-left [scale:var(--s)] [&>svg]:absolute [&>svg]:inset-0 [&>svg]:size-full [&>svg]:overflow-visible",
            "[--s:tan(atan2(var(--pw,100cqw),610px))] lg:[--s:tan(atan2(38.125rem*var(--k),610px))]",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
