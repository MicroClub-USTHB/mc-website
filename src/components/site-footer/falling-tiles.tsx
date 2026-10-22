"use client"

import { useEffect, useRef, useState } from "react"
import { useLenis } from "lenis/react"
import { cancelFrame, frame, useInView, useReducedMotion } from "motion/react"

import {
  addTile,
  createWorld,
  endDrag,
  isAsleep,
  moveDrag,
  pose,
  startDrag,
  step,
  tileAt,
  type Tile,
} from "@/lib/box-physics"
import { cn } from "@/lib/utils"

/** Physics step (ms): fixed 60 Hz, whatever the display rate. */
const STEP = 1000 / 60
/** Steps simulated at once to rest the pile without animation (reduced motion, resize). */
const SETTLE_STEPS = 600
/** Pointer travel (px) past which a press on a tile is a drag, not a click. */
const DRAG_THRESHOLD = 4
/** Steps between the release of one row of tiles and the next, bottom row first. */
const ROW_STAGGER = 5
/** Speed (px/s) the page must hit its bottom with to knock the tiles down. */
const IMPACT_SPEED = 50

/**
 * Falling tags (Figma dev notes, like the Framer "Falling Tags" component): the `[data-tile]`
 * links inside hang in their layout until the page hits its bottom fast enough (`IMPACT_SPEED`;
 * the scroll keeps its speed into the bottom, see `SmoothScrollProvider`), then fall with physics
 * (Matter.js), row by row from the bottom, and pile up at the bottom of the box. A slow arrival
 * leaves them hanging. With a mouse, tiles can be dragged and thrown; a press without moving
 * stays a click on the link. The physics is our own (`src/lib/box-physics.ts`), run on Motion's frame
 * loop: tiles can never leave the box, however hard they are thrown or dragged.
 *
 * Tiles keep their place in the layout and are moved with `transform` only (the box does not
 * reflow). With reduced motion, the pile is
 * simulated at once and shown at rest. On resize, the pile is rebuilt at rest for the new box.
 */
export function FallingTiles({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const box = useRef<HTMLDivElement>(null)
  const near = useInView(box, { once: true, margin: "0px 0px 50% 0px" })
  const reduceMotion = useReducedMotion()
  const [knocked, setKnocked] = useState(false)
  // Scroll position, time and speed (px/s) at the previous scroll event.
  const lastScroll = useRef({ scroll: 0, time: 0, speed: 0 })

  // Impact: the scroll speed when it reaches the bottom of the page. The arrival frame only covers
  // what was left of the way, so the frame before it counts too.
  useLenis(
    ({ scroll, limit }) => {
      // Tracked from half a screen before the footer (`near`), well before the page can hit its
      // bottom, so the rest of the page scrolls without this work.
      if (knocked || !near) return
      const time = performance.now()
      const previous = lastScroll.current
      const speed = ((scroll - previous.scroll) / (time - previous.time)) * 1000
      lastScroll.current = { scroll, time, speed }
      // (No previous event yet: the page may load already at the bottom, which is not an impact.)
      const arrived = previous.time > 0 && scroll >= limit - 1 && previous.scroll < limit - 1
      if (arrived && Math.max(speed, previous.speed) >= IMPACT_SPEED) setKnocked(true)
    },
    [knocked, near],
  )

  useEffect(() => {
    const element = box.current
    // Reduced motion: the pile is built at rest once the footer is near, not on page load.
    if (!element || !(knocked || (reduceMotion && near))) return
    return startPile(element, { animate: !reduceMotion })
  }, [knocked, reduceMotion, near])

  return (
    <div
      ref={box}
      // Mouse drag cursors, set by `startPile`: open hand on tiles, closed hand while dragging.
      className={cn(
        "relative data-dragging:[&_[data-tile]]:cursor-grabbing! data-pile:[&_[data-tile]]:cursor-grab data-dragging:[&_[data-tile]_*]:cursor-grabbing! data-pile:[&_[data-tile]_*]:cursor-grab",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Runs the pile in `box` and returns its cleanup, which puts the tiles back in their layout. */
function startPile(box: HTMLElement, { animate }: { animate: boolean }) {
  const elements = Array.from(box.querySelectorAll<HTMLElement>("[data-tile]"))
  let world = createWorld(0, 0)
  let tiles: Tile[] = []
  // Tile centers in the layout (box coordinates): the `transform` is the offset from them.
  let origins: { x: number; y: number }[] = []
  // Step at which each tile is released, and steps run since `build`.
  let releaseAt: number[] = []
  let steps = 0

  /** One tile per link, hanging at its place in the layout. */
  function build() {
    world = createWorld(box.clientWidth, box.clientHeight)
    // `offset*` ignore transforms: the layout place, wherever the tile is drawn now.
    origins = elements.map((element) => ({
      x: element.offsetLeft + element.offsetWidth / 2,
      y: element.offsetTop + element.offsetHeight / 2,
    }))
    tiles = elements.map((element, i) =>
      addTile(world, origins[i], element.offsetWidth, element.offsetHeight),
    )
    // Rows by their place in the layout, bottom first: the order they are released in.
    const rows = [...new Set(origins.map((origin) => Math.round(origin.y)))].sort((a, b) => b - a)
    releaseAt = origins.map((origin) => rows.indexOf(Math.round(origin.y)) * ROW_STAGGER)
    steps = 0
  }

  /** One physics step, releasing the rows that are due. */
  function advance() {
    tiles.forEach((tile, i) => {
      if (tile.pinned && steps >= releaseAt[i]) tile.pinned = false
    })
    step(world)
    steps++
  }

  function render() {
    tiles.forEach((tile, i) => {
      const { x, y, angle } = pose(tile)
      elements[i].style.transform =
        `translate(${x - origins[i].x}px, ${y - origins[i].y}px) rotate(${angle}rad)`
    })
  }

  function settle() {
    for (let i = 0; i < SETTLE_STEPS; i++) advance()
    render()
  }

  // Mouse drag in progress (see `onPointerDown`).
  let drag: { start: { x: number; y: number }; moved: boolean } | null = null
  let suppressClick = false

  build()
  if (!animate) settle()

  let skipFirstResize = true
  const resizeObserver = new ResizeObserver(() => {
    if (skipFirstResize) {
      skipFirstResize = false
      return
    }
    drop()
    build()
    settle()
  })
  resizeObserver.observe(box)

  if (!animate) {
    return () => {
      resizeObserver.disconnect()
      reset()
    }
  }

  // Drag and throw, mouse only: on touch, a swipe over the tiles keeps scrolling the page.
  box.dataset.pile = ""
  function toBox(event: PointerEvent) {
    const rect = box.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== "mouse" || event.button !== 0) return
    if (!elements.some((element) => element.contains(event.target as Node))) return
    const point = toBox(event)
    // The tile under the pointer as simulated (the topmost one where tiles overlap).
    const index = tileAt(world, point)
    if (index === -1) return
    event.preventDefault() // No text selection or native link drag.
    startDrag(world, tiles[index], point)
    drag = { start: point, moved: false }
    box.dataset.dragging = ""
    // Captured by the tile, so the click (if any) still lands on its link.
    elements[index].setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag) return
    const point = toBox(event)
    moveDrag(world, point)
    if (Math.hypot(point.x - drag.start.x, point.y - drag.start.y) > DRAG_THRESHOLD) {
      drag.moved = true
    }
  }

  function drop() {
    if (!drag) return
    endDrag(world)
    suppressClick = drag.moved
    drag = null
    delete box.dataset.dragging
  }

  function onClick(event: MouseEvent) {
    if (suppressClick) event.preventDefault()
    suppressClick = false
  }

  box.addEventListener("pointerdown", onPointerDown)
  box.addEventListener("pointermove", onPointerMove)
  box.addEventListener("pointerup", drop)
  box.addEventListener("pointercancel", drop)
  // Capture lost (window blur, tab switch...): no pointerup will come.
  box.addEventListener("lostpointercapture", drop)
  box.addEventListener("click", onClick, true)

  let pending = 0
  function tick({ delta }: { delta: number }) {
    // Idle once the pile is at rest, until a tile is grabbed again.
    // (Not while rows are still waiting to be released.)
    if (isAsleep(world) && tiles.every((tile) => !tile.pinned)) return
    pending = Math.min(pending + delta, STEP * 4)
    while (pending >= STEP) {
      advance()
      pending -= STEP
    }
    render()
  }
  frame.update(tick, true)

  function reset() {
    for (const element of elements) element.style.transform = ""
  }

  return () => {
    cancelFrame(tick)
    resizeObserver.disconnect()
    box.removeEventListener("pointerdown", onPointerDown)
    box.removeEventListener("pointermove", onPointerMove)
    box.removeEventListener("pointerup", drop)
    box.removeEventListener("pointercancel", drop)
    box.removeEventListener("lostpointercapture", drop)
    box.removeEventListener("click", onClick, true)
    delete box.dataset.pile
    delete box.dataset.dragging
    reset()
  }
}
