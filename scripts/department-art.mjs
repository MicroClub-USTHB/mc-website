/**
 * Builds the animated "Our Departments" illustrations from the Figma exports.
 *
 * Each department has two component variants exported as SVG: the closed strip (135×828) and the
 * open card (606×828). Figma flattens both into plain shapes without layer names, so this script
 * pairs them by geometry, like Figma's smart animate would: a closed shape and an open shape are
 * the same element when one is the other moved and uniformly scaled. Shapes sharing a transform
 * move together, so a glyph or a label travels as one piece.
 *
 * Output: one SVG per department, drawn in open-card coordinates, where every shape is tagged:
 * - `data-el="move"`: in both variants; `--closed` is the CSS transform to its strip place;
 * - `data-el="in"`: only in the open card, fades in (from its morph partner's place, `--closed`);
 * - `data-el="out"`: only in the closed strip, drawn there, fades out (towards `--open`).
 * The card texts, tab and frame are dropped: the page renders them.
 *
 * Usage: node scripts/department-art.mjs <exports dir> [out dir]
 * The exports dir holds Figma's `dep=<id>, state=<closed|open>.svg` files.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const DEPARTMENTS = ["design", "marketing", "dev", "comm", "multi", "relex", "irhr", "ops"]
/** Bottom of the art area in the frames: the footer tab starts below. */
const ART_BOTTOM = 785
/** Colours of the outlined card texts (title, tagline, description, link). */
const TEXT_PAINTS = new Set(["#1E1B4B", "#54588B", "#000350"])
/** Card texts sit in this top-left block of the open card. */
const TEXT_BLOCK = { right: 470, bottom: 420 }
/** Max fit error between two shapes, as a fraction of their size, to call them the same. */
const FIT_TOLERANCE = 0.015

// --- SVG parsing -------------------------------------------------------------------------------

/** Minimal parser for Figma's SVG output: elements and quoted attributes, with source ranges. */
function parse(source) {
  const root = { tag: "#root", attrs: {}, children: [] }
  const stack = [root]
  const tagPattern = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g
  for (const match of source.matchAll(tagPattern)) {
    const [all, closing, tag, attrText, selfClosing] = match
    const end = match.index + all.length
    if (closing) {
      stack.pop().end = end
      continue
    }
    const attrs = Object.fromEntries(
      [...attrText.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
    )
    const element = { tag, attrs, children: [], start: match.index, end, source }
    stack.at(-1).children.push(element)
    if (!selfClosing) stack.push(element)
  }
  return root.children[0]
}

const raw = (element) => element.source.slice(element.start, element.end)

// --- Geometry ----------------------------------------------------------------------------------

const IDENTITY = [1, 0, 0, 1, 0, 0]

function multiply([a1, b1, c1, d1, e1, f1], [a2, b2, c2, d2, e2, f2]) {
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ]
}

function parseTransform(text = "") {
  let matrix = IDENTITY
  for (const [, name, args] of text.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = args
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
    let next = IDENTITY
    if (name === "matrix") next = n
    else if (name === "translate") next = [1, 0, 0, 1, n[0], n[1] ?? 0]
    else if (name === "scale") next = [n[0], 0, 0, n[1] ?? n[0], 0, 0]
    else if (name === "rotate") {
      const [angle, cx = 0, cy = 0] = n
      const rad = (angle * Math.PI) / 180
      const [cos, sin] = [Math.cos(rad), Math.sin(rad)]
      next = multiply(multiply([1, 0, 0, 1, cx, cy], [cos, sin, -sin, cos, 0, 0]), [
        1,
        0,
        0,
        1,
        -cx,
        -cy,
      ])
    }
    matrix = multiply(matrix, next)
  }
  return matrix
}

const apply = ([a, b, c, d, e, f], [x, y]) => [a * x + c * y + e, b * x + d * y + f]

/** End and control points of a path: their hull contains the curve, enough to compare shapes. */
function pathPoints(d) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? []
  const points = []
  let [x, y, startX, startY] = [0, 0, 0, 0]
  let command = ""
  let i = 0
  const next = () => Number(tokens[i++])
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) command = tokens[i++]
    const relative = command === command.toLowerCase()
    const [ox, oy] = relative ? [x, y] : [0, 0]
    switch (command.toUpperCase()) {
      case "M":
      case "L":
      case "T":
        x = ox + next()
        y = oy + next()
        if (command.toUpperCase() === "M") [startX, startY] = [x, y]
        points.push([x, y])
        if (command === "M") command = "L"
        if (command === "m") command = "l"
        break
      case "H":
        x = (relative ? x : 0) + next()
        points.push([x, y])
        break
      case "V":
        y = (relative ? y : 0) + next()
        points.push([x, y])
        break
      case "C":
        points.push([ox + next(), oy + next()], [ox + next(), oy + next()])
        x = ox + next()
        y = oy + next()
        points.push([x, y])
        break
      case "S":
      case "Q":
        points.push([ox + next(), oy + next()])
        x = ox + next()
        y = oy + next()
        points.push([x, y])
        break
      case "A": {
        const [rx, ry] = [next(), next()]
        i += 3
        x = ox + next()
        y = oy + next()
        points.push([x - rx, y - ry], [x + rx, y + ry])
        break
      }
      case "Z":
        ;[x, y] = [startX, startY]
        break
      default:
        i++
    }
  }
  return points
}

function shapePoints(element) {
  const n = (name) => Number(element.attrs[name] ?? 0)
  switch (element.tag) {
    case "rect": {
      const [x, y, w, h] = [n("x"), n("y"), n("width"), n("height")]
      return [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ]
    }
    case "circle":
    case "ellipse": {
      const [rx, ry] = element.tag === "circle" ? [n("r"), n("r")] : [n("rx"), n("ry")]
      const [cx, cy] = [n("cx"), n("cy")]
      return [
        [cx - rx, cy - ry],
        [cx + rx, cy - ry],
        [cx + rx, cy + ry],
        [cx - rx, cy + ry],
      ]
    }
    case "line":
      return [
        [n("x1"), n("y1")],
        [n("x2"), n("y2")],
      ]
    case "path":
      return pathPoints(element.attrs.d ?? "")
    case "polygon":
    case "polyline": {
      const values = (element.attrs.points ?? "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
      return values.flatMap((_, k) => (k % 2 ? [] : [[values[k], values[k + 1]]]))
    }
    default:
      return []
  }
}

/** Every drawn shape under `element`, with its paint and points in frame coordinates. */
function leaves(element, defs, matrix = IDENTITY, inherited = "") {
  const own = multiply(matrix, parseTransform(element.attrs.transform))
  const paint = [
    inherited,
    element.attrs.fill,
    element.attrs.stroke,
    element.attrs.opacity,
    element.attrs["fill-opacity"],
    element.attrs.filter && filterKind(element.attrs.filter, defs),
  ]
    .filter(Boolean)
    .join("|")
  if (element.tag === "g") return element.children.flatMap((c) => leaves(c, defs, own, paint))
  if (element.tag === "use") {
    const target = defs.get((element.attrs["xlink:href"] ?? element.attrs.href ?? "").slice(1))
    return target ? leaves(target, defs, own, paint) : []
  }
  const points = shapePoints(element).map((point) => apply(own, point))
  return points.length ? [{ paint, points }] : []
}

/** A filter's primitives, without ids: two inner shadows match whatever their node id. */
function filterKind(reference, defs) {
  const filter = defs.get(reference.match(/#([^)]+)/)?.[1])
  return filter ? filter.children.map((primitive) => primitive.tag).join(",") : "filter"
}

function bounds(points) {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const box = { x: Math.min(...xs), y: Math.min(...ys), right: Math.max(...xs) }
  box.bottom = Math.max(...ys)
  box.size = Math.max(box.right - box.x, box.bottom - box.y, 1e-6)
  return box
}

// --- Pairing -----------------------------------------------------------------------------------

/** One top-level art shape: its drawn points, and a structure key to find its look-alikes. */
function describe(element, defs) {
  const parts = leaves(element, defs)
  const points = parts.flatMap((part) => part.points)
  const key = parts.map((part) => `${part.paint}#${part.points.length}`).join(";")
  return { element, points, key, box: bounds(points) }
}

/**
 * Least-squares similarity (move, rotate, uniform scale, mirror) taking `from` onto `to`, as a
 * matrix: points are complex numbers, `to = a·from + t` (or `a·conj(from) + t` mirrored).
 */
function fitSimilarity(from, to) {
  const centroid = (points) => [
    points.reduce((sum, [x]) => sum + x, 0) / points.length,
    points.reduce((sum, [, y]) => sum + y, 0) / points.length,
  ]
  const [fx, fy] = centroid(from)
  const [tx, ty] = centroid(to)
  let best = null
  for (const mirror of [false, true]) {
    let [re, im, norm] = [0, 0, 0]
    from.forEach(([x, y], k) => {
      const [px, py] = [x - fx, mirror ? fy - y : y - fy]
      const [qx, qy] = [to[k][0] - tx, to[k][1] - ty]
      re += px * qx + py * qy
      im += px * qy - py * qx
      norm += px * px + py * py
    })
    if (!norm) return null
    const [a, b] = [re / norm, im / norm]
    // Linear part: rotation-scale (a, b), after flipping y when mirrored.
    const linear = mirror ? [a, b, b, -a] : [a, b, -b, a]
    const matrix = [...linear, 0, 0]
    const [cx, cy] = apply(matrix, [fx, fy])
    matrix[4] = tx - cx
    matrix[5] = ty - cy
    const error = residual(matrix, from, to)
    if (!best || error < best.error) best = { matrix, error }
  }
  return best
}

/** Least-squares affine map (adds stretch and shear: a bar that only changes width). */
function fitAffine(from, to) {
  // Normal equations of [x y 1]·[a c e]ᵀ = x' and [x y 1]·[b d f]ᵀ = y'.
  const m = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const [vx, vy] = [
    [0, 0, 0],
    [0, 0, 0],
  ]
  from.forEach(([x, y], k) => {
    const row = [x, y, 1]
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) m[i][j] += row[i] * row[j]
      vx[i] += row[i] * to[k][0]
      vy[i] += row[i] * to[k][1]
    }
  })
  const solve = (v) => {
    const det = (q) =>
      q[0][0] * (q[1][1] * q[2][2] - q[1][2] * q[2][1]) -
      q[0][1] * (q[1][0] * q[2][2] - q[1][2] * q[2][0]) +
      q[0][2] * (q[1][0] * q[2][1] - q[1][1] * q[2][0])
    const d = det(m)
    if (Math.abs(d) < 1e-9) return null
    return [0, 1, 2].map(
      (col) => det(m.map((row, i) => row.map((cell, j) => (j === col ? v[i] : cell)))) / d,
    )
  }
  const [rx, ry] = [solve(vx), solve(vy)]
  if (!rx || !ry) return null
  const matrix = [rx[0], ry[0], rx[1], ry[1], rx[2], ry[2]]
  return { matrix, error: residual(matrix, from, to) }
}

/** Root mean square distance between `from` moved by `matrix` and `to`. */
function residual(matrix, from, to) {
  const sum = from.reduce((total, point, k) => {
    const [x, y] = apply(matrix, point)
    return total + (x - to[k][0]) ** 2 + (y - to[k][1]) ** 2
  }, 0)
  return Math.sqrt(sum / from.length)
}

const tolerance = (shape) => Math.max(1, FIT_TOLERANCE * shape.box.size)

/**
 * Greedy smart-animate pairing. Every look-alike pair (same paints and point structure) proposes
 * the transform that fits one onto the other; the transform carrying the most shapes wins, its
 * shapes pair up and move as one group, and the search repeats. Exact moves (similarities) go
 * first, then resizes (affine maps) for what is left.
 */
function pairShapes(closedShapes, openShapes) {
  const pairs = []
  const freeClosed = new Set(closedShapes)
  const freeOpen = new Set(openShapes)
  const alike = new Map(
    closedShapes.map((closed) => [closed, openShapes.filter((open) => open.key === closed.key)]),
  )

  for (const fit of [fitSimilarity, fitAffine]) {
    const proposals = []
    for (const closed of closedShapes) {
      for (const open of alike.get(closed)) {
        const result = fit(closed.points, open.points)
        if (result && result.error < tolerance(open)) proposals.push(result.matrix)
      }
    }
    for (;;) {
      let best = []
      let bestMatrix = null
      for (const matrix of proposals) {
        const carried = []
        const taken = new Set()
        for (const closed of freeClosed) {
          const open = alike
            .get(closed)
            .find(
              (o) =>
                freeOpen.has(o) &&
                !taken.has(o) &&
                residual(matrix, closed.points, o.points) < tolerance(o),
            )
          if (open) {
            carried.push([closed, open])
            taken.add(open)
          }
        }
        if (carried.length > best.length) [best, bestMatrix] = [carried, matrix]
      }
      if (!best.length) break
      for (const [closed, open] of best) {
        pairs.push({ closed, open, matrix: bestMatrix })
        freeClosed.delete(closed)
        freeOpen.delete(open)
      }
    }
  }
  return { pairs, closedOnly: [...freeClosed], openOnly: [...freeOpen] }
}

/**
 * Leftovers that are the same kind of element (same first paint and filter) but drawn
 * differently, like a clip bar with fewer waveform bars in the strip: paired by nearest place,
 * they travel between their boxes while crossfading, like smart animate on unmatched layers.
 */
function pairMorphs(closedShapes, openShapes, closedFrame, openFrame) {
  const kind = (shape) => shape.key.split(";")[0].replace(/#\d+$/, "")
  const place = (shape, frame) => [
    (shape.box.x + shape.box.right) / 2 / frame.width,
    (shape.box.y + shape.box.bottom) / 2 / frame.height,
  ]
  const options = closedShapes.flatMap((closed) =>
    openShapes
      .filter((open) => kind(open) === kind(closed))
      .map((open) => {
        const [cx, cy] = place(closed, closedFrame)
        const [ox, oy] = place(open, openFrame)
        const size = Math.abs(Math.log(open.box.size / closed.box.size))
        return { closed, open, cost: Math.abs(cx - ox) / 2 + Math.abs(cy - oy) + size / 4 }
      }),
  )
  const morphs = []
  const used = new Set()
  for (const option of options.sort((a, b) => a.cost - b.cost)) {
    if (used.has(option.closed) || used.has(option.open)) continue
    used.add(option.closed).add(option.open)
    morphs.push({ ...option, matrix: boxMatrix(option.closed.box, option.open.box) })
  }
  return morphs
}

/** Affine map of one bounding box onto another (stretch and move). */
function boxMatrix(from, to) {
  const span = (box) => [box.right - box.x || box.size, box.bottom - box.y || box.size]
  const [fw, fh] = span(from)
  const [tw, th] = span(to)
  const [sx, sy] = [tw / fw, th / fh]
  return [sx, 0, 0, sy, to.x - sx * from.x, to.y - sy * from.y]
}

function invert([a, b, c, d, e, f]) {
  const det = a * d - b * c
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det]
}

// --- Output ------------------------------------------------------------------------------------

/** Top-level art shapes of a frame: the clip group's content, without the frame and the tab. */
function artShapes(svg, frameWidth) {
  const content = svg.children.flatMap((child) =>
    child.tag === "g" && child.attrs["clip-path"] ? child.children : [child],
  )
  return content.filter((element) => {
    if (element.tag === "defs") return false
    const n = (name) => Number(element.attrs[name] ?? 0)
    // The frame's white background (606 or 135 wide inside a 2-3px stroke).
    return !(element.tag === "rect" && n("width") >= frameWidth - 8 && n("height") >= 700)
  })
}

/** The footer tab and its label lie below the art area. */
const isTab = ({ box }) => box.y >= ART_BOTTOM - 4

function isCardText({ element, box }) {
  const paints = [element.attrs.fill, element.attrs.stroke].filter(Boolean)
  return (
    element.tag === "path" &&
    paints.length > 0 &&
    paints.every((paint) => TEXT_PAINTS.has(paint.toUpperCase())) &&
    box.x < TEXT_BLOCK.right &&
    box.bottom < TEXT_BLOCK.bottom
  )
}

const round = (value) => Number(value.toFixed(3))

/** Rounds Figma's 3-4 decimals: one for path data (sub-pixel at 1x), two elsewhere. */
function compact(markup) {
  const shorten = (text, digits) =>
    text.replace(/-?\d*\.\d+/g, (number) => String(Number(Number(number).toFixed(digits))))
  return markup.replace(/(\s(?:d|points)=")([^"]*)"|="([^"]*)"/g, (all, attr, path, value) =>
    attr ? `${attr}${shorten(path, 1)}"` : `="${shorten(value, 2)}"`,
  )
}

function buildArt(id, closedSource, openSource) {
  const closedSvg = parse(closedSource)
  const openSvg = parse(openSource)
  const defs = new Map()
  for (const svg of [closedSvg, openSvg]) {
    for (const element of svg.children.find((child) => child.tag === "defs")?.children ?? []) {
      defs.set(element.attrs.id, element)
    }
  }

  const closedShapes = artShapes(closedSvg, Number(closedSvg.attrs.width))
    .map((element) => describe(element, defs))
    .filter((shape) => !isTab(shape))
  const openShapes = artShapes(openSvg, Number(openSvg.attrs.width))
    .map((element) => describe(element, defs))
    .filter((shape) => !isTab(shape) && !isCardText(shape))
  // A shape hidden under the closed strip's tab or past its edge still pairs: it is in the export.
  const { pairs, closedOnly, openOnly } = pairShapes(closedShapes, openShapes)
  const frame = (svg) => ({ width: Number(svg.attrs.width), height: Number(svg.attrs.height) })
  const morphs = pairMorphs(closedOnly, openOnly, frame(closedSvg), frame(openSvg))

  const css = (matrix) => `matrix(${matrix.map(round).join(",")})`
  // Open shapes, drawn at their strip place while closed: the inverse of the closed-to-open fit.
  const closedPlace = new Map([
    ...pairs.map((pair) => [pair.open, invert(pair.matrix)]),
    ...morphs.map((morph) => [morph.open, invert(morph.matrix)]),
  ])
  // Strip-only shapes, drawn at their strip place, travel to their morph partner while open.
  // Layered as in the strip: right above the open twin of the strip shape they sit on.
  const openTwin = new Map([...pairs, ...morphs].map(({ closed, open }) => [closed, open]))
  const above = new Map()
  let anchor = null
  for (const shape of closedShapes) {
    if (openTwin.has(shape)) anchor = openTwin.get(shape)
    if (!closedOnly.includes(shape)) continue
    const morph = morphs.find((candidate) => candidate.closed === shape)
    const style = morph ? ` style="--open:${css(morph.matrix)}"` : ""
    const markup = `<g data-el="out"${style}>${compact(raw(shape.element))}</g>`
    above.set(anchor, [...(above.get(anchor) ?? []), markup])
  }

  const body = [...(above.get(null) ?? [])]
  for (const shape of openShapes) {
    const matrix = closedPlace.get(shape)
    const type = pairs.some((pair) => pair.open === shape) ? "move" : "in"
    const style = matrix ? ` style="--closed:${css(matrix)}"` : ""
    body.push(`<g data-el="${type}"${style}>${compact(raw(shape.element))}</g>`)
    body.push(...(above.get(shape) ?? []))
  }

  const usedDefs = [...defs.values()].map((element) => compact(raw(element))).join("")
  const [, , width, height] = (openSvg.attrs.viewBox ?? "").split(" ")
  let svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${width} ${height}" fill="none" aria-hidden="true" focusable="false">` +
    `${body.join("")}<defs>${usedDefs}</defs></svg>\n`
  // Figma ids are unique per frame, not per page: prefix them with the department.
  svg = svg
    .replace(/\bid="([^"]+)"/g, `id="${id}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${id}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${id}-$1"`)

  const groups = new Set(pairs.map((pair) => pair.matrix)).size
  const fades = closedOnly.length + openOnly.length - 2 * morphs.length
  const report =
    `${pairs.length} moved (${groups} groups), ${morphs.length} morphed, ${fades} faded, ` +
    `${Math.round(svg.length / 1024)} KB`
  return { svg, report }
}

// --- Run ---------------------------------------------------------------------------------------

const [inputDir, outputDir = "src/components/departments/art"] = process.argv.slice(2)
if (!inputDir) {
  console.error("Usage: node scripts/department-art.mjs <exports dir> [out dir]")
  process.exit(1)
}

for (const id of DEPARTMENTS) {
  const read = (state) => readFileSync(join(inputDir, `dep=${id}, state=${state}.svg`), "utf8")
  const { svg, report } = buildArt(id, read("closed"), read("open"))
  writeFileSync(join(outputDir, `${id}.svg`), svg)
  console.log(`${id.padEnd(10)} ${report}`)
}
