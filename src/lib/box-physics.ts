/**
 * Minimal 2D physics for rectangles in a box (the footer tiles, the hero playground; no physics
 * library): each tile is a rigid rectangle made of its 4 corners, simulated with Verlet integration and position-based constraints.
 *
 * - Corners move on their own, then shape matching snaps them back to an exact rectangle (the
 *   best-fit position and angle), so a tile tips over and rotates naturally when a corner hits
 *   something, and can never be crushed or stretched.
 * - Whole tiles are clamped inside the box at every iteration: whatever its speed, a tile can
 *   never leave the box (no tunneling through walls, unlike impulse engines).
 * - Tiles push each other apart along the axis of least overlap (separating axis theorem), moving
 *   the deepest corners, so contacts also make them rotate.
 *
 * Units: px and steps (one step = 1/60 s).
 */

/** Default gravity (px/step²). */
const GRAVITY = 0.32
/** Velocity kept per step, the rest is air drag. */
const AIR = 0.995
/** Top speed of a corner (px/step), so throws stay readable. */
const MAX_SPEED = 40
/** Constraint passes per step: more is stiffer and steadier piles. */
const ITERATIONS = 10
/** Velocity kept per step along the floor or ceiling while touching it (1 - friction). */
const FLOOR_SLIDE = 0.8
/** Same along the side walls: almost slippery, so tiles slide down instead of sticking. */
const SIDE_SLIDE = 0.98
/** Bounce off a wall (fraction of the speed into it). */
const RESTITUTION = 0.1
/** Pull of the grabbed point toward the pointer per step (0..1). */
const DRAG_STIFFNESS = 0.35
/** Below this corner motion (px/step) for `SLEEP_STEPS` steps, the pile is at rest. */
const SLEEP_SPEED = 0.08
const SLEEP_STEPS = 40

type Point = { x: number; y: number }
type Corner = Point & {
  px: number
  py: number
  /** Wall touched during the last step, for friction: floor/ceiling (`y`) or side (`x`). */
  contact: "x" | "y" | null
}

export type Tile = {
  /** Top left, top right, bottom right, bottom left. */
  corners: [Corner, Corner, Corner, Corner]
  width: number
  height: number
  /** Hangs in place (not simulated) until released. */
  pinned: boolean
}

type Drag = {
  tile: Tile
  /** Grabbed point in tile coordinates (0..1 across, 0..1 down). */
  u: number
  v: number
  target: Point
}

export type World = {
  width: number
  height: number
  /** Gravity (px/step²). */
  gravity: number
  tiles: Tile[]
  drag: Drag | null
  /** Steps in a row with (almost) no motion. */
  stillSteps: number
}

export function createWorld(width: number, height: number, gravity = GRAVITY): World {
  return { width, height, gravity, tiles: [], drag: null, stillSteps: 0 }
}

type TileOptions = {
  /** Starts released (simulated) instead of hanging in place. */
  released?: boolean
  /** Starting angle (rad). */
  angle?: number
  /** Starting velocity (px/step). */
  velocity?: Point
}

/** Adds a tile centered on `center`: upright and pinned, unless `options` say otherwise. */
export function addTile(
  world: World,
  center: Point,
  width: number,
  height: number,
  { released = false, angle = 0, velocity = { x: 0, y: 0 } }: TileOptions = {},
): Tile {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const corner = (dx: number, dy: number): Corner => {
    const x = center.x + dx * cos - dy * sin
    const y = center.y + dx * sin + dy * cos
    return { x, y, px: x - velocity.x, py: y - velocity.y, contact: null }
  }
  const w = width / 2
  const h = height / 2
  const tile: Tile = {
    corners: [corner(-w, -h), corner(w, -h), corner(w, h), corner(-w, h)],
    width,
    height,
    pinned: !released,
  }
  world.tiles.push(tile)
  return tile
}

/** Takes a tile out of the world (and out of a drag, if it was grabbed). */
export function removeTile(world: World, tile: Tile) {
  world.tiles = world.tiles.filter((other) => other !== tile)
  if (world.drag?.tile === tile) world.drag = null
}

/** Center and angle (rad) of a tile, for rendering. */
export function pose(tile: Tile) {
  const [a, b, c, d] = tile.corners
  return {
    x: (a.x + b.x + c.x + d.x) / 4,
    y: (a.y + b.y + c.y + d.y) / 4,
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  }
}

/** Whether the pile has been still long enough to stop simulating it. */
export function isAsleep(world: World) {
  return world.drag === null && world.stillSteps >= SLEEP_STEPS
}

export function wake(world: World) {
  world.stillSteps = 0
}

/** Grabs `tile` at the box point `point`; the point then follows `moveDrag`. */
export function startDrag(world: World, tile: Tile, point: Point) {
  tile.pinned = false
  const { u, v } = toTile(tile, point)
  world.drag = { tile, u: clamp(u, 0, 1), v: clamp(v, 0, 1), target: point }
  wake(world)
}

export function moveDrag(world: World, point: Point) {
  if (world.drag) world.drag.target = point
}

export function endDrag(world: World) {
  world.drag = null
}

/** Index of the topmost tile containing the box point, -1 if none. */
export function tileAt(world: World, point: Point) {
  for (let i = world.tiles.length - 1; i >= 0; i--) {
    const { u, v } = toTile(world.tiles[i], point)
    if (u >= 0 && u <= 1 && v >= 0 && v <= 1) return i
  }
  return -1
}

/** Advances the world by one step. */
export function step(world: World) {
  const live = world.tiles.filter((tile) => !tile.pinned)
  let motion = 0

  for (const tile of live) {
    for (const c of tile.corners) {
      let vx = (c.x - c.px) * AIR
      let vy = (c.y - c.py) * AIR + world.gravity
      const speed = Math.hypot(vx, vy)
      if (speed > MAX_SPEED) {
        vx *= MAX_SPEED / speed
        vy *= MAX_SPEED / speed
      }
      c.px = c.x
      c.py = c.y
      c.x += vx
      c.y += vy
      c.contact = null
    }
  }

  if (world.drag) pull(world.drag)

  for (let i = 0; i < ITERATIONS; i++) {
    for (let a = 0; a < world.tiles.length; a++) {
      for (let b = a + 1; b < world.tiles.length; b++) {
        separate(world.tiles[a], world.tiles[b])
      }
    }
    for (const tile of live) {
      // Corners against a wall first: an uneven contact (a tilted tile on the floor) then turns
      // the tile in `matchShape`, so it falls flat instead of resting on a corner.
      clampCorners(world, tile)
      matchShape(tile)
      keepInside(world, tile)
    }
  }

  for (const tile of live) {
    for (const c of tile.corners) {
      applyContact(c)
      motion = Math.max(motion, Math.hypot(c.x - c.px, c.y - c.py))
    }
  }
  world.stillSteps = motion < SLEEP_SPEED ? world.stillSteps + 1 : 0
}

/** Tile coordinates (0..1) of a box point, through the tile's current position and angle. */
function toTile(tile: Tile, point: Point) {
  const { x, y, angle } = pose(tile)
  const cos = Math.cos(-angle)
  const sin = Math.sin(-angle)
  const dx = point.x - x
  const dy = point.y - y
  return {
    u: (dx * cos - dy * sin) / tile.width + 0.5,
    v: (dx * sin + dy * cos) / tile.height + 0.5,
  }
}

/** Moves the grabbed point toward the pointer, spread over the corners by their weights. */
function pull({ tile, u, v, target }: Drag) {
  const weights = [(1 - u) * (1 - v), u * (1 - v), u * v, (1 - u) * v]
  const [a, b, c, d] = tile.corners
  const grabbed = {
    x: a.x * weights[0] + b.x * weights[1] + c.x * weights[2] + d.x * weights[3],
    y: a.y * weights[0] + b.y * weights[1] + c.y * weights[2] + d.y * weights[3],
  }
  const norm = weights.reduce((sum, w) => sum + w * w, 0)
  const dx = ((target.x - grabbed.x) * DRAG_STIFFNESS) / norm
  const dy = ((target.y - grabbed.y) * DRAG_STIFFNESS) / norm
  tile.corners.forEach((corner, i) => {
    corner.x += dx * weights[i]
    corner.y += dy * weights[i]
  })
}

/** Rest offsets of the corners from the center, in the tile's own frame. */
function restOffsets(tile: Tile): Point[] {
  const w = tile.width / 2
  const h = tile.height / 2
  return [
    { x: -w, y: -h },
    { x: w, y: -h },
    { x: w, y: h },
    { x: -w, y: h },
  ]
}

/**
 * Shape matching: moves the corners to the exact rectangle that best fits them (their center,
 * and the angle that best aligns the rest shape with them). Pushes on corners thus turn into a
 * move and a rotation of the whole tile, and the tile keeps its size.
 */
function matchShape(tile: Tile) {
  const rest = restOffsets(tile)
  let cx = 0
  let cy = 0
  for (const c of tile.corners) {
    cx += c.x / 4
    cy += c.y / 4
  }
  let dot = 0
  let cross = 0
  tile.corners.forEach((c, i) => {
    const dx = c.x - cx
    const dy = c.y - cy
    dot += rest[i].x * dx + rest[i].y * dy
    cross += rest[i].x * dy - rest[i].y * dx
  })
  const angle = Math.atan2(cross, dot)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  tile.corners.forEach((c, i) => {
    c.x = cx + rest[i].x * cos - rest[i].y * sin
    c.y = cy + rest[i].x * sin + rest[i].y * cos
  })
}

/** Puts each corner back inside the box, remembering which wall it touched. */
function clampCorners(world: World, tile: Tile) {
  for (const c of tile.corners) {
    const x = clamp(c.x, 0, world.width)
    const y = clamp(c.y, 0, world.height)
    if (y !== c.y) c.contact = "y"
    else if (x !== c.x && c.contact !== "y") c.contact = "x"
    c.x = x
    c.y = y
  }
}

/**
 * Once per step, for a corner that touched a wall: a small bounce off it and friction along it
 * (through the previous position, i.e. the velocity).
 */
function applyContact(c: Corner) {
  if (!c.contact) return
  const vx = c.x - c.px
  const vy = c.y - c.py
  if (c.contact === "y") {
    c.px = c.x - vx * FLOOR_SLIDE
    c.py = c.y + vy * RESTITUTION
  } else {
    c.px = c.x + vx * RESTITUTION
    c.py = c.y - vy * SIDE_SLIDE
  }
}

/** Moves the whole tile back inside the box if shape matching left it overlapping a wall. */
function keepInside(world: World, tile: Tile) {
  const xs = tile.corners.map((c) => c.x)
  const ys = tile.corners.map((c) => c.y)
  const dx = Math.max(0, -Math.min(...xs)) - Math.max(0, Math.max(...xs) - world.width)
  const dy = Math.max(0, -Math.min(...ys)) - Math.max(0, Math.max(...ys) - world.height)
  if (dx === 0 && dy === 0) return
  for (const c of tile.corners) {
    c.x += dx
    c.y += dy
  }
}

/** Pushes two overlapping tiles apart along the axis of least overlap. */
function separate(a: Tile, b: Tile) {
  if (a.pinned && b.pinned) return
  let depth = Infinity
  let axis: Point = { x: 0, y: 0 }
  for (const tile of [a, b]) {
    for (let i = 0; i < 2; i++) {
      const p = tile.corners[i]
      const q = tile.corners[i + 1]
      const length = Math.hypot(q.x - p.x, q.y - p.y) || 1e-6
      const normal = { x: -(q.y - p.y) / length, y: (q.x - p.x) / length }
      const [minA, maxA] = project(a, normal)
      const [minB, maxB] = project(b, normal)
      const overlap = Math.min(maxA, maxB) - Math.max(minA, minB)
      if (overlap <= 0) return // Separating axis: no contact.
      if (overlap < depth) {
        depth = overlap
        // Points from `a` toward `b`.
        axis = (minA + maxA) / 2 <= (minB + maxB) / 2 ? normal : { x: -normal.x, y: -normal.y }
      }
    }
  }

  const share = a.pinned ? 0 : b.pinned ? 1 : 0.5
  // `b`'s corners deepest into `a` move along the axis, `a`'s deepest into `b` against it.
  push(b, axis, depth * (1 - share), -1)
  push(a, { x: -axis.x, y: -axis.y }, depth * share, -1)
}

/** Moves the corners of `tile` that lead along `-axis` (the contact side) by `distance`. */
function push(tile: Tile, axis: Point, distance: number, sign: number) {
  if (distance <= 0 || tile.pinned) return
  const dots = tile.corners.map((c) => (c.x * axis.x + c.y * axis.y) * sign)
  const deepest = Math.max(...dots)
  // Corners within 1px of the deepest one share the push (a flat face moves evenly).
  const contact = tile.corners.filter((_, i) => deepest - dots[i] < 1)
  for (const c of contact) {
    c.x += axis.x * distance
    c.y += axis.y * distance
  }
}

function project(tile: Tile, axis: Point): [number, number] {
  let min = Infinity
  let max = -Infinity
  for (const c of tile.corners) {
    const dot = c.x * axis.x + c.y * axis.y
    min = Math.min(min, dot)
    max = Math.max(max, dot)
  }
  return [min, max]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
