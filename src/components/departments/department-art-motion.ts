import type { DepartmentId } from "@/const/departments"
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO, EASE_OUT_QUART } from "@/lib/easing"

/** Overshoots a touch, then settles: for what springs into place. */
const EASE_BACK = [0.34, 1.4, 0.64, 1] as const
const bezier = (ease: readonly number[]) => `cubic-bezier(${ease.join(",")})`
const EXPO = bezier(EASE_OUT_EXPO)
const QUART = bezier(EASE_OUT_QUART)
const IN_OUT = bezier(EASE_IN_OUT_QUART)
const BACK = bezier(EASE_BACK)
const FALL = "cubic-bezier(0.55, 0, 1, 0.45)"
const RISE = "cubic-bezier(0, 0, 0.3, 1)"

/** Height of the art (open card coordinates), where its shapes are measured. */
const ART_HEIGHT = 832
/**
 * Longest wait of a shape behind the top one as a panel opens or closes (`--d`). None for
 * Design, Marketing and Relex: their handles, pins and links must travel in step with what they
 * hold or join.
 */
const CASCADE: Partial<Record<DepartmentId, number>> = { design: 0, marketing: 0, relex: 0 }
const DEFAULT_CASCADE = 160
/** How much of their full motion the intros play: the panels' toggles play it all. */
const CALM = 0.6
/** Time between two strips starting their intro. */
const STAGGER = 140
let nextSlot = 0

/**
 * Books the next intro start: strips coming into view together (the row from `lg`) play one
 * after the other, a strip coming in alone (the accordion, scrolled) plays right away.
 * Returns the start time (`performance.now()` clock).
 */
export function bookIntroSlot() {
  const start = Math.max(performance.now(), nextSlot)
  nextSlot = start + STAGGER
  return start
}

export type ArtMotion = { play: () => Promise<void>; cancel: () => void }

type Animate = (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => void

/** A layer to animate: its shapes, and a group around all of them that moves them as one. */
type Piece = { layer: SVGSVGElement; group: SVGGElement; shapes: SVGGraphicsElement[] }

/** Anything moved as one: a piece, or one of its own groups. */
type Movable = { group: SVGGElement }

type Point = { x: number; y: number }

/** Everything a department's choreography gets, its pieces in the order they play. */
type Scene = {
  pieces: Piece[]
  /** Where a layer's centre sits along the closed strip (down the row's strip, across the
   * accordion's bar), 0 to 1, and its `span`, its length over the strip's. */
  along: ((element: Element) => number) & { span: (element: Element) => number }
  /**
   * A point of a layer (its art units) in the space the layers share: the screen for the closed
   * strip (each layer has its own place there), the art itself once open. `scale` is the size of
   * one art unit of that layer in it.
   */
  place: (layer: SVGSVGElement, point: Point) => Point & { scale: number }
  /** Whether the strip runs down (the row's strips) rather than across (the accordion's bars). */
  vertical: boolean
  /** Middle of the panel on screen. */
  center: Point
  /** As a panel opens or closes, the layers fading out (strip-only or card-only ones). */
  leaving: Piece[]
  animate: Animate
  /** Builds more animations after `delay` (ms), from what is on screen then, and plays them. */
  later: (delay: number, build: () => void) => void
}

type Choreography = {
  /** The strip appearing, closed. */
  intro: (scene: Scene) => void
  /** Played on the shapes while they travel to the open card. */
  open: (scene: Scene) => void
  /** Played on the shapes while they travel back to the strip. */
  close?: (scene: Scene) => void
}

// --- Pieces ------------------------------------------------------------------------------------

const SVG = "http://www.w3.org/2000/svg"

/**
 * A group around all of a layer's content, made once: transformed as a whole, its shapes, their
 * outlines and their filters (shadows, glows) stay together. A CSS transform on the layer itself
 * would replace the strip's `--closed` / `--bar` transform. It sits in a second group, nudged on
 * hover (see `hoverArt`), so the hover never fights the intro or the panel's motion.
 */
function groupOf(layer: SVGSVGElement) {
  const first = layer.firstElementChild
  if (
    layer.childElementCount === 1 &&
    first instanceof SVGGElement &&
    first.dataset.motion === "hover" &&
    first.firstElementChild instanceof SVGGElement
  ) {
    return first.firstElementChild
  }
  const group = document.createElementNS(SVG, "g")
  group.dataset.motion = "piece"
  group.append(...layer.childNodes)
  const hover = document.createElementNS(SVG, "g")
  hover.dataset.motion = "hover"
  hover.append(group)
  layer.append(hover)
  return group
}

/** Pivot of a piece's transforms, on its shapes' box (`fill-box`): `"50% 0"`, `"left"`... */
function pivot(group: SVGGElement, origin = "center") {
  group.style.transformBox = "fill-box"
  group.style.transformOrigin = origin
}

/** Transforms written in the layer's art units, about its origin. */
function inArtUnits(group: SVGGElement) {
  group.style.transformBox = "view-box"
  group.style.transformOrigin = "0 0"
}

/** The painted shapes of a layer, not those defining its masks and clips. */
const shapesOf = (layer: Element) =>
  [...layer.querySelectorAll<SVGGraphicsElement>("rect, circle, ellipse, path")].filter(
    (shape) => !shape.closest("mask, clipPath, defs"),
  )

const has = (piece: Piece, tag: string) => piece.shapes.some((shape) => shape.tagName === tag)
const isIn = ({ layer }: Piece) => layer.dataset.el === "in"

/** A group around one element, made once, to move it alone (its own `transform` stays). */
function wrap(element: Element, name: string) {
  const parent = element.parentNode
  if (parent instanceof SVGGElement && parent.dataset.motion === name) return parent
  const group = document.createElementNS(SVG, "g")
  group.dataset.motion = name
  element.before(group)
  group.append(element)
  return group
}

/** A layer's own groups, as drawn (each with its filter): the parts of a piece. */
const itemsOf = ({ group }: Piece) =>
  [...group.children].filter((child): child is SVGGElement => child instanceof SVGGElement)

/** A point on screen in an element's own units. */
function toLocal(element: SVGGraphicsElement, { x, y }: Point) {
  const matrix = element.getScreenCTM()
  return matrix ? new DOMPoint(x, y).matrixTransform(matrix.inverse()) : { x, y }
}

/** A point of an element (its own units) on screen. */
function toScreen(element: SVGGraphicsElement, { x, y }: Point) {
  const matrix = element.getScreenCTM()
  return matrix ? new DOMPoint(x, y).matrixTransform(matrix) : { x, y }
}

/** Middle of a layer's shapes in the art, 0 (top) to 1. */
function artHeight(layer: SVGGraphicsElement) {
  const { y, height } = layer.getBBox()
  return Math.min(1, Math.max(0, (y + height / 2) / ART_HEIGHT))
}

/** Cascade delay (ms) of a layer as its panel opens or closes, see `cascadeLayers`. */
const delayOf = ({ layer }: Piece) => parseFloat(layer.style.getPropertyValue("--d")) || 0

/** A cubic-bézier easing as a function, to sample motions that must stay in step. */
function easing([x1, y1, x2, y2]: readonly number[]) {
  const curve = (a: number, b: number, t: number) =>
    3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3
  return (x: number) => {
    let [low, high] = [0, 1]
    for (let i = 0; i < 24; i++) {
      const middle = (low + high) / 2
      if (curve(x1, x2, middle) < x) low = middle
      else high = middle
    }
    return curve(y1, y2, (low + high) / 2)
  }
}

// --- Effects (whole pieces, transform and opacity only) -----------------------------------------

/** Grows out of a point of itself, turning into place. */
function unfold(
  animate: Animate,
  { group }: Movable,
  delay: number,
  { origin = "center", scale = 0, turn = 0, duration = 900, easing = EXPO } = {},
) {
  pivot(group, origin)
  animate(
    group,
    [
      { transform: `scale(${scale}) rotate(${turn}deg)`, opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.35 },
      { transform: "none", opacity: 1 },
    ],
    { delay, duration, easing },
  )
}

/** Stretches out of one edge, along its length. */
function stretch(animate: Animate, { group }: Movable, delay: number, origin: string, from = 0) {
  pivot(group, origin)
  animate(group, [{ transform: `scaleX(${from})` }, { transform: "none" }], {
    delay,
    duration: 900,
    easing: EXPO,
  })
}

/** Slides in sheared, straightening as it lands. */
function shear(
  animate: Animate,
  { group }: Movable,
  delay: number,
  distance: number,
  skew: number,
) {
  pivot(group, "left bottom")
  animate(
    group,
    [
      { transform: `translateX(${-distance}px) skewX(${skew}deg)`, opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.4 },
      { transform: "none", opacity: 1 },
    ],
    { delay, duration: 900, easing: EXPO },
  )
}

/** Falls in, lands with one soft bounce. */
function drop(animate: Animate, { group }: Movable, delay: number, height: number, tilt: number) {
  pivot(group, "50% 100%")
  animate(
    group,
    [
      { transform: `translateY(${-height}px) rotate(${tilt}deg)`, opacity: 0, easing: FALL },
      { transform: "none", opacity: 1, offset: 0.55, easing: RISE },
      { transform: `translateY(${-height / 10}px)`, offset: 0.78, easing: FALL },
      { transform: "none" },
    ],
    { delay, duration: 1000, easing: "linear" },
  )
}

/** Settles from a slight turn while it travels: weight on the move. */
function sway(
  animate: Animate,
  { group }: Movable,
  delay: number,
  turn: number,
  origin = "center",
) {
  pivot(group, origin)
  animate(group, [{ transform: `rotate(${turn}deg)` }, { transform: "none" }], {
    delay,
    duration: 1000,
    easing: BACK,
  })
}

/** Keyframes about a point of a piece's shapes' box, each keyframe easing into the next. */
function keyed(
  animate: Animate,
  { group }: Movable,
  origin: string,
  keyframes: Keyframe[],
  delay: number,
  duration: number,
  easing = "linear",
) {
  pivot(group, origin)
  animate(group, keyframes, { delay, duration, easing })
}

/** Rises and turns into place, then nods once: a head about to speak. */
function nod(animate: Animate, piece: Movable, delay: number, turn: number, amount = 1) {
  keyed(
    animate,
    piece,
    "50% 100%",
    [
      { transform: `translateY(${24 * amount}px) rotate(${turn}deg)`, opacity: 0, easing: QUART },
      {
        transform: `translateY(0px) rotate(${-turn * 0.35}deg)`,
        opacity: 1,
        offset: 0.45,
        easing: IN_OUT,
      },
      { transform: `translateY(0px) rotate(${turn * 0.15}deg)`, offset: 0.72, easing: IN_OUT },
      { transform: "translateY(0px) rotate(0deg)" },
    ],
    delay,
    1100,
  )
}

/** Slides out of its left edge like a notification, and pings once it is in. */
function toast(animate: Animate, piece: Movable, delay: number, amount = 1) {
  keyed(
    animate,
    piece,
    "0 50%",
    [
      {
        transform: `translateX(${-36 * amount}px) scale(${1 - 0.4 * amount})`,
        opacity: 0,
        easing: BACK,
      },
      { transform: "translateX(0px) scale(1)", opacity: 1, offset: 0.55, easing: IN_OUT },
      { transform: `translateX(0px) scale(${1 + 0.06 * amount})`, offset: 0.75, easing: IN_OUT },
      { transform: "translateX(0px) scale(1)" },
    ],
    delay,
    1000,
  )
}

/** Comes in, then shakes on it: up, down, settled. */
function shake(animate: Animate, piece: Movable, delay: number, origin = "center", amount = 1) {
  const at = (turn: number, y: number, scale = 1) =>
    `scale(${scale}) rotate(${turn * amount}deg) translateY(${y * amount}px)`
  keyed(
    animate,
    piece,
    origin,
    [
      { transform: at(0, 0, 1 - 0.5 * amount), opacity: 0, easing: BACK },
      { transform: at(0, 0), opacity: 1, offset: 0.4, easing: IN_OUT },
      { transform: at(-4, -5), offset: 0.55, easing: IN_OUT },
      { transform: at(3, 4), offset: 0.7, easing: IN_OUT },
      { transform: at(-1.5, -2), offset: 0.85, easing: IN_OUT },
      { transform: at(0, 0) },
    ],
    delay,
    1500,
  )
}

/** Swings in about its bottom right corner (a magnifier's grip), sweeping once before it rests. */
function search(animate: Animate, piece: Movable, delay: number) {
  keyed(
    animate,
    piece,
    "100% 100%",
    [
      { transform: "rotate(-40deg) scale(0.6)", opacity: 0, easing: EXPO },
      { transform: "rotate(10deg) scale(1)", opacity: 1, offset: 0.45, easing: IN_OUT },
      { transform: "rotate(-5deg) scale(1)", offset: 0.72, easing: IN_OUT },
      { transform: "rotate(0deg) scale(1)" },
    ],
    delay,
    1400,
  )
}

/** Snaps onto its track from one side (`from`: 1 the left, -1 the right), squeezed as it comes. */
function snap(animate: Animate, piece: Movable, delay: number, from: number, amount = 1) {
  keyed(
    animate,
    piece,
    from > 0 ? "left" : "right",
    [
      { transform: `translateX(${-48 * from * amount}px) scaleX(${1 - 0.6 * amount})`, opacity: 0 },
      { opacity: 1, offset: 0.3 },
      { transform: "translateX(0px) scaleX(1)", opacity: 1 },
    ],
    delay,
    900,
    EXPO,
  )
}

/** Drops down from its knob (the top), then scrubs across to its frame. */
function scrub(animate: Animate, piece: Movable, delay: number, distance: number) {
  keyed(
    animate,
    piece,
    "50% 0",
    [
      { transform: `translateX(${-distance}px) scaleY(0)`, opacity: 0, easing: EXPO },
      {
        transform: `translateX(${-distance}px) scaleY(1)`,
        opacity: 1,
        offset: 0.3,
        easing: IN_OUT,
      },
      { transform: `translateX(${distance * 0.08}px) scaleY(1)`, offset: 0.8, easing: IN_OUT },
      { transform: "translateX(0px) scaleY(1)" },
    ],
    delay,
    1600,
  )
}

/** Waveform bars: small rounded rects. */
const isBar = (shape: SVGGraphicsElement) =>
  shape instanceof SVGRectElement && shape.hasAttribute("rx")

/** A waveform's bars rise from silence, left to right, as if the clip started playing. */
function levels(animate: Animate, piece: Piece, delay: number) {
  const bars = piece.shapes
    .filter(isBar)
    .map((bar) => ({ group: wrap(bar, "bar"), x: boxInLayer(bar).x }))
    .sort((a, b) => a.x - b.x)
  bars.forEach(({ group }, index) => {
    pivot(group)
    animate(group, [{ transform: "scaleY(0.1)" }, { transform: "none" }], {
      delay: delay + (index / bars.length) * 420,
      duration: 600,
      easing: BACK,
    })
  })
}

/** Dealt from a point (its own units) like a card off the deck, spinning down into place. */
function deal(
  animate: Animate,
  { group }: Movable,
  delay: number,
  from: Point,
  turn: number,
  amount = 1,
) {
  const box = group.getBBox()
  const dx = (from.x - box.x - box.width / 2) * 0.6 * amount
  const dy = (from.y - box.y - box.height / 2) * 0.6 * amount
  pivot(group)
  animate(
    group,
    [
      {
        transform: `translate(${dx}px,${dy}px) rotate(${turn}deg) scale(${1 - 0.3 * amount})`,
        opacity: 0,
      },
      { opacity: 1, offset: 0.25 },
      { transform: "translate(0px,0px) rotate(0deg) scale(1)", opacity: 1 },
    ],
    { delay, duration: 1100, easing: EXPO },
  )
}

const union = (a: DOMRect, b: DOMRect) => {
  const [left, top] = [Math.min(a.x, b.x), Math.min(a.y, b.y)]
  const right = Math.max(a.x + a.width, b.x + b.width)
  const bottom = Math.max(a.y + a.height, b.y + b.height)
  return new DOMRect(left, top, right - left, bottom - top)
}

const overlaps = (a: DOMRect, b: DOMRect) =>
  a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height

/**
 * Lands on its feet with a squash, out of the air (`fromAir`) or hopping off the ground as it
 * travels. The `elements` (groups side by side, one drawn object) share the same transform about
 * their common foot, so they stay together.
 */
function bounce(
  animate: Animate,
  elements: SVGGElement[],
  delay: number,
  height: number,
  fromAir: boolean,
  amount = 1,
) {
  const box = elements.map((element) => DOMRect.fromRect(element.getBBox())).reduce(union)
  const foot = { x: box.x + box.width / 2, y: box.y + box.height }
  // Squash and stretch, by `amount`.
  const at = (y: number, sx: number, sy: number) =>
    `translate(${foot.x}px,${foot.y}px) translateY(${y}px) scale(${1 + (sx - 1) * amount},${1 + (sy - 1) * amount}) translate(${-foot.x}px,${-foot.y}px)`
  const keyframes: Keyframe[] = fromAir
    ? [
        { transform: at(-height, 1, 1), opacity: 0, easing: FALL },
        { transform: at(0, 1.12, 0.86), opacity: 1, offset: 0.45, easing: RISE },
        { transform: at(-height / 6, 0.97, 1.04), offset: 0.72, easing: FALL },
        { transform: at(0, 1, 1) },
      ]
    : [
        { transform: at(0, 1, 1), easing: RISE },
        { transform: at(-height, 0.96, 1.05), offset: 0.4, easing: FALL },
        { transform: at(0, 1.1, 0.88), offset: 0.68, easing: RISE },
        { transform: at(-height / 8, 0.98, 1.02), offset: 0.84, easing: FALL },
        { transform: at(0, 1, 1) },
      ]
  for (const element of elements) {
    inArtUnits(element)
    animate(element, keyframes, { delay, duration: fromAir ? 900 : 1000, easing: "linear" })
  }
}

// --- Design ------------------------------------------------------------------------------------

/** Design's frames: a block with its quarter disc, arc and dot (all circles inside). */
const isFrame = (piece: Piece) => has(piece, "circle")
/** Selection handles: a small square and its outline. */
const isHandle = ({ shapes }: Piece) =>
  shapes.length === 2 &&
  shapes.every((shape) => shape.tagName === "rect" && shape.getBBox().width < 16)

/** A shape's box in its layer's art units, through the `transform` attributes on the way. */
function boxInLayer(shape: SVGGraphicsElement) {
  let matrix = new DOMMatrix()
  for (
    let element: Element | null = shape;
    element instanceof SVGGraphicsElement && !(element instanceof SVGSVGElement);
    element = element.parentElement
  ) {
    const own = element.transform.baseVal.consolidate()
    if (own) matrix = DOMMatrix.fromMatrix(own.matrix).multiply(matrix)
  }
  const { x, y, width, height } = shape.getBBox()
  const corners = [
    [x, y],
    [x + width, y],
    [x, y + height],
    [x + width, y + height],
  ].map(([px, py]) => matrix.transformPoint({ x: px, y: py }))
  const xs = corners.map((corner) => corner.x)
  const ys = corners.map((corner) => corner.y)
  const [left, top] = [Math.min(...xs), Math.min(...ys)]
  return new DOMRect(left, top, Math.max(...xs) - left, Math.max(...ys) - top)
}

/** A frame's block: its largest rect, the one its handles or pins sit on. */
function blockOf({ shapes }: Piece) {
  return shapes
    .filter((shape) => shape.tagName === "rect")
    .map(boxInLayer)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0]
}

const centerOf = (box: DOMRect) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 })

/** A frame (a Design frame, a Marketing card) and the handles or pins sitting on its block. */
type Rig = { frame: Piece; block: DOMRect; handles: Piece[] }

/**
 * Pairs each of the `parts` (handles, pins) with the frame whose block it sits on or against,
 * where they share `place`.
 */
function rigs(frames: Piece[], parts: Piece[], place: Scene["place"]): Rig[] {
  const rigs = frames.map((frame) => ({ frame, block: blockOf(frame), handles: [] as Piece[] }))
  for (const part of parts) {
    const center = place(part.layer, centerOf(part.layer.getBBox()))
    let best: Rig | undefined
    let nearest = 16 * center.scale
    for (const rig of rigs) {
      const { x, y, width, height } = rig.block
      const [start, end] = [
        place(rig.frame.layer, { x, y }),
        place(rig.frame.layer, { x: x + width, y: y + height }),
      ]
      const distance = Math.hypot(
        Math.max(start.x - center.x, 0, center.x - end.x),
        Math.max(start.y - center.y, 0, center.y - end.y),
      )
      if (distance < nearest) [best, nearest] = [rig, distance]
    }
    best?.handles.push(part)
  }
  return rigs
}

/**
 * Moves a frame about a point of its block (`anchor`, art units) and keeps its handles on its
 * corners: at every step the handles go where the frame takes their corner, keeping their size
 * and turning with it. The motion is sampled (`motion(t)`, t from 0 to 1) so all stay in step.
 */
function moveRig(
  { animate, place }: Scene,
  { frame, handles }: Rig,
  anchor: Point,
  delay: number,
  duration: number,
  motion: (t: number) => { scale: number; turn: number; opacity: number; handle: number },
) {
  const STEPS = 40
  const steps = Array.from({ length: STEPS + 1 }, (_, i) => ({
    t: i / STEPS,
    ...motion(i / STEPS),
  }))
  const options = { delay, duration, easing: "linear" }
  inArtUnits(frame.group)
  animate(
    frame.group,
    steps.map(({ t, scale, turn, opacity }) => ({
      offset: t,
      opacity,
      transform: `translate(${anchor.x}px,${anchor.y}px) rotate(${turn}deg) scale(${scale}) translate(${-anchor.x}px,${-anchor.y}px)`,
    })),
    options,
  )
  const pin = place(frame.layer, anchor)
  for (const handle of handles) {
    const center = centerOf(handle.layer.getBBox())
    const at = place(handle.layer, center)
    inArtUnits(handle.group)
    animate(
      handle.group,
      steps.map(({ t, scale, turn, opacity, handle: size }) => {
        // Where the frame takes the handle's corner, in the handle's units.
        const angle = (turn * Math.PI) / 180
        const [dx, dy] = [(at.x - pin.x) * scale, (at.y - pin.y) * scale]
        const x = pin.x + dx * Math.cos(angle) - dy * Math.sin(angle)
        const y = pin.y + dx * Math.sin(angle) + dy * Math.cos(angle)
        const [mx, my] = [center.x + (x - at.x) / at.scale, center.y + (y - at.y) / at.scale]
        return {
          offset: t,
          opacity,
          transform: `translate(${mx}px,${my}px) rotate(${turn}deg) scale(${size}) translate(${-center.x}px,${-center.y}px)`,
        }
      }),
      options,
    )
  }
}

const easeExpo = easing(EASE_OUT_EXPO)
const easeBack = easing(EASE_BACK)

/**
 * A design tool at work: each frame is dragged out of one corner, its handles popping in there
 * and riding its corners as it grows and turns square; the bars stretch out like rulers.
 */
const design: Choreography = {
  intro(scene) {
    const { pieces, along, animate } = scene
    const rigged = rigs(pieces.filter(isFrame), pieces.filter(isHandle), scene.place)
    rigged.forEach((rig, index) => {
      const fromLeft = index % 2 === 0
      const { x, y, width } = rig.block
      const turn = fromLeft ? -5 : 5
      moveRig(
        scene,
        rig,
        { x: fromLeft ? x : x + width, y },
        along(rig.frame.layer) * 680,
        1300,
        (t) => {
          const p = easeExpo(t)
          return {
            scale: 0.35 + 0.65 * p,
            turn: turn * (1 - p),
            opacity: Math.min(1, t / 0.12),
            handle: easeBack(Math.min(1, t / 0.3)),
          }
        },
      )
    })
    const held = new Set(rigged.flatMap(({ frame, handles }) => [frame, ...handles]))
    pieces
      .filter((piece) => !held.has(piece))
      .forEach((piece, index) => {
        const at = along(piece.layer) * 680
        if (isHandle(piece)) unfold(animate, piece, at, { turn: -45, duration: 700, easing: BACK })
        else stretch(animate, piece, at + 450, index % 2 === 0 ? "left" : "right", 0.2)
      })
  },
  open(scene) {
    const { pieces, animate } = scene
    const rigged = rigs(pieces.filter(isFrame), pieces.filter(isHandle), scene.place)
    rigged.forEach((rig, index) => {
      const { x, y } = rig.block
      if (isIn(rig.frame)) {
        moveRig(scene, rig, { x, y }, 120, 1000, (t) => {
          const p = easeExpo(t)
          return {
            scale: 0.4 + 0.6 * p,
            turn: -8 * (1 - p),
            opacity: Math.min(1, t / 0.2),
            handle: 1,
          }
        })
      } else {
        const turn = index % 2 === 0 ? -6 : 6
        moveRig(scene, rig, centerOf(rig.block), 0, 1000, (t) => ({
          scale: 1,
          turn: turn * (1 - easeBack(t)),
          opacity: 1,
          handle: 1,
        }))
      }
    })
    const held = new Set(rigged.flatMap(({ frame, handles }) => [frame, ...handles]))
    pieces
      .filter((piece) => !held.has(piece))
      .forEach((piece, index) => {
        if (has(piece, "ellipse")) unfold(animate, piece, 0, { scale: 0.5, duration: 1400 })
        else if (isHandle(piece)) {
          if (isIn(piece)) unfold(animate, piece, 280, { turn: -90, duration: 700, easing: BACK })
        } else if (isIn(piece))
          unfold(animate, piece, 360, { turn: -120, duration: 1000, easing: BACK })
        else stretch(animate, piece, 0, index % 2 === 0 ? "left" : "right", 0.4)
      })
  },
}

// --- Marketing ---------------------------------------------------------------------------------

/** Network links: thin filled paths (some layers hold a glow with them). */
const isLink = (piece: Piece) => has(piece, "path")

/** A link's axis: the centres of its two ends (it is a thin filled shape). */
function axisOf(link: SVGPathElement) {
  const length = link.getTotalLength()
  const points = Array.from({ length: 96 }, (_, i) => link.getPointAtLength((length * i) / 96))
  let [a, b] = [points[0], points[0]]
  let span = 0
  for (const p of points) {
    for (const q of points) {
      const distance = Math.hypot(p.x - q.x, p.y - q.y)
      if (distance > span) [a, b, span] = [p, q, distance]
    }
  }
  // The farthest points are opposite corners: each end's centre is the mean of the outline
  // points across that end. The outline runs along it twice and across it twice.
  const thickness = Math.max(1, (length - 2 * span) / 2)
  const [ux, uy] = [(b.x - a.x) / span, (b.y - a.y) / span]
  const end = (at: number) => {
    const across = points.filter(
      (p) => Math.abs((p.x - a.x) * ux + (p.y - a.y) * uy - at) <= thickness * 1.5,
    )
    return {
      x: across.reduce((sum, p) => sum + p.x, 0) / across.length,
      y: across.reduce((sum, p) => sum + p.y, 0) / across.length,
    }
  }
  return [end(0), end(span)]
}

/** A group around one link, made once, to stretch it in the link's own units. */
function linkGroup(link: SVGPathElement) {
  const group = wrap(link, "link")
  inArtUnits(group)
  return group
}

/** The link shapes of some layers, one by one (a layer can hold several, and a glow). */
const linksOf = (pieces: Piece[]) =>
  pieces.flatMap(({ shapes }) =>
    shapes.filter((shape): shape is SVGPathElement => shape instanceof SVGPathElement),
  )

/** Where a point of a link is on screen along `axis`, through every transform on the way. */
function onScreen(link: SVGPathElement, { x, y }: Point, axis: "x" | "y") {
  const matrix = link.getScreenCTM()
  const point = matrix ? new DOMPoint(x, y).matrixTransform(matrix) : { x, y }
  return axis === "x" ? point.x : point.y
}

/** The links in the order they sit on screen along `axis`: the order they grow in. */
function inOrder(links: SVGPathElement[], axis: "x" | "y") {
  const position = new Map(
    links.map((link) => {
      const [a, b] = axisOf(link)
      return [link, onScreen(link, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, axis)]
    }),
  )
  return [...links].sort((a, b) => position.get(a)! - position.get(b)!)
}

/**
 * Grows a link out of its end that comes first on screen along `axis` (the top in the strip,
 * the left in the card) until it reaches the other: the link itself, stretched along its own
 * direction from that end, its thickness untouched.
 */
function growLink(
  animate: Animate,
  link: SVGPathElement,
  axis: "x" | "y",
  delay: number,
  duration: number,
) {
  const ends = axisOf(link)
  const [from, to] =
    onScreen(link, ends[0], axis) <= onScreen(link, ends[1], axis) ? ends : [ends[1], ends[0]]
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
  const onto = `translate(${from.x}px,${from.y}px) rotate(${angle}deg)`
  const back = `rotate(${-angle}deg) translate(${-from.x}px,${-from.y}px)`
  animate(
    linkGroup(link),
    // Shown from its start, over anything still hiding it (see `relink`).
    [
      { transform: `${onto} scaleX(0) ${back}`, opacity: 1 },
      { transform: `${onto} scaleX(1) ${back}`, opacity: 1 },
    ],
    { delay, duration, easing: IN_OUT },
  )
}

/** The axis the closed strips run along: down the row's strips, across the accordion's bars. */
const closedAxis = () => (window.matchMedia("(width >= 64rem)").matches ? "y" : "x")

/** Time for the nodes to land in their new places as a panel opens or closes. */
const LANDING = 450
/** A link growing, and the time between two links starting: a quick chain, in order. */
const GROW = 280
const NEXT = 140

/**
 * Links (the pieces that are `isLink`) never travel with the nodes: as a panel opens or closes,
 * the links in view vanish at once; once the nodes have landed, the new ones grow between them
 * one by one, in the order they are then on screen along `axis`.
 */
function relink(scene: Scene, axis: "x" | "y", isLink: (piece: Piece) => boolean) {
  const { pieces, leaving, animate, later } = scene
  // The links only, not the glow some of their layers hold.
  for (const link of linksOf(leaving.filter(isLink))) {
    animate(linkGroup(link), [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "linear" })
  }
  const links = linksOf(pieces.filter(isLink))
  // Hidden until each one's growth, made later, starts and shows it (it composites on top).
  for (const link of links) {
    animate(linkGroup(link), [{ opacity: 0 }, { opacity: 0 }], {
      duration: LANDING + links.length * NEXT + GROW,
    })
  }
  later(LANDING, () => {
    inOrder(links, axis).forEach((link, index) => growLink(animate, link, axis, index * NEXT, GROW))
  })
}

/**
 * A signal running down the network: the links grow one after the other from the top, each
 * card (its pin on it) springing out as the signal reaches it.
 */
const marketing: Choreography = {
  intro(scene) {
    const { pieces, along, animate, vertical } = scene
    const axis = vertical ? "y" : "x"
    const next = 190
    const links = inOrder(linksOf(pieces), axis)
    const run = Math.max(1, links.length) * next
    links.forEach((link, index) => growLink(animate, link, axis, 120 + index * next, GROW))
    pieces
      .filter((piece) => !isLink(piece))
      .forEach((piece, index) => {
        unfold(animate, piece, 40 + along(piece.layer) * run, {
          origin: "50% 0",
          scale: 0.55,
          turn: index % 2 === 0 ? -5 : 5,
          duration: 1000,
          easing: BACK,
        })
      })
  },
  open(scene) {
    const { pieces, animate } = scene
    relink(scene, "x", isLink)
    pieces
      .filter((piece) => !isLink(piece))
      .forEach((piece, index) => {
        const at = artHeight(piece.layer) * 260
        if (isIn(piece)) {
          unfold(animate, piece, at + 200, { origin: "50% 0", scale: 0.4, turn: -8, easing: BACK })
        } else sway(animate, piece, at, index % 2 === 0 ? -7 : 7, "50% 0")
      })
  },
  close: (scene) => relink(scene, closedAxis(), isLink),
}

// --- Dev ---------------------------------------------------------------------------------------

/** The bug, debug, deploy tags and their chips: the bottom of the art. */
const isTag = ({ layer }: Piece) => artHeight(layer) > 0.66 && !layer.querySelector("ellipse")

/**
 * The code running: each block slides in sheared, line by line down the strip, like code
 * scrolling into an editor; then the bug, debug, deploy tags drop onto the stack, bottom first.
 */
const dev: Choreography = {
  intro({ pieces, along, animate }) {
    const RUN = 1100
    const at = (position: number) => 80 + position * RUN
    const tags = pieces.filter(isTag)
    tags
      .sort((a, b) => along(b.layer) - along(a.layer))
      .forEach((piece, index) => {
        drop(animate, piece, at(0.7) + index * 180, 55, index % 2 === 0 ? -3 : 3)
      })
    pieces
      .filter((piece) => !tags.includes(piece))
      .forEach((piece, index) => {
        shear(animate, piece, at(along(piece.layer)), index % 2 === 0 ? 24 : -24, -10)
      })
  },
  open({ pieces, animate }) {
    const tags = pieces.filter(isTag)
    tags
      .sort((a, b) => artHeight(b.layer) - artHeight(a.layer))
      .forEach((piece, index) => {
        const at = delayOf(piece) + 120 + index * 90
        if (isIn(piece)) drop(animate, piece, at, 70, index % 2 === 0 ? -5 : 4)
        else sway(animate, piece, at, index % 2 === 0 ? -8 : 8, "50% 100%")
      })
    pieces
      .filter((piece) => !tags.includes(piece))
      .forEach((piece, index) => {
        const at = delayOf(piece)
        if (has(piece, "ellipse")) unfold(animate, piece, at, { scale: 0.5, duration: 1400 })
        else if (isIn(piece)) shear(animate, piece, at + 160, 30, -14)
        else sway(animate, piece, at, index % 2 === 0 ? -5 : 5)
      })
  },
}

// --- Comm --------------------------------------------------------------------------------------

/** The quotation marks: four paths each. */
const isQuote = ({ shapes }: Piece) =>
  shapes.length === 4 && shapes.every((shape) => shape instanceof SVGPathElement)
/** The notifications: a card (rects) with its icon and text. */
const isNote = (piece: Piece) => has(piece, "rect")

/**
 * A conversation, one line after the other: the opening quote pops, a head rises and nods, the
 * notification it sends slides out and pings, the other head answers, the closing quote ends it.
 */
const comm: Choreography = {
  intro({ pieces, animate }) {
    pieces.forEach((piece, index) => {
      const at = 60 + index * 230
      if (isQuote(piece)) {
        unfold(animate, piece, at, { scale: 0.3, turn: -15, duration: 800, easing: BACK })
      } else if (isNote(piece)) toast(animate, piece, at, CALM)
      else nod(animate, piece, at, index % 2 === 0 ? -6 : 6, CALM)
    })
  },
  open({ pieces, animate }) {
    pieces.forEach((piece, index) => {
      const at = delayOf(piece)
      if (has(piece, "ellipse")) unfold(animate, piece, at, { scale: 0.5, duration: 1400 })
      else if (isQuote(piece)) sway(animate, piece, at, index % 2 === 0 ? -24 : 24)
      else if (!isNote(piece)) sway(animate, piece, at, index % 2 === 0 ? -10 : 10, "50% 100%")
      else if (isIn(piece)) toast(animate, piece, at + 260)
      else sway(animate, piece, at, -5, "0 50%")
    })
  },
}

// --- Multi -------------------------------------------------------------------------------------

/** The playheads: drawn with `use`. */
const isPlayhead = ({ layer }: Piece) => layer.querySelector("use") !== null

/**
 * A timeline being edited: the clips snap onto their tracks, the waveforms' bars rise as their
 * clips land, and the playheads drop in and scrub to their frame.
 */
function edit(
  { pieces, animate }: Scene,
  delayFor: (piece: Piece) => number,
  distance: number,
  amount = 1,
) {
  pieces.forEach((piece, index) => {
    const at = delayFor(piece)
    if (isPlayhead(piece)) scrub(animate, piece, at + 300, distance)
    else {
      snap(animate, piece, at, index % 2 === 0 ? 1 : -1, amount)
      if (piece.shapes.some(isBar)) levels(animate, piece, at + 250)
    }
  })
}

const multi: Choreography = {
  intro: (scene) => edit(scene, (piece) => 60 + scene.along(piece.layer) * 1000, 45, CALM),
  open: (scene) => edit(scene, (piece) => delayOf(piece) + 80 + artHeight(piece.layer) * 300, 160),
  close: (scene) => edit(scene, (piece) => delayOf(piece) + 80 + artHeight(piece.layer) * 300, 70),
}

// --- Relex -------------------------------------------------------------------------------------

/** The network's dashed lines. */
const isLine = ({ shapes }: Piece) =>
  shapes.length > 0 &&
  shapes.every(
    (shape) =>
      shape instanceof SVGPathElement &&
      (shape.getAttribute("fill") ?? shape.getAttribute("stroke")) === "#878BDB",
  )
const isNode = (piece: Piece) => has(piece, "rect")

/** The nodes tick round as they travel, the lines relink, the handshake shakes on it. */
function partners(scene: Scene, axis: "x" | "y") {
  const { pieces, animate } = scene
  relink(scene, axis, isLine)
  pieces.forEach((piece, index) => {
    const at = delayOf(piece)
    if (isNode(piece)) {
      if (isIn(piece)) {
        unfold(animate, piece, at + 200, { scale: 0.2, turn: 90, duration: 900, easing: BACK })
      } else sway(animate, piece, at, index % 2 === 0 ? -90 : 90)
    } else if (!isLine(piece)) shake(animate, piece, at + 250, "50% 100%")
  })
}

/**
 * Partners meeting: the nodes spin into place one by one, the lines grow between them in order
 * down the strip, and the two hands meet last and shake.
 */
const relex: Choreography = {
  intro({ pieces, animate, vertical }) {
    const axis = vertical ? "y" : "x"
    const next = 190
    pieces.filter(isNode).forEach((piece, index) => {
      unfold(animate, piece, 40 + index * 200, {
        scale: 0.5,
        turn: index % 2 === 0 ? -45 : 45,
        duration: 900,
        easing: BACK,
      })
    })
    const links = inOrder(linksOf(pieces.filter(isLine)), axis)
    links.forEach((link, index) => growLink(animate, link, axis, 280 + index * next, GROW))
    pieces
      .filter((piece) => !isNode(piece) && !isLine(piece))
      .forEach((piece) => shake(animate, piece, 360 + links.length * next, "center", CALM))
  },
  open: (scene) => partners(scene, "x"),
  close: (scene) => partners(scene, closedAxis()),
}

// --- IRHR --------------------------------------------------------------------------------------

/** The CVs: a card with a white photo frame. */
const isProfile = ({ layer }: Piece) =>
  [...layer.querySelectorAll("rect")].some((rect) => rect.getAttribute("fill") === "white")

/**
 * Screening candidates: the folders land on the pile one by one, then the CVs are dealt off it
 * around the table; opening, the magnifier swings in and sweeps over them.
 */
const irhr: Choreography = {
  intro({ pieces, animate, center }) {
    pieces
      .filter((piece) => !isProfile(piece))
      .forEach((piece, index) => {
        unfold(animate, piece, 40 + index * 160, {
          scale: 1.12,
          turn: index % 2 === 0 ? -4 : 4,
          duration: 800,
          easing: QUART,
        })
      })
    pieces.filter(isProfile).forEach((piece, index) => {
      const from = toLocal(piece.group, center)
      deal(animate, piece, 520 + index * 170, from, index % 2 === 0 ? -9 : 9, CALM)
    })
  },
  open({ pieces, animate }) {
    const middle = { x: 305, y: ART_HEIGHT / 2 }
    let dealt = 0
    pieces.forEach((piece, index) => {
      const at = delayOf(piece)
      if (has(piece, "ellipse")) {
        // The glow and the magnifier, in one layer.
        for (const item of itemsOf(piece)) {
          if (item.querySelector("ellipse")) {
            unfold(animate, { group: item }, at, { scale: 0.5, duration: 1400 })
          } else search(animate, { group: item }, at + 380)
        }
      } else if (!isIn(piece)) sway(animate, piece, at, index % 2 === 0 ? -5 : 5)
      else if (isProfile(piece)) {
        deal(animate, piece, at + 220 + dealt * 90, middle, dealt % 2 === 0 ? -14 : 14)
        dealt++
      } else {
        unfold(animate, piece, at + 140, {
          scale: 1.2,
          turn: index % 2 === 0 ? -6 : 6,
          duration: 800,
          easing: QUART,
        })
      }
    })
  },
}

// --- Ops ---------------------------------------------------------------------------------------

/** The shades of the boxes' sides. */
const BOX_SHADES = ["#A6B1FC", "#92A0F8", "#D8DDFE"]
const isBox = ({ shapes }: Piece) =>
  shapes.some(
    (shape) =>
      shape instanceof SVGPathElement && BOX_SHADES.includes(shape.getAttribute("fill") ?? ""),
  )
/** A speed line: one thin rect. */
const isSpeedLine = (item: SVGGElement) => {
  const rects = item.querySelectorAll("rect")
  return (
    rects.length === 1 && !item.querySelector("path") && Number(rects[0].getAttribute("height")) < 5
  )
}
const rectsOf = ({ shapes }: Piece) => shapes.filter((shape) => shape instanceof SVGRectElement)
/** The calendar's page: its grid of days. */
const isCalendar = (piece: Piece) => rectsOf(piece).length >= 9
/** The calendar's binding and ring: a single rect each. */
const isCalendarPart = (piece: Piece) =>
  piece.shapes.length === 1 &&
  piece.shapes[0] instanceof SVGRectElement &&
  !itemsOf(piece).every(isSpeedLine)
const isChecklist = (piece: Piece) =>
  !isCalendar(piece) && rectsOf(piece).some((rect) => Number(rect.getAttribute("width")) > 100)

/**
 * The boxes of a layer, each as the groups it is drawn with (its sides, its tape: consecutive,
 * overlapping), left to right; a layer holding one box moves whole, its speed lines with it.
 */
function boxesOf(piece: Piece) {
  const boxes: { items: SVGGElement[]; box: DOMRect }[] = []
  for (const item of itemsOf(piece).filter((item) => !isSpeedLine(item))) {
    const box = DOMRect.fromRect(item.getBBox())
    const last = boxes.at(-1)
    if (last && overlaps(last.box, box)) {
      last.items.push(item)
      last.box = union(last.box, box)
    } else boxes.push({ items: [item], box })
  }
  if (boxes.length < 2) return [[piece.group]]
  return boxes.sort((a, b) => a.box.x - b.box.x).map(({ items }) => items)
}

/**
 * The speed lines shoot out of the side of their nearest box. Measured before anything moves
 * (on screen: the strips can be turned and mirrored).
 */
function streak(scene: Scene, delayFor: (piece: Piece) => number, from: number) {
  const { pieces, animate } = scene
  const boxes = pieces.filter(isBox).map(({ group }) => {
    const box = group.getBBox()
    return toScreen(group, centerOf(box))
  })
  const lines = pieces.flatMap((piece) =>
    itemsOf(piece)
      .filter(isSpeedLine)
      .map((item) => {
        const own = centerOf(item.getBBox())
        const at = toScreen(item, own)
        const box = boxes.reduce<Point | undefined>(
          (best, box) =>
            !best ||
            Math.hypot(box.x - at.x, box.y - at.y) < Math.hypot(best.x - at.x, best.y - at.y)
              ? box
              : best,
          undefined,
        )
        const toward = box ? toLocal(item, box).x > own.x : true
        return { item, origin: toward ? "right" : "left", delay: delayFor(piece) }
      }),
  )
  for (const { item, origin, delay } of lines)
    stretch(animate, { group: item }, delay, origin, from)
}

/** Ticks the checklist's boxes, one after the other. */
function tick(animate: Animate, piece: Piece, delay: number) {
  piece.shapes
    .filter((shape) => shape instanceof SVGPathElement)
    .forEach((check, index) => {
      const group = check.parentElement
      if (!(group instanceof SVGGElement)) return
      pivot(group)
      animate(
        group,
        [
          { transform: "scale(0)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { delay: delay + index * 160, duration: 600, easing: BACK },
      )
    })
}

/** The calendar swings from the top of its page like a hung one, its binding and ring on it. */
function hang(scene: Scene, rig: Rig, delay: number, entering: boolean) {
  const { x, y, width } = rig.block
  const swing = entering ? 12 : 10
  moveRig(scene, rig, { x: x + width / 2, y }, delay, 1400, (t) => {
    const size = entering ? 0.7 + 0.3 * easeExpo(t) : 1
    return {
      scale: size,
      turn: swing * (1 - t) ** 2 * Math.cos(3 * Math.PI * t),
      opacity: entering ? Math.min(1, t / 0.15) : 1,
      handle: size,
    }
  })
}

/**
 * Logistics: the boxes drop onto the line with a squash, their speed lines shooting out behind
 * them; the pin drops on the map, the calendar swings in, the checklist ticks itself off.
 * Opening, the boxes hop along as they travel and the new ones land one by one down the line.
 */
const ops: Choreography = {
  intro(scene) {
    const { pieces, along, animate } = scene
    const at = (piece: Piece) => 60 + along(piece.layer) * 1000
    streak(scene, (piece) => at(piece) + 380, 0)
    for (const piece of pieces) {
      if (isBox(piece)) {
        for (const items of boxesOf(piece)) bounce(animate, items, at(piece), 36, true, CALM)
      } else if (isChecklist(piece)) {
        unfold(animate, piece, at(piece), { origin: "0 50%", scale: 0.6, duration: 900 })
        tick(animate, piece, at(piece) + 450)
      } else if (
        !isCalendar(piece) &&
        !isCalendarPart(piece) &&
        !itemsOf(piece).every(isSpeedLine)
      ) {
        drop(animate, piece, at(piece), 50, 0)
      }
    }
    for (const rig of rigs(pieces.filter(isCalendar), pieces.filter(isCalendarPart), scene.place)) {
      hang(scene, rig, at(rig.frame), true)
    }
  },
  open(scene) {
    const { pieces, animate } = scene
    streak(scene, (piece) => delayOf(piece) + 450, 0.2)
    for (const piece of pieces) {
      const at = delayOf(piece)
      if (has(piece, "ellipse")) unfold(animate, piece, at, { scale: 0.5, duration: 1400 })
      else if (isBox(piece)) {
        boxesOf(piece).forEach((items, index) => {
          if (isIn(piece)) bounce(animate, items, at + 220 + index * 110, 50, true)
          else bounce(animate, items, at, 40, false)
        })
      } else if (isChecklist(piece)) {
        sway(animate, piece, at, -6, "0 50%")
        tick(animate, piece, at + 400)
      }
    }
    for (const rig of rigs(pieces.filter(isCalendar), pieces.filter(isCalendarPart), scene.place)) {
      hang(scene, rig, delayOf(rig.frame), false)
    }
  },
}

const CHOREOGRAPHIES: Record<DepartmentId, Choreography> = {
  design,
  marketing,
  dev,
  comm,
  multi,
  relex,
  irhr,
  ops,
}

// --- Running -----------------------------------------------------------------------------------

/**
 * Gives each layer its cascade delay (`--d`, read by the panels' transitions): opening or
 * closing, the shapes leave one after the other from the top of the art down.
 */
export function cascadeLayers(root: HTMLElement, id: DepartmentId) {
  const cascade = CASCADE[id] ?? DEFAULT_CASCADE
  for (const layer of root.querySelectorAll<SVGSVGElement>("svg[data-el]")) {
    layer.style.setProperty("--d", `${Math.round(artHeight(layer) * cascade)}ms`)
  }
}

/** Collects paused animations drawing their first frame, to play together. */
function timeline() {
  const animations: Animation[] = []
  const timers: number[] = []
  const waits: Promise<void>[] = []
  const settle: (() => void)[] = []
  const end = () => {
    for (const timer of timers) window.clearTimeout(timer)
    for (const resolve of settle) resolve()
    for (const animation of animations) animation.cancel()
    // The motion stays referenced by its strip: let go of the animations and their elements.
    animations.length = timers.length = settle.length = waits.length = 0
  }
  const animate: Animate = (element, keyframes, options) => {
    const animation = element.animate(keyframes, { fill: "both", ...options })
    animation.pause()
    animations.push(animation)
  }
  const later = (delay: number, build: () => void) => {
    waits.push(
      new Promise((resolve) => {
        settle.push(resolve)
        timers.push(
          window.setTimeout(() => {
            const from = animations.length
            build()
            for (const animation of animations.slice(from)) animation.play()
            resolve()
          }, delay),
        )
      }),
    )
  }
  const motion: ArtMotion = {
    async play() {
      for (const animation of animations) animation.play()
      await Promise.all(waits)
      await Promise.all(animations.map((animation) => animation.finished)).catch(() => {})
      // Every animation ends on the art as drawn: dropping them changes nothing on screen.
      end()
    },
    cancel: end,
  }
  return { animate, later, motion }
}

const piecesOf = (root: HTMLElement, selector: string): Piece[] =>
  [...root.querySelectorAll<SVGSVGElement>(selector)].map((layer) => ({
    layer,
    group: groupOf(layer),
    shapes: shapesOf(layer),
  }))

/** The layers matching `selector` as pieces, measured before any of them moves. */
function sceneOf(
  root: HTMLElement,
  selector: string,
  closed: boolean,
  { animate, later, leaving = [] }: Pick<Scene, "animate" | "later"> & { leaving?: Piece[] },
): Scene {
  const frame = (root.closest("[data-panel]") ?? root).getBoundingClientRect()
  const vertical = frame.height >= frame.width
  const along = Object.assign(
    (element: Element) => {
      const { top, left, width, height } = element.getBoundingClientRect()
      const position = vertical
        ? (top + height / 2 - frame.top) / frame.height
        : (left + width / 2 - frame.left) / frame.width
      return Math.min(1, Math.max(0, position))
    },
    {
      span: (element: Element) => {
        const { width, height } = element.getBoundingClientRect()
        return vertical ? height / frame.height : width / frame.width
      },
    },
  )
  // Closed, each layer is moved and uniformly scaled to its strip place: its box on screen
  // against its viewBox (cropped by `fitLayers`) gives where its art units land.
  const place: Scene["place"] = (layer, { x, y }) => {
    if (!closed) return { x, y, scale: 1 }
    const [left, top, width] = (layer.getAttribute("viewBox") ?? "0 0 1 1").split(" ").map(Number)
    const box = layer.getBoundingClientRect()
    const scale = box.width / width
    return { x: box.left + (x - left) * scale, y: box.top + (y - top) * scale, scale }
  }
  return {
    pieces: piecesOf(root, selector),
    along,
    place,
    vertical,
    center: { x: frame.left + frame.width / 2, y: frame.top + frame.height / 2 },
    leaving,
    animate,
    later,
  }
}

/**
 * Sets up a strip's intro on its freshly loaded layers (after `fitLayers`: the intro's start
 * state would skew their sizes), drawing its first frame: the strip stays empty until it plays.
 */
export function prepareArtIntro(root: HTMLElement, id: DepartmentId): ArtMotion {
  const { animate, later, motion } = timeline()
  const scene = sceneOf(root, "svg[data-el=move], svg[data-el=out]", true, { animate, later })
  const order = new Map(scene.pieces.map((piece) => [piece, scene.along(piece.layer)]))
  scene.pieces.sort((a, b) => order.get(a)! - order.get(b)!)
  CHOREOGRAPHIES[id].intro(scene)
  return motion
}

/**
 * Plays on the shapes of a panel that starts opening or closing, along with their travel to the
 * card or back to the strip. Vector layers only: the bitmaps of touch devices (see
 * `rasterizeLayers`) just travel.
 */
export function playArtToggle(
  root: HTMLElement,
  id: DepartmentId,
  open: boolean,
): ArtMotion | undefined {
  const choreography = CHOREOGRAPHIES[id]
  const play = open ? choreography.open : choreography.close
  if (!play) return
  const { animate, later, motion } = timeline()
  const [staying, leaving] = open ? ["in", "out"] : ["out", "in"]
  const scene = sceneOf(root, `svg[data-el=move], svg[data-el=${staying}]`, false, {
    animate,
    later,
    leaving: piecesOf(root, `svg[data-el=${leaving}]`),
  })
  const order = new Map(scene.pieces.map((piece) => [piece, artHeight(piece.layer)]))
  scene.pieces.sort((a, b) => order.get(a)! - order.get(b)!)
  play(scene)
  motion.play()
  return motion
}

// --- Hover -------------------------------------------------------------------------------------

/** Where a piece rests while its strip is hovered: its layer's units, about its middle. */
type Nudge = { x?: number; y?: number; turn?: number; scale?: number }

/** A move of `distance` px on screen, away from the middle of the strip. */
function away({ center }: Scene, { layer }: Piece, distance: number): Point {
  const box = layer.getBoundingClientRect()
  const [dx, dy] = [box.left + box.width / 2 - center.x, box.top + box.height / 2 - center.y]
  const length = Math.hypot(dx, dy) || 1
  return { x: (dx / length) * distance, y: (dy / length) * distance }
}

/** A move on screen in a piece's layer's units (strips are scaled, turned, mirrored). */
function shift({ layer }: Piece, { x, y }: Point): Nudge {
  const box = layer.getBoundingClientRect()
  const from = toLocal(layer, { x: box.left, y: box.top })
  const to = toLocal(layer, { x: box.left + x, y: box.top + y })
  return { x: to.x - from.x, y: to.y - from.y }
}

const lift = (piece: Piece, distance: number) => shift(piece, { x: 0, y: -distance })
const side = (index: number, amount: number) => (index % 2 === 0 ? -amount : amount)

/**
 * Each department's hover: its pieces drift a few px, the way they would move. Pieces held
 * together (Design's handles, Ops' calendar) get the very same move; links never move.
 */
const HOVERS: Record<DepartmentId, (scene: Scene) => Map<Piece, Nudge>> = {
  design(scene) {
    const { pieces } = scene
    const nudges = new Map<Piece, Nudge>()
    const rigged = rigs(pieces.filter(isFrame), pieces.filter(isHandle), scene.place)
    for (const { frame, handles } of rigged) {
      const move = away(scene, frame, 3)
      for (const piece of [frame, ...handles]) nudges.set(piece, shift(piece, move))
    }
    for (const piece of pieces) {
      if (!nudges.has(piece)) nudges.set(piece, shift(piece, away(scene, piece, 2)))
    }
    return nudges
  },
  marketing: (scene) =>
    new Map(
      scene.pieces
        .filter((piece) => !isLink(piece))
        .map((piece, index) => [
          piece,
          { ...shift(piece, away(scene, piece, 3)), turn: side(index, 1.5) },
        ]),
    ),
  dev: ({ pieces }) =>
    new Map(
      pieces.map((piece, index) => [
        piece,
        isTag(piece) ? { ...lift(piece, 3), turn: side(index, 2) } : { x: side(index, 3) },
      ]),
    ),
  comm: (scene) =>
    new Map(
      scene.pieces.map((piece, index) => {
        if (isQuote(piece)) {
          return [piece, { ...shift(piece, away(scene, piece, 4)), turn: side(index, 6) }]
        }
        return [piece, isNote(piece) ? lift(piece, 3) : { turn: side(index, 4) }]
      }),
    ),
  multi: ({ pieces }) =>
    new Map(pieces.map((piece, index) => [piece, { x: isPlayhead(piece) ? 6 : side(index, 3) }])),
  relex: ({ pieces }) =>
    new Map(
      pieces
        .filter((piece) => !isLine(piece))
        .map((piece, index) => [
          piece,
          isNode(piece) ? { turn: side(index, 8), scale: 1.06 } : lift(piece, 3),
        ]),
    ),
  irhr: (scene) =>
    new Map(
      scene.pieces.map((piece, index) => [
        piece,
        { ...shift(piece, away(scene, piece, 4)), turn: side(index, 2) },
      ]),
    ),
  ops: (scene) => {
    const { pieces } = scene
    const nudges = new Map<Piece, Nudge>()
    for (const { frame, handles } of rigs(
      pieces.filter(isCalendar),
      pieces.filter(isCalendarPart),
      scene.place,
    )) {
      for (const piece of [frame, ...handles]) nudges.set(piece, lift(piece, 2))
    }
    for (const piece of pieces) {
      if (nudges.has(piece) || isCalendarPart(piece)) continue
      if (isChecklist(piece)) nudges.set(piece, { ...lift(piece, 2), turn: -2 })
      else if (isBox(piece) || itemsOf(piece).every(isSpeedLine)) nudges.set(piece, lift(piece, 4))
      else nudges.set(piece, lift(piece, 6))
    }
    return nudges
  },
}

/** How far the hover moves go: the nudges above, scaled. */
const HOVER_REACH = 3.5

const hovers = new WeakMap<SVGGElement, Animation>()

/** A strip's hover groups, and the transforms of the nudged ones, for the panel size measured. */
type HoverPlan = { size: string; groups: SVGGElement[]; rests: Map<SVGGElement, string> }

const hoverPlans = new WeakMap<HTMLElement, HoverPlan>()

/**
 * Measures the nudges once per panel size: they are in the layers' units, so they only change
 * when the strip is laid out again (a resize, another breakpoint), not as the page scrolls.
 */
function hoverPlan(root: HTMLElement, id: DepartmentId): HoverPlan {
  const { width, height } = (root.closest("[data-panel]") ?? root).getBoundingClientRect()
  const size = `${width}x${height}`
  const cached = hoverPlans.get(root)
  if (cached?.size === size) return cached
  const scene = sceneOf(root, "svg[data-el=move], svg[data-el=out]", true, {
    animate: () => {},
    later: () => {},
  })
  const order = new Map(scene.pieces.map((piece) => [piece, scene.along(piece.layer)]))
  scene.pieces.sort((a, b) => order.get(a)! - order.get(b)!)
  const k = HOVER_REACH
  const rests = new Map<SVGGElement, string>()
  for (const [piece, { x = 0, y = 0, turn = 0, scale = 1 }] of HOVERS[id](scene)) {
    const group = piece.group.parentElement
    if (!(group instanceof SVGGElement)) continue
    pivot(group)
    rests.set(
      group,
      `translate(${x * k}px,${y * k}px) rotate(${turn * k}deg) scale(${1 + (scale - 1) * k})`,
    )
  }
  const groups = [
    ...root.querySelectorAll<SVGGElement>('svg[data-el] > g[data-motion="hover"]'),
  ].filter((group) => rests.has(group))
  const plan = { size, groups, rests }
  hoverPlans.set(root, plan)
  return plan
}

/**
 * Nudges a closed strip's pieces as the pointer comes onto it (`hovered`), and settles them back
 * as it leaves. Each move starts where the last one left the piece, so quick passes stay smooth.
 */
export function hoverArt(root: HTMLElement, id: DepartmentId, hovered: boolean) {
  const plan = hovered ? hoverPlan(root, id) : hoverPlans.get(root)
  if (!plan) return
  plan.groups.forEach((group, index) => {
    const running = hovers.get(group)
    if (!hovered && !running) return
    // Only a moving or resting piece needs its current transform read back (a style flush).
    const from = running ? getComputedStyle(group).transform : "none"
    const to = hovered ? plan.rests.get(group)! : "none"
    running?.cancel()
    hovers.delete(group)
    if (from === "none" && to === "none") return
    const animation = group.animate([{ transform: from }, { transform: to }], {
      delay: hovered ? (index % 6) * 15 : 0,
      duration: hovered ? 420 : 380,
      easing: hovered ? BACK : QUART,
      fill: "both",
    })
    hovers.set(group, animation)
    if (!hovered) {
      animation.finished
        .then(() => {
          animation.cancel()
          hovers.delete(group)
        })
        .catch(() => {})
    }
  })
}
