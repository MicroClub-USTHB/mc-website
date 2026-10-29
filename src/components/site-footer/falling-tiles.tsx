"use client"

import { useEffect, useRef, useState } from "react"
import { useLenis } from "lenis/react"
import { cancelFrame, frame, useInView, useReducedMotion } from "motion/react"

import {
  addTile,
  createWorld,
  endDrag,
  isAsleep,
  kick,
  moveDrag,
  pose,
  startDrag,
  step,
  tileAt,
  wake,
  type Tile,
} from "@/lib/box-physics"
import { cn } from "@/lib/utils"

/** Physics step (ms): fixed 60 Hz, whatever the display rate. */
const STEP = 1000 / 60
/** Steps simulated at once to rest the pile after a grab and a resize. */
const SETTLE_STEPS = 600
/** Pointer travel (px) past which a press on a tile is a drag, not a click. */
const DRAG_THRESHOLD = 4
/** Steps between the release of one tile and the next, in the order the pile is built. */
const RELEASE_STEPS = 7
/** Push (px/step) and spin (px/step of the top corners) a tile gets when it is released, at most. */
const KICK_PUSH = 1
const KICK_SPIN = 1.5
/** Steps after which a fall that has not come to rest is finished anyway. */
const MAX_FALL_STEPS = 60 * 6
/** Duration (ms) of the last easing of the tiles onto their exact place in the pile. */
const SETTLE_MS = 260
/** Speed (px/s) the page must hit its bottom with to knock the tiles down. */
const IMPACT_SPEED = 50

/**
 * Falling tags (Figma dev notes, like the Framer "Falling Tags" component): the `[data-tile]`
 * links inside hang in their layout (tidy rows) until the page hits its bottom fast enough
 * (`IMPACT_SPEED`; the scroll keeps its speed into the bottom, see `SmoothScrollProvider`). Then
 * they are released one after the other, the lowest places of the pile first, and really fall
 * (our own physics, `src/lib/box-physics.ts`, run on Motion's frame loop): they tumble, bump into
 * each other and tilt. Each tile is also eased toward its place in the Figma pile
 * (`data-rest-x` / `data-rest-y`, in Figma px from the pile's top left; the pile is
 * `data-pile-height` tall and rests at the bottom of the box), so the pile ends as designed; a
 * last short easing closes what is left. A slow arrival leaves them hanging.
 * Once piled, the tiles can be dragged and thrown with a mouse (free of the guide); the first grab
 * wakes the physics. A press without moving stays a click on the link.
 *
 * Tiles keep their place in the layout and are moved with `transform` only (the box does not
 * reflow). With reduced motion, the pile is shown at once. On resize, it is rebuilt for the new box.
 */
export function FallingTiles({
  className,
  pileHeight,
  children,
}: {
  className?: string
  /** Height of the pile the tiles fall into, in the units of their `data-rest-y`. */
  pileHeight: number
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

  // Set up once the footer is near, not on page load; knocked, it starts with the fall.
  useEffect(() => {
    const element = box.current
    if (!element || !near) return
    const started = startPile(element, { animate: !reduceMotion })
    if (knocked) started.fall()
    return started.cleanup
  }, [near, reduceMotion, knocked])

  return (
    <div
      ref={box}
      data-pile-height={pileHeight}
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

type Point = { x: number; y: number }

/** Deterministic noise in [0, 1) for a tile index and a channel, so each fall plays out the same. */
function noise(index: number, channel: number) {
  const x = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * Runs the pile in `box`. `cleanup` puts the tiles back in their layout; `fall` releases them.
 */
function startPile(box: HTMLElement, { animate }: { animate: boolean }) {
  const elements = Array.from(box.querySelectorAll<HTMLElement>("[data-tile]"))
  let world = createWorld(0, 0)
  let tiles: Tile[] = []
  // Tile centers in the layout (box coordinates): the `transform` is the offset from them.
  let origins: Point[] = []
  // Tile centers in the pile, and the order the tiles are released in.
  let rests: Point[] = []
  let order: number[] = []
  // `hung` in the layout, `falling` (physics), `settling` onto the exact pile, then `piled`: at
  // rest and pinned, until the first grab (`live`) turns the physics on for good.
  let phase: "hung" | "falling" | "settling" | "piled" = "hung"
  let live = false
  let steps = 0
  let settled = 0
  let landing: { x: number; y: number; angle: number }[] = []

  /** Where the tiles are in the layout and in the pile, and the physics world holding them. */
  function build() {
    // One Figma px, in px: the footer sets `--u` as a length that depends on its width.
    const probe = document.createElement("div")
    probe.style.cssText = "position:absolute;visibility:hidden;width:calc(10000 * var(--u))"
    box.append(probe)
    const unit = probe.getBoundingClientRect().width / 10000
    probe.remove()
    const left = parseFloat(getComputedStyle(box).paddingLeft)

    // Sizes and places in the layout, to the sub-pixel: measured without the tiles' transforms.
    reset()
    const boxRect = box.getBoundingClientRect()
    const pileTop = boxRect.height - Number(box.dataset.pileHeight) * unit
    const rects = elements.map((element) => element.getBoundingClientRect())
    origins = rects.map((rect) => ({
      x: rect.left - boxRect.left + rect.width / 2,
      y: rect.top - boxRect.top + rect.height / 2,
    }))
    rests = elements.map((element, i) => ({
      x: left + Number(element.dataset.restX) * unit + rects[i].width / 2,
      y: pileTop + Number(element.dataset.restY) * unit + rects[i].height / 2,
    }))

    // Release order: the lowest row of the pile first, since tiles land on the ones below; in a
    // row, the tile lower in the layout first (it is out of the way of the one above it).
    const pileRow = (i: number) => Math.round(Number(elements[i].dataset.restY) / 100)
    const layoutRow = (i: number) => Math.round(origins[i].y / (50 * unit))
    order = elements
      .map((_, i) => i)
      .sort(
        (a, b) =>
          pileRow(b) - pileRow(a) ||
          layoutRow(b) - layoutRow(a) ||
          Number(elements[a].dataset.restX) - Number(elements[b].dataset.restX),
      )

    world = createWorld(boxRect.width, boxRect.height)
    world.onWake = () => run()
    const piled = phase === "piled"
    tiles = elements.map((_, i) =>
      addTile(world, piled ? rests[i] : origins[i], rects[i].width, rects[i].height),
    )
    // The guide: a hanging or falling tile is eased toward its place; a piled one is free.
    tiles.forEach((tile, i) => {
      tile.pinned = !live || !piled
      if (!piled) tile.target = rests[i]
    })
  }

  function render() {
    tiles.forEach((tile, i) => {
      const { x, y, angle } = pose(tile)
      elements[i].style.transform =
        `translate(${x - origins[i].x}px, ${y - origins[i].y}px) rotate(${angle}rad)`
    })
  }

  /** Releases the tiles that are due, with a small random push and spin. */
  function release() {
    order.forEach((i, rank) => {
      if (tiles[i].pinned && steps >= rank * RELEASE_STEPS) {
        tiles[i].pinned = false
        kick(
          tiles[i],
          { x: (noise(i, 3) - 0.5) * 2 * KICK_PUSH, y: 0 },
          (noise(i, 10) - 0.5) * 2 * KICK_SPIN,
        )
      }
    })
  }

  /** One physics step of the fall. */
  function fallStep() {
    release()
    step(world)
    steps++
  }

  /** The fall is over: ease what is left onto the exact pile, then pin the tiles there. */
  function startSettling() {
    phase = "settling"
    settled = 0
    landing = tiles.map((tile) => pose(tile))
  }

  function settleFrame(delta: number) {
    settled += delta
    const t = smoothstep(Math.min(settled / SETTLE_MS, 1))
    elements.forEach((element, i) => {
      const from = landing[i]
      const x = from.x + (rests[i].x - from.x) * t
      const y = from.y + (rests[i].y - from.y) * t
      const angle = from.angle * (1 - t)
      element.style.transform = `translate(${x - origins[i].x}px, ${y - origins[i].y}px) rotate(${angle}rad)`
    })
    if (t >= 1) land()
  }

  /** The tiles are in the pile: a new world holds them there, pinned until the first grab. */
  function land() {
    phase = "piled"
    build()
    render()
    if (animate) box.dataset.pile = ""
  }

  /** Starts the fall (reduced motion: the pile at once). */
  function fall() {
    if (phase !== "hung") return
    if (!animate) {
      land()
      return
    }
    phase = "falling"
    steps = 0
    run()
  }

  /** Turns the physics on: from the first grab the tiles are free (and stay free until a resize). */
  function goLive() {
    if (live) return
    live = true
    for (const tile of tiles) tile.pinned = false
    wake(world)
  }

  /** Rests the pile at once, without animation (a resize while the tiles are free). */
  function settle() {
    for (let i = 0; i < SETTLE_STEPS; i++) step(world)
    render()
  }

  // Mouse drag in progress (see `onPointerDown`).
  let drag: { start: Point; moved: boolean } | null = null
  let suppressClick = false

  build()
  if (!animate) fall()

  let skipFirstResize = true
  const resizeObserver = new ResizeObserver(() => {
    if (skipFirstResize) {
      skipFirstResize = false
      return
    }
    drop()
    // A fall in progress ends in the pile.
    if (phase === "falling" || phase === "settling") phase = "piled"
    build()
    if (phase === "piled" && live) settle()
    else render()
  })
  resizeObserver.observe(box)

  function reset() {
    for (const element of elements) element.style.transform = ""
  }

  if (!animate) {
    return {
      cleanup: () => {
        resizeObserver.disconnect()
        reset()
      },
      fall,
    }
  }

  // Drag and throw, mouse only: on touch, a swipe over the tiles keeps scrolling the page.
  function toBox(event: PointerEvent) {
    const rect = box.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function onPointerDown(event: PointerEvent) {
    // Only the piled tiles can be grabbed: before and during the fall a press is a plain click.
    if (phase !== "piled") return
    if (event.pointerType !== "mouse" || event.button !== 0) return
    if (!elements.some((element) => element.contains(event.target as Node))) return
    const point = toBox(event)
    // The tile under the pointer as simulated (the topmost one where tiles overlap).
    const index = tileAt(world, point)
    if (index === -1) return
    event.preventDefault() // No text selection or native link drag.
    goLive()
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

  // The loop only runs while something moves and the footer is on screen: hanging or piled (or
  // scrolled away) no frame is requested; the fall and a grab start it again.
  let pending = 0
  let running = false
  let onScreen = true
  function tick({ delta }: { delta: number }) {
    if (!onScreen || phase === "hung" || (phase === "piled" && (!live || isAsleep(world)))) {
      stop()
      return
    }
    if (phase === "settling") {
      settleFrame(delta)
      return
    }
    pending = Math.min(pending + delta, STEP * 4)
    while (pending >= STEP) {
      if (phase === "falling") {
        fallStep()
        const released = tiles.every((tile) => !tile.pinned)
        if ((released && isAsleep(world)) || steps > MAX_FALL_STEPS) {
          startSettling()
          break
        }
      } else {
        step(world)
      }
      pending -= STEP
    }
    if (phase === "falling") render()
    else if (phase === "piled") render()
  }
  function run() {
    if (running || !onScreen) return
    running = true
    pending = 0
    frame.update(tick, true)
  }
  function stop() {
    if (!running) return
    running = false
    cancelFrame(tick)
  }
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    if (onScreen) run()
  })
  visibility.observe(box)

  const cleanup = () => {
    stop()
    visibility.disconnect()
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

  return { cleanup, fall }
}
