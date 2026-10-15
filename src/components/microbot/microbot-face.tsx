import { cn } from "@/lib/utils"

const glyph =
  "absolute top-[-6.31px] font-heading text-[26.128px] leading-[34.837px] font-medium text-primary-foreground"
/** One loop of the face: 12 frames of 420ms (see the `microbot-*` keyframes in globals.css). */
const loop =
  "[animation-duration:5.04s] [animation-iteration-count:infinite] [animation-timing-function:step-end] motion-reduce:animate-none"

/**
 * Glassy terminal screen of MicroBot, the face of the launcher (Figma "Expressions" variants:
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
        "absolute top-[5.89px] left-[5.89px] h-[28.948px] w-[58.268px] overflow-hidden rounded-[11.876px] border-[0.742px] border-primary-foreground/12",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(40px_20px_at_50%_50%,var(--foreground),var(--secondary))] opacity-56" />
      {/* `>` before the underscore appears, then shifted left once it does. */}
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[6.49px] animate-[microbot-prompt_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          glyph,
          loop,
          "left-[5px] animate-[microbot-underscore_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          loop,
          "absolute top-[22px] left-5 h-0.5 w-[14.845px] animate-[microbot-underscore_5.04s_step-end_infinite] bg-primary-foreground",
        )}
      />
      <span
        className={cn(
          loop,
          "invisible absolute top-[16.26px] left-[21.49px] h-2.5 w-[14.845px] animate-[microbot-prompt-block_5.04s_step-end_infinite] bg-primary-foreground",
        )}
      />
      <span
        className={cn(
          loop,
          "absolute top-[16.26px] left-[37.5px] h-2.5 w-[14.845px] animate-[microbot-underscore-block_5.04s_step-end_infinite] bg-primary-foreground",
        )}
      />
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[37.5px] animate-[microbot-wink_5.04s_step-end_infinite]",
        )}
      >
        {"<"}
      </span>
    </div>
  )
}
