import { cn } from "@/lib/utils"

/** One shape of a face frame, in Figma px on the 54×26.828 screen. */
type Shape =
  | { kind: "prompt"; left: number }
  | { kind: "wink"; left: number }
  | { kind: "bar"; left: number; top: number; height: number }

const PROMPT_AT = (left: number): Shape => ({ kind: "prompt", left })
const BLOCK: Shape = { kind: "bar", left: 19.92, top: 12.98, height: 7.414 }
const UNDERSCORE = (left: number): Shape => ({ kind: "bar", left, top: 18.54, height: 1.854 })

const CURSOR = [PROMPT_AT(6.02), BLOCK]
const PROMPT = [PROMPT_AT(6.02)]
const TYPED = [PROMPT_AT(6.49), UNDERSCORE(20.39)]
const TYPED_CURSOR = [
  PROMPT_AT(4.63),
  UNDERSCORE(18.53),
  { kind: "bar", left: 34.76, top: 10.44, height: 9.268 } as Shape,
]
const WINK = [PROMPT_AT(6.49), UNDERSCORE(20.39), { kind: "wink", left: 32.05 } as Shape]

/**
 * Figma "Expressions", in order: `>▬`, `>`, `>▬`, `>`, `>_`, `>_▬`, `>_`, `>_▬`, `>_`, `>_▬`,
 * then the `>_<` wink. One frame every 420ms, looping.
 */
const FRAMES = [
  CURSOR,
  PROMPT,
  CURSOR,
  PROMPT,
  TYPED,
  TYPED_CURSOR,
  TYPED,
  TYPED_CURSOR,
  TYPED,
  TYPED_CURSOR,
  WINK,
]
const FRAME_MS = 420
const LOOP_MS = FRAMES.length * FRAME_MS
/** Frame shown with reduced motion: `>_▬`. */
const STILL = 5

/** The face is drawn on the Figma screen (54px wide) then scaled to the launcher screen. */
const SCALE = 58.268 / 54

const glyph = "absolute top-[-5.85px] font-heading text-[24.214px] leading-[32.285px] font-medium"

/**
 * Glassy terminal screen of Micro Bot, the face of the launcher: the 11 Figma "Expressions" frames
 * played in a loop (each frame shows during its own 420ms slot of the `microbot-frame` keyframes,
 * offset with a negative delay). Pure CSS, so it never re-renders React and pauses with the tab.
 * With reduced motion it stays on `>_▬`.
 */
export function MicroBotFace({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-[0.36812rem] left-[0.36812rem] h-[1.80925rem] w-[3.64175rem] overflow-hidden rounded-[0.74225rem] border-[0.742px] border-primary-foreground/12",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(40px_20px_at_50%_50%,var(--foreground),var(--secondary))] opacity-56" />
      <div
        className="absolute top-0 left-0 h-[26.828px] w-[54px] origin-top-left text-primary-foreground"
        style={{ scale: SCALE }}
      >
        {FRAMES.map((shapes, i) => (
          <div
            key={i}
            className={cn(
              "invisible absolute inset-0 animate-[microbot-frame_var(--loop)_step-end_infinite] motion-reduce:animate-none",
              i === STILL && "motion-reduce:visible",
            )}
            style={
              {
                "--loop": `${LOOP_MS}ms`,
                animationDelay: `${i * FRAME_MS - LOOP_MS}ms`,
              } as React.CSSProperties
            }
          >
            {shapes.map((shape, j) =>
              shape.kind === "bar" ? (
                <span
                  key={j}
                  className="absolute w-[13.758px] bg-current"
                  style={{ left: shape.left, top: shape.top, height: shape.height }}
                />
              ) : (
                <span
                  key={j}
                  className={cn(glyph, shape.kind === "wink" && "-scale-x-100")}
                  style={{ left: shape.left }}
                >
                  {">"}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
