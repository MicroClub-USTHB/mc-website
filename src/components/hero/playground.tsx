import { PlaygroundBoard } from "@/components/hero/playground-board"
import { PLAYGROUND_VIEWS } from "@/components/hero/playground-items"
import { PLAYGROUND, PLAYGROUND_BODIES } from "@/const/playground"

/**
 * Figma "lwasmo": tools and skills badges piled at the bottom of the canvas, which can be dragged
 * and thrown, and an input that drops a box with your message from the sky (see
 * `PlaygroundBoard`). Server Component: the pile is static markup at its Figma positions, the
 * client island only moves it once it is touched.
 */
export function Playground() {
  return (
    <PlaygroundBoard>
      {PLAYGROUND_BODIES.map(({ id, x, y, width, height }) => (
        <div
          key={id}
          aria-hidden
          data-body
          className="pointer-events-auto absolute will-change-transform"
          style={{ left: x, top: y + PLAYGROUND.sky, width, height }}
        >
          {PLAYGROUND_VIEWS[id]}
        </div>
      ))}
    </PlaygroundBoard>
  )
}
