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
/** Steps simulated at once to rest the tiles after a resize, and with reduced motion. */
const SETTLE_STEPS = 600
/** Pointer travel (px) past which a press on a tile is a drag, not a click. */
const DRAG_THRESHOLD = 4
/** Steps between the release of one tile and the next, the lowest hanging one first. */
const RELEASE_STEPS = 5
/** Push (px/step) and spin (px/step of the top corners) a tile gets when it is released, at most. */
const KICK_PUSH = 1
const KICK_SPIN = 1.5
/** Steps after which a fall that has not come to rest ends where it is. */
const MAX_FALL_STEPS = 60 * 8
/** Speed (px/s) the page must hit its bottom with to knock the tiles down. */
const IMPACT_SPEED = 50
/** Height bands (fractions of the box) the tiles hang in: the icons above the wide tiles. */
const HANG_BANDS = { icon: [0.02, 0.46], wide: [0.5, 0.94] } as const
/** Most tilt (rad) of a hanging tile. */
const HANG_TILT = { icon: 0.26, wide: 0.04 } as const
/** Random draws kept per tile: candidate places, tried in turn until one is free. */
const DRAWS = 120

/** One random draw (0..1 each) of a hanging tile: its place in its band and its tilt. */
type Draw = { x: number; y: number; tilt: number }

/**
 * Falling tags (Figma dev notes, like the Framer "Falling Tags" component): the `[data-tile]`
 * links inside hang scattered over the box, at random places and tilts drawn again on every page
 * load (the icons above the wide email and address tiles, none overlapping), until the page hits
 * its bottom fast enough (`IMPACT_SPEED`; the scroll keeps its speed into the bottom, see
 * `SmoothScrollProvider`). Then they are released one after the other, the lowest first, and
 * really fall (our own physics, `src/lib/box-physics.ts`, run on Motion's frame loop): they tumble,
 * bump into each other and stay where they land. A slow arrival leaves them hanging.
 * Once landed, the tiles can be dragged and thrown with a mouse; the first grab wakes the physics.
 * A press without moving stays a click on the link.
 *
 * Tiles keep their place in the layout and are moved with `transform` only (the box does not
 * reflow). With reduced motion, they are shown landed at once. On resize, they are placed again
 * in the new box, in proportion, and rested.
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
  // Drawn once per page load and kept when the effect runs again (the fall), so tiles never jump.
  const draws = useRef<Draw[][] | null>(null)
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
    draws.current ??= Array.from(element.querySelectorAll("[data-tile]"), () =>
      Array.from({ length: DRAWS }, () => ({
        x: Math.random(),
        y: Math.random(),
        tilt: Math.random(),
      })),
    )
    const started = startPile(element, draws.current, { animate: !reduceMotion })
    if (knocked) started.fall()
    return started.cleanup
  }, [near, reduceMotion, knocked])

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

type Point = { x: number; y: number }
type Pose = Point & { angle: number }
type Size = { width: number; height: number }

/** Half the side of a tile, for keeping hanging tiles apart. */
const reach = ({ width, height }: Size) => Math.max(width, height) / 2
/** How much wider a tile's box gets at the most icon tilt (cos + sin of `HANG_TILT.icon`). */
const TILT_SPAN = Math.cos(HANG_TILT.icon) + Math.sin(HANG_TILT.icon)

/**
 * Hanging places in a `width` × `height` box. The wide tiles (email, address) each get their own
 * slice of the lower band, in page order, so they never overlap; each icon takes the first of its
 * random draws that keeps it clear of the icons already placed (its last draw when none is), in
 * the upper band. Same draws, same places: a resize keeps the arrangement in proportion.
 */
function scatter(sizes: Size[], draws: Draw[][], width: number, height: number): Pose[] {
  const isWide = (size: Size) => size.width > size.height * 1.5
  const wideTiles = sizes.flatMap((size, i) => (isWide(size) ? [i] : []))
  const places: Pose[] = []
  const icons: number[] = []

  /** A place for `size` from `draw`, within the band from `top` to `bottom` (px). */
  const placeIn = (size: Size, draw: Draw, top: number, bottom: number, tilt: number): Pose => {
    const halfW = Math.min(size.width / 2, width / 2)
    const minY = top + size.height / 2
    const maxY = Math.max(bottom - size.height / 2, minY)
    return {
      x: halfW + draw.x * Math.max(width - 2 * halfW, 0),
      y: minY + draw.y * (maxY - minY),
      angle: (draw.tilt - 0.5) * 2 * tilt,
    }
  }

  const [wideTop, wideBottom] = HANG_BANDS.wide.map((fraction) => fraction * height)
  const slice = (wideBottom - wideTop) / Math.max(wideTiles.length, 1)
  wideTiles.forEach((i, rank) => {
    const top = wideTop + rank * slice
    places[i] = placeIn(sizes[i], draws[i][0], top, top + slice, HANG_TILT.wide)
  })

  const [iconTop, iconBottom] = HANG_BANDS.icon.map((fraction) => fraction * height)
  sizes.forEach((size, i) => {
    if (isWide(size)) return
    // Clear when their boxes, grown for the tilt, do not overlap on one of the axes.
    const clear = (place: Pose) =>
      icons.every((j) => {
        const span = (reach(size) + reach(sizes[j])) * TILT_SPAN
        return Math.abs(place.x - places[j].x) > span || Math.abs(place.y - places[j].y) > span
      })
    const options = draws[i].map((draw) => placeIn(size, draw, iconTop, iconBottom, HANG_TILT.icon))
    places[i] = options.find(clear) ?? options[options.length - 1]
    icons.push(i)
  })
  return places
}

/**
 * Runs the tiles in `box`: hanging at their `draws`, falling on `fall`, then landed. `cleanup`
 * puts them back in their layout.
 */
function startPile(box: HTMLElement, draws: Draw[][], { animate }: { animate: boolean }) {
  const elements = Array.from(box.querySelectorAll<HTMLElement>("[data-tile]"))
  let world = createWorld(0, 0)
  let tiles: Tile[] = []
  // Tile centers in the layout (box coordinates): the `transform` is the offset from them.
  let origins: Point[] = []
  // Where the tiles were at the last rebuild, in fractions of the box (for resizes).
  let poses: Pose[] | null = null
  let boxSize = { width: 0, height: 0 }
  // `hung` at their random places, `falling` (physics), then `landed`: where they fell, pinned
  // until the first grab (`live`) turns the physics on for good.
  let phase: "hung" | "falling" | "landed" = "hung"
  let live = false
  let steps = 0
  let order: number[] = []

  /** The tiles' sizes and layout places, and a physics world holding them at `places`. */
  function build(places?: Pose[]) {
    // Sizes and places in the layout, to the sub-pixel: measured without the tiles' transforms.
    reset()
    const boxRect = box.getBoundingClientRect()
    const rects = elements.map((element) => element.getBoundingClientRect())
    origins = rects.map((rect) => ({
      x: rect.left - boxRect.left + rect.width / 2,
      y: rect.top - boxRect.top + rect.height / 2,
    }))
    boxSize = { width: boxRect.width, height: boxRect.height }
    const at = places ?? scatter(rects, draws, boxRect.width, boxRect.height)

    world = createWorld(boxRect.width, boxRect.height)
    world.onWake = () => run()
    tiles = elements.map((_, i) =>
      // As heavy as they are big: a small icon landing on the long email tile does not tip it.
      addTile(world, at[i], rects[i].width, rects[i].height, {
        angle: at[i].angle,
        mass: rects[i].width * rects[i].height,
      }),
    )
    // Released lowest first: they land before the ones hanging above them reach them.
    order = elements.map((_, i) => i).sort((a, b) => at[b].y - at[a].y)
    for (const tile of tiles) tile.pinned = phase === "hung" || (phase === "landed" && !live)
  }

  /** Where the tiles are now, in fractions of the box, to place them again in a resized box. */
  function remember() {
    poses = tiles.map((tile) => {
      const { x, y, angle } = pose(tile)
      return { x: x / boxSize.width, y: y / boxSize.height, angle }
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
          { x: (Math.random() - 0.5) * 2 * KICK_PUSH, y: 0 },
          (Math.random() - 0.5) * 2 * KICK_SPIN,
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

  /** The fall is over: the tiles stay where they landed, pinned until the first grab. */
  function land() {
    phase = "landed"
    for (const tile of tiles) tile.pinned = !live
    remember()
    render()
    if (animate) box.dataset.pile = ""
  }

  /** Lets the released tiles come to rest at once, without animation. */
  function settle() {
    for (let i = 0; i < SETTLE_STEPS && !isAsleep(world); i++) step(world)
  }

  /** Starts the fall (reduced motion: the tiles landed at once). */
  function fall() {
    if (phase !== "hung") return
    phase = "falling"
    steps = 0
    if (!animate) {
      for (const tile of tiles) tile.pinned = false
      settle()
      land()
      return
    }
    run()
  }

  /** Turns the physics on: from the first grab the tiles are free. */
  function goLive() {
    if (live) return
    live = true
    for (const tile of tiles) tile.pinned = false
    wake(world)
  }

  // Mouse drag in progress (see `onPointerDown`).
  let drag: { start: Point; moved: boolean } | null = null
  let suppressClick = false

  build()
  render()

  let skipFirstResize = true
  const resizeObserver = new ResizeObserver(() => {
    if (skipFirstResize) {
      skipFirstResize = false
      return
    }
    drop()
    if (phase === "hung") {
      // The same draws in the new box.
      build()
      render()
      return
    }
    // A fall in progress ends now; landed tiles are placed again in proportion and rested.
    if (phase === "falling") remember()
    const previous = poses ?? []
    const width = box.getBoundingClientRect().width
    const height = box.getBoundingClientRect().height
    phase = "landed"
    build(previous.map(({ x, y, angle }) => ({ x: x * width, y: y * height, angle })))
    for (const tile of tiles) tile.pinned = false
    settle()
    land()
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
    // Only the landed tiles can be grabbed: before and during the fall a press is a plain click.
    if (phase !== "landed") return
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

  // The loop only runs while something moves and the footer is on screen: hanging or landed (or
  // scrolled away) no frame is requested; the fall and a grab start it again.
  let pending = 0
  let running = false
  let onScreen = true
  function tick({ delta }: { delta: number }) {
    if (!onScreen || phase === "hung" || (phase === "landed" && (!live || isAsleep(world)))) {
      if (phase === "landed" && live) remember()
      stop()
      return
    }
    pending = Math.min(pending + delta, STEP * 4)
    while (pending >= STEP) {
      if (phase === "falling") {
        fallStep()
        const released = tiles.every((tile) => !tile.pinned)
        if ((released && isAsleep(world)) || steps > MAX_FALL_STEPS) {
          land()
          break
        }
      } else {
        step(world)
      }
      pending -= STEP
    }
    render()
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
