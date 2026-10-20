"use client"

import { useEffect, useRef, useState } from "react"
import { cancelFrame, frame, useReducedMotion } from "motion/react"
import { ArrowRightIcon } from "lucide-react"

import { McButton } from "@/components/ui/mc-button"
import { PLAYGROUND, PLAYGROUND_INPUT } from "@/const/playground"
import {
  addTile,
  createWorld,
  endDrag,
  isAsleep,
  moveDrag,
  pose,
  removeTile,
  startDrag,
  step,
  tileAt,
  wake,
  type Tile,
  type World,
} from "@/lib/box-physics"
import { cn } from "@/lib/utils"

/** Physics step (ms): fixed 60 Hz, whatever the display rate. */
const STEP = 1000 / 60
/** Steps simulated at once to rest a box without animation (reduced motion). */
const SETTLE_STEPS = 900
/** Time (ms) a box fades for before it leaves, once the playground holds too many. */
const FADE = 400

type Box = { id: number; text: string }

/** What the board lends to the boxes dropped on it. */
type BoardApi = {
  /** Drops `element` from the sky as a new body; returns it. */
  drop: (element: HTMLElement) => void
  /** Takes `element`'s body out of the world. */
  remove: (element: HTMLElement) => void
}

/** Style of a dropped box (Figma "output fileld": the same field as the input). */
const BOX =
  "absolute top-0 left-0 rounded-lg border border-border bg-input px-3.5 py-2.5 paragraph-md whitespace-nowrap text-foreground shadow-xs transition-opacity select-none"

/** A message dropped from the sky: a body of its own, added to the world once it is mounted. */
function DroppedBox({
  box,
  fading,
  api,
}: {
  box: Box
  fading: boolean
  api: React.RefObject<BoardApi | null>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    const board = api.current
    if (!element || !board) return
    board.drop(element)
    return () => board.remove(element)
  }, [api])

  return (
    <div
      ref={ref}
      aria-hidden
      data-body
      style={{ transitionDuration: `${FADE}ms` }}
      className={cn(BOX, "pointer-events-auto will-change-transform", fading && "opacity-0")}
    >
      {box.text}
    </div>
  )
}

/**
 * Client island of the playground: a world the size of the Figma frame plus the sky above it. Its
 * `[data-body]` children hang at their Figma positions until the first touch, then fall and pile up
 * with physics (`src/lib/box-physics.ts`, heavier gravity than the footer). With a mouse they can
 * be dragged and thrown. The input drops a new box from above the visible area. The input itself
 * is a fixed body: boxes land on it.
 *
 * Reduced motion: dropped boxes are shown at rest at once, and dragging still works.
 */
export function PlaygroundBoard({ children }: { children: React.ReactNode }) {
  const boardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const api = useRef<BoardApi | null>(null)
  const reduceMotion = useReducedMotion()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [fading, setFading] = useState<number[]>([])
  const [text, setText] = useState("")
  const nextId = useRef(0)

  useEffect(() => {
    const board = boardRef.current
    const form = formRef.current
    if (!board || !form) return
    return startPlayground(board, form, api, { animate: !reduceMotion })
  }, [reduceMotion])

  function drop(event: React.FormEvent) {
    event.preventDefault()
    const message = text.trim()
    if (!message) return
    const id = nextId.current++
    setText("")
    setBoxes((current) => {
      const next = [...current, { id, text: message }]
      // Past the limit, the oldest box fades, then leaves.
      const overflow = next.length - PLAYGROUND.maxDropped
      if (overflow > 0) {
        const oldest = next.slice(0, overflow).map((box) => box.id)
        setFading((all) => [...all, ...oldest])
        setTimeout(() => {
          setBoxes((all) => all.filter((box) => !oldest.includes(box.id)))
          setFading((all) => all.filter((value) => !oldest.includes(value)))
        }, FADE)
      }
      return next
    })
  }

  return (
    <div
      ref={boardRef}
      className={cn(
        "pointer-events-none absolute top-0 left-0 select-none",
        // Cursors of the bodies, set by `startPlayground`: open hand, closed hand while dragging.
        "data-dragging:[&_[data-body]]:cursor-grabbing! data-ready:[&_[data-body]:not([data-fixed])]:cursor-grab",
      )}
      style={{ width: PLAYGROUND.width, height: PLAYGROUND.height + PLAYGROUND.sky }}
    >
      {children}

      <form
        ref={formRef}
        data-body
        data-fixed
        onSubmit={drop}
        className="pointer-events-auto absolute flex items-center gap-2"
        style={{
          left: PLAYGROUND_INPUT.x,
          top: PLAYGROUND_INPUT.y + PLAYGROUND.sky,
          width: PLAYGROUND_INPUT.width,
          height: PLAYGROUND_INPUT.height,
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={PLAYGROUND.maxLength}
          placeholder={PLAYGROUND_INPUT.placeholder}
          aria-label="Write a message to drop on the pile"
          autoComplete="off"
          className="h-[44px] w-[320px] min-w-0 rounded-lg border border-border bg-input px-3.5 py-[9px] paragraph-md text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring"
        />
        <McButton
          type="submit"
          size="lg"
          icon="only"
          aria-label="Drop the message"
          iconDefinition={<ArrowRightIcon className="size-5" />}
          className="size-[44px] shrink-0 p-0"
        />
      </form>

      {boxes.map((box) => (
        <DroppedBox key={box.id} box={box} fading={fading.includes(box.id)} api={api} />
      ))}
    </div>
  )
}

/**
 * Runs the physics of `board`: its `[data-body]` elements, the dropped boxes and the fixed form.
 * Returns the cleanup, which puts everything back in its layout place.
 */
function startPlayground(
  board: HTMLElement,
  form: HTMLElement,
  api: React.RefObject<BoardApi | null>,
  { animate }: { animate: boolean },
) {
  const world: World = createWorld(
    PLAYGROUND.width,
    PLAYGROUND.height + PLAYGROUND.sky,
    PLAYGROUND.gravity,
  )
  // Body, its element and its layout center (the `transform` is the offset from it).
  const bodies = new Map<HTMLElement, { tile: Tile; origin: { x: number; y: number } }>()
  let released = false

  const center = (element: HTMLElement) => ({
    x: element.offsetLeft + element.offsetWidth / 2,
    y: element.offsetTop + element.offsetHeight / 2,
  })

  // The pile as laid out (the dropped boxes join later).
  for (const element of board.querySelectorAll<HTMLElement>("[data-body]")) {
    const origin = center(element)
    bodies.set(element, {
      tile: addTile(world, origin, element.offsetWidth, element.offsetHeight),
      origin,
    })
  }

  /** The first touch sets the whole pile free (the fixed form stays). */
  function release() {
    if (released) return
    released = true
    for (const [element, { tile }] of bodies) {
      if (element !== form) tile.pinned = false
    }
    wake(world)
  }

  function render() {
    for (const [element, { tile, origin }] of bodies) {
      const { x, y, angle } = pose(tile)
      element.style.transform = `translate(${x - origin.x}px, ${y - origin.y}px) rotate(${angle}rad)`
    }
  }

  function settle() {
    for (let i = 0; i < SETTLE_STEPS; i++) step(world)
    render()
  }

  api.current = {
    drop(element) {
      release()
      // From the sky: just above what is on screen (the top of the world when it is not).
      const rect = board.getBoundingClientRect()
      const visibleTop = Math.max(0, -rect.top)
      const width = element.offsetWidth
      const height = element.offsetHeight
      const x = PLAYGROUND_INPUT.x + PLAYGROUND_INPUT.width / 2 + (Math.random() - 0.5) * 240
      const y = Math.max(height, visibleTop - height - 40)
      element.style.left = `${Math.min(Math.max(x, width / 2), PLAYGROUND.width - width / 2) - width / 2}px`
      element.style.top = `${y - height / 2}px`
      const origin = center(element)
      const tile = addTile(world, origin, width, height, {
        released: true,
        angle: (Math.random() - 0.5) * 0.9,
        velocity: { x: (Math.random() - 0.5) * 3, y: 2 },
      })
      bodies.set(element, { tile, origin })
      wake(world)
      if (!animate) settle()
    },
    remove(element) {
      const body = bodies.get(element)
      if (!body) return
      removeTile(world, body.tile)
      bodies.delete(element)
      wake(world)
    },
  }

  board.dataset.ready = ""
  function toBoard(event: PointerEvent) {
    const rect = board.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "touch" || event.button !== 0) return
    const target = event.target as HTMLElement
    // The form and its controls keep their own presses (typing, clicking).
    if (form.contains(target)) return
    const point = toBoard(event)
    const index = tileAt(world, point)
    const tile = world.tiles[index]
    const element = [...bodies].find(([, body]) => body.tile === tile)?.[0]
    if (!tile || !element || element === form) return
    event.preventDefault() // No text selection or native image drag.
    release()
    startDrag(world, tile, point)
    board.dataset.dragging = ""
    element.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (world.drag) moveDrag(world, toBoard(event))
  }

  function drop() {
    if (!world.drag) return
    endDrag(world)
    delete board.dataset.dragging
  }

  board.addEventListener("pointerdown", onPointerDown)
  board.addEventListener("pointermove", onPointerMove)
  board.addEventListener("pointerup", drop)
  board.addEventListener("pointercancel", drop)
  // Capture lost (window blur, tab switch...): no pointerup will come.
  board.addEventListener("lostpointercapture", drop)

  let pending = 0
  function tick({ delta }: { delta: number }) {
    if (isAsleep(world)) return
    pending = Math.min(pending + delta, STEP * 4)
    while (pending >= STEP) {
      step(world)
      pending -= STEP
    }
    render()
  }
  frame.update(tick, true)

  return () => {
    cancelFrame(tick)
    board.removeEventListener("pointerdown", onPointerDown)
    board.removeEventListener("pointermove", onPointerMove)
    board.removeEventListener("pointerup", drop)
    board.removeEventListener("pointercancel", drop)
    board.removeEventListener("lostpointercapture", drop)
    delete board.dataset.ready
    delete board.dataset.dragging
    api.current = null
    for (const element of bodies.keys()) element.style.transform = ""
  }
}
