import { cn } from "@/lib/utils"

const glyph =
  "absolute -top-[0.39437rem] font-heading text-[1.633rem] leading-[2.17731rem] font-medium text-primary-foreground"
/** One loop of the face: 12 frames of 420ms (see the `microbot-*` keyframes in globals.css). */
const loop =
  "[animation-duration:5.04s] [animation-iteration-count:infinite] [animation-timing-function:step-end] motion-reduce:animate-none"

/**
 * Glassy terminal screen of Micro Bot, the face of the launcher (Figma "Expressions" variants:
 * `>`, `>▬`, `>_`, `>_▬` and the `>_<` wink), typing then blinking in a 5.04s loop (12 frames of
 * 420ms, see the `microbot-*` keyframes in globals.css). Pure CSS, so it
 * never re-renders React and pauses with the tab. With reduced motion it stays on `>_▬`, the
 * base visibility of each glyph.
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
      {/* `>` before the underscore appears, then shifted left once it does. */}
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[0.40563rem] animate-[microbot-prompt_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          glyph,
          loop,
          "left-1.25 animate-[microbot-underscore_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          loop,
          "absolute top-5.5 left-5 h-0.5 w-[0.92781rem] animate-[microbot-underscore_5.04s_step-end_infinite] bg-primary-foreground",
        )}
      />
      <span
        className={cn(
          loop,
          "invisible absolute top-[1.01625rem] left-[1.34312rem] h-2.5 w-[0.92781rem] animate-[microbot-prompt-block_5.04s_step-end_infinite] bg-primary-foreground",
        )}
      />
      <span
        className={cn(
          loop,
          "absolute top-[1.01625rem] left-[2.34375rem] h-2.5 w-[0.92781rem] animate-[microbot-underscore-block_5.04s_step-end_infinite] bg-primary-foreground",
        )}
      />
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[2.34375rem] animate-[microbot-wink_5.04s_step-end_infinite]",
        )}
      >
        {"<"}
      </span>
    </div>
  )
}
