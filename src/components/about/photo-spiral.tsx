import { SpiralScroll } from "@/components/about/spiral-scroll"
import { ABOUT_PHOTOS } from "@/const/about"

/**
 * Spiral geometry in px of the 1440px Figma frame, scaled by the `--u` length set by the section
 * (1px on desktop). One panel per photo, 3:2 like the photos so they are not stretched.
 */
const PANEL_COUNT = ABOUT_PHOTOS.length
const PANEL_WIDTH = 225
const PANEL_HEIGHT = 150
const RADIUS = 340
const PITCH = 110
const PERSPECTIVE = 1100
/** Full turns from the top panel to the bottom one, and angle of the top panel (0 = facing). */
const TURNS = 2
const START_ANGLE = -30
/**
 * Spiral rotation while the viewport center crosses the section, in degrees. Turning against the
 * winding slows down how fast the clear sides travel, so each paragraph keeps its side clear.
 */
const SCROLL_TURN = -100
/** Vertical strips per panel: each one is flat, together they bend the photo around the spiral. */
const STRIPS = 6

const ANGLE_STEP = (TURNS * 360) / (PANEL_COUNT - 1)
const STRIP_WIDTH = PANEL_WIDTH / STRIPS
const STRIP_ANGLE = (STRIP_WIDTH / RADIUS) * (180 / Math.PI)
const SPIRAL_HEIGHT = (PANEL_COUNT - 1) * PITCH + PANEL_HEIGHT

/** Length in Figma px, scaled with the section. */
const u = (px: number) => `calc(var(--u) * ${px})`

/**
 * Top offset of the `n`th height (0-based) where the spiral leaves `side` free of photos, as seen
 * while that height is at the viewport center: the panels there face the other side once the scroll
 * rotation at that moment is added. Paragraphs centered on it never sit over a photo while read.
 */
export function spiralClearSide(side: "left" | "right", n: number) {
  // Angle of the panels at the viewport center: START_ANGLE + winding * (y - PANEL_HEIGHT / 2)
  // from the spiral, plus SCROLL_TURN * y / SPIRAL_HEIGHT from the scroll. Solved for y.
  const facing = side === "left" ? 90 : 270
  const winding = ANGLE_STEP / PITCH
  const y =
    (facing + 360 * n - START_ANGLE + (winding * PANEL_HEIGHT) / 2) /
    (winding + SCROLL_TURN / SPIRAL_HEIGHT)
  return u(y)
}

/**
 * Decorative 3D spiral of club photos (Figma About Us). Server Component: the panels are static,
 * only their rotation runs on the client (`SpiralScroll`).
 */
export function PhotoSpiral({ className }: { className?: string }) {
  return (
    <SpiralScroll
      turn={SCROLL_TURN}
      className={className}
      style={{ height: u(SPIRAL_HEIGHT), perspective: u(PERSPECTIVE) }}
    >
      {Array.from({ length: PANEL_COUNT }, (_, panel) =>
        Array.from({ length: STRIPS }, (_, strip) => (
          <Strip key={`${panel}-${strip}`} panel={panel} strip={strip} />
        )),
      )}
    </SpiralScroll>
  )
}

function Strip({ panel, strip }: { panel: number; strip: number }) {
  const angle = START_ANGLE + panel * ANGLE_STEP + (strip - (STRIPS - 1) / 2) * STRIP_ANGLE

  return (
    <div
      className="absolute bg-foreground bg-no-repeat"
      style={{
        top: u(panel * PITCH),
        // 1px wider than the arc so neighbouring strips overlap without seams.
        width: u(STRIP_WIDTH + 1),
        height: u(PANEL_HEIGHT),
        marginLeft: u(-(STRIP_WIDTH + 1) / 2),
        transform: `rotateY(${angle}deg) translateZ(${u(RADIUS)})`,
        backgroundImage: `url(${ABOUT_PHOTOS[panel]})`,
        backgroundSize: `${STRIPS * 100}% 100%`,
        backgroundPosition: `${(strip / (STRIPS - 1)) * 100}% 0`,
      }}
    />
  )
}
