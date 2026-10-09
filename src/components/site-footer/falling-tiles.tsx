"use client"

import { useEffect, useRef, useState } from "react"
import { useLenis } from "lenis/react"
import { cancelFrame, frame, useInView, useReducedMotion } from "motion/react"
import type Matter from "matter-js"

import { cn } from "@/lib/utils"

type MatterModule = typeof Matter

/** Physics step (ms): Matter is stable with a fixed 60 Hz step, whatever the display rate. */
const STEP = 1000 / 60
/** Steps simulated at once to rest the pile without animation (reduced motion, resize). */
const SETTLE_STEPS = 600
/** Wall thickness (px), so thrown tiles cannot tunnel through. */
const WALL = 200
/** Pointer travel (px) past which a press on a tile is a drag, not a click. */
const DRAG_THRESHOLD = 4
/** Steps between the release of one row of tiles and the next, bottom row first. */
const ROW_STAGGER = 5
/** Speed (px/s) the page must hit its bottom with to knock the tiles down. */
const IMPACT_SPEED = 50

const TILE_OPTIONS: Matter.IBodyDefinition = {
  friction: 0.6,
  frictionStatic: 1,
  restitution: 0.15,
  density: 0.002,
}

/**
 * Falling tags (Figma dev notes, like the Framer "Falling Tags" component): the `[data-tile]`
 * links inside hang in their layout until the page hits its bottom fast enough (`IMPACT_SPEED`;
 * the scroll keeps its speed into the bottom, see `SmoothScrollProvider`), then fall with physics
 * (Matter.js), row by row from the bottom, and pile up at the bottom of the box. A slow arrival
 * leaves them hanging. With a mouse, tiles can be dragged and thrown; a press without moving
 * stays a click on the link.
 *
 * Matter.js is loaded only as the footer approaches. Tiles keep their place in the layout and are
 * moved with `transform` only (the box does not reflow). With reduced motion, the pile is
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
      if (knocked) return
      const time = performance.now()
      const previous = lastScroll.current
      const speed = ((scroll - previous.scroll) / (time - previous.time)) * 1000
      lastScroll.current = { scroll, time, speed }
      // (No previous event yet: the page may load already at the bottom, which is not an impact.)
      const arrived = previous.time > 0 && scroll >= limit - 1 && previous.scroll < limit - 1
      if (arrived && Math.max(speed, previous.speed) >= IMPACT_SPEED) setKnocked(true)
    },
    [knocked],
  )

  // Preload the engine half a screen early, so the tiles fall as soon as the page hits the bottom.
  useEffect(() => {
    if (near) void import("matter-js")
  }, [near])

  useEffect(() => {
    const element = box.current
    if (!element || !(knocked || reduceMotion)) return
    let stop: (() => void) | undefined
    let cancelled = false
    void import("matter-js").then(({ default: matter }) => {
      if (!cancelled) stop = startPile(matter, element, { animate: !reduceMotion })
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [knocked, reduceMotion])

  return (
    <div ref={box} className={cn("relative", className)}>
      {children}
    </div>
  )
}

/** Runs the pile in `box` and returns its cleanup, which puts the tiles back in their layout. */
function startPile(matter: MatterModule, box: HTMLElement, { animate }: { animate: boolean }) {
  const { Bodies, Body, Composite, Constraint, Engine, Sleeping } = matter
  const tiles = Array.from(box.querySelectorAll<HTMLElement>("[data-tile]"))
  const engine = Engine.create({ enableSleeping: true })
  let bodies: Matter.Body[] = []
  // Tile centers in the layout (box coordinates): the `transform` is the offset from them.
  let origins: Matter.Vector[] = []
  // Step at which each tile is released, and steps run since `build`.
  let releaseAt: number[] = []
  let steps = 0

  /** Walls around the box and one body per tile at its place in the layout. */
  function build() {
    Composite.clear(engine.world, false)
    const { clientWidth: width, clientHeight: height } = box
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, height + WALL / 2, width + 2 * WALL, WALL, { isStatic: true }),
      Bodies.rectangle(width / 2, -WALL / 2, width + 2 * WALL, WALL, { isStatic: true }),
      Bodies.rectangle(-WALL / 2, height / 2, WALL, height, { isStatic: true }),
      Bodies.rectangle(width + WALL / 2, height / 2, WALL, height, { isStatic: true }),
    ])
    // `offset*` ignore transforms: the layout place, wherever the tile is drawn now.
    origins = tiles.map((tile) => ({
      x: tile.offsetLeft + tile.offsetWidth / 2,
      y: tile.offsetTop + tile.offsetHeight / 2,
    }))
    bodies = tiles.map((tile, i) => {
      const body = Bodies.rectangle(
        origins[i].x,
        origins[i].y,
        tile.offsetWidth,
        tile.offsetHeight,
        // Rounded like the tile, which scales its radius with its size.
        {
          ...TILE_OPTIONS,
          chamfer: { radius: parseFloat(getComputedStyle(tile).borderTopLeftRadius) },
        },
      )
      Body.setStatic(body, true) // Hangs until released by `step`.
      return body
    })
    Composite.add(engine.world, bodies)
    // Rows by their place in the layout, bottom first: the order they are released in.
    const rows = [...new Set(origins.map((origin) => Math.round(origin.y)))].sort((a, b) => b - a)
    releaseAt = origins.map((origin) => rows.indexOf(Math.round(origin.y)) * ROW_STAGGER)
    steps = 0
  }

  /** One physics step, releasing the rows that are due. */
  function step() {
    bodies.forEach((body, i) => {
      if (body.isStatic && steps >= releaseAt[i]) Body.setStatic(body, false)
    })
    Engine.update(engine, STEP)
    steps++
  }

  function render() {
    bodies.forEach((body, i) => {
      const { x, y } = body.position
      tiles[i].style.transform =
        `translate(${x - origins[i].x}px, ${y - origins[i].y}px) rotate(${body.angle}rad)`
    })
  }

  function settle() {
    for (let i = 0; i < SETTLE_STEPS; i++) step()
    render()
  }

  // Mouse drag in progress (see `onPointerDown`).
  let drag: { constraint: Matter.Constraint; start: Matter.Vector; moved: boolean } | null = null
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
  function toBox(event: PointerEvent): Matter.Vector {
    const rect = box.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== "mouse" || event.button !== 0) return
    const index = tiles.findIndex((tile) => tile.contains(event.target as Node))
    if (index === -1) return
    event.preventDefault() // No text selection or native link drag.
    const body = bodies[index]
    const point = toBox(event)
    if (body.isStatic) Body.setStatic(body, false)
    Sleeping.set(body, false)
    const constraint = Constraint.create({
      pointA: point,
      bodyB: body,
      pointB: { x: point.x - body.position.x, y: point.y - body.position.y },
      length: 0,
      stiffness: 0.2,
      damping: 0.1,
    })
    Composite.add(engine.world, constraint)
    drag = { constraint, start: point, moved: false }
    // Captured by the tile, so the click (if any) still lands on its link.
    tiles[index].setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag) return
    const point = toBox(event)
    drag.constraint.pointA = point
    if (Math.hypot(point.x - drag.start.x, point.y - drag.start.y) > DRAG_THRESHOLD) {
      drag.moved = true
    }
  }

  function drop() {
    if (!drag) return
    Composite.remove(engine.world, drag.constraint)
    suppressClick = drag.moved
    drag = null
  }

  function onClick(event: MouseEvent) {
    if (suppressClick) event.preventDefault()
    suppressClick = false
  }

  box.addEventListener("pointerdown", onPointerDown)
  box.addEventListener("pointermove", onPointerMove)
  box.addEventListener("pointerup", drop)
  box.addEventListener("pointercancel", drop)
  box.addEventListener("click", onClick, true)

  let pending = 0
  function tick({ delta }: { delta: number }) {
    // Idle once the pile is at rest, until a tile is grabbed again.
    if (!drag && bodies.every((body) => body.isSleeping)) return
    pending = Math.min(pending + delta, STEP * 4)
    while (pending >= STEP) {
      step()
      pending -= STEP
    }
    render()
  }
  frame.update(tick, true)

  function reset() {
    Engine.clear(engine)
    for (const tile of tiles) tile.style.transform = ""
  }

  return () => {
    cancelFrame(tick)
    resizeObserver.disconnect()
    box.removeEventListener("pointerdown", onPointerDown)
    box.removeEventListener("pointermove", onPointerMove)
    box.removeEventListener("pointerup", drop)
    box.removeEventListener("pointercancel", drop)
    box.removeEventListener("click", onClick, true)
    reset()
  }
}
