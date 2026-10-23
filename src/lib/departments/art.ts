import "server-only"

import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { DepartmentId } from "@/const/departments"

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

/** The art's size in viewBox units (one px per unit once drawn). */
export function departmentArtSize(id: DepartmentId) {
  const svg = readFileSync(join(ART_DIR, `${id}.svg`), "utf8")
  const [, , width, height] = svg
    .match(/viewBox="([^"]+)"/)![1]
    .split(" ")
    .map(Number)
  return { width, height }
}

/** The art's layers as HTML: one shared `<defs>`, then one `<svg>` per group moving together. */
export function departmentArtHtml(id: DepartmentId) {
  const { viewBox, defs, layers } = splitArt(readFileSync(join(ART_DIR, `${id}.svg`), "utf8"))
  return (
    `<svg width="0" height="0" aria-hidden="true" focusable="false"><defs>${defs}</defs></svg>` +
    layers
      .map(
        ({ tag, body }) =>
          `${tag.replace("<g", `<svg viewBox="${viewBox}" fill="none" aria-hidden="true" focusable="false"`)}${body}</svg>`,
      )
      .join("")
  )
}
