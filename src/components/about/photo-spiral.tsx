import { SpiralScroll } from "@/components/about/spiral-scroll"
import { ABOUT_PHOTOS } from "@/const/about"

/**
 * Spiral geometry in px of the 1440px Figma frame. Horizontal sizes (panels, radius, perspective)
 * are scaled by the `--u` length set by the section, so the spiral fits narrow screens. Vertical
 * spacing is not: it keeps the clear sides tall enough for the paragraphs on phones too.
 * One panel per photo, 3:2 like the photos so they are not stretched.
 */
const PANEL_COUNT = ABOUT_PHOTOS.length
const PANEL_WIDTH = 225
const PANEL_HEIGHT = 150
const RADIUS = 340
const PERSPECTIVE = 1100
/** Height of the slot of each panel (panel centered in it), in unscaled px. */
const PITCH = 150
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

/** Horizontal length in Figma px, scaled with the section. */
const u = (px: number) => `calc(var(--u) * ${px})`

/**
 * Top offset of the `n`th height (0-based) where the spiral leaves `side` free of photos, as seen
 * while that height is at the viewport center: the panels there face the other side once the scroll
 * rotation at that moment is added. Paragraphs centered on it never sit over a photo while read.
 */
export function spiralClearSide(side: "left" | "right", n: number) {
  // At `slot` panel slots from the top, the panels face START_ANGLE + (slot - 0.5) * ANGLE_STEP and
  // the scroll has turned them by SCROLL_TURN * slot / PANEL_COUNT. Solved for `slot`.
  const facing = side === "left" ? 90 : 270
  const slot =
    (facing + 360 * n - START_ANGLE + ANGLE_STEP / 2) / (ANGLE_STEP + SCROLL_TURN / PANEL_COUNT)
  return `${slot * PITCH}px`
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
      style={{ height: PANEL_COUNT * PITCH, perspective: u(PERSPECTIVE) }}
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
        top: `calc(${(panel + 0.5) * PITCH}px - ${u(PANEL_HEIGHT / 2)})`,
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
