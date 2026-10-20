import { cn } from "@/lib/utils"

/** One loop of the face: 12 frames of 420ms (see the `microbot-*` keyframes in globals.css). */
const loop =
  "[animation-duration:5.04s] [animation-iteration-count:infinite] [animation-timing-function:step-end] motion-reduce:animate-none"

const glyph =
  "absolute top-[-5.85px] font-heading text-[24.214px] leading-[32.285px] font-medium whitespace-nowrap text-primary-foreground"

/** The `_` and the `▬` of the prompt (Figma lines): white bars, in px of the screen. */
const bar = "absolute bg-primary-foreground"

/**
 * Screen of Micro Bot (Figma "Expressions", 54×26.83px, over the robot image of the launcher):
 * `>`, `>▬`, `>_`, `>_▬` and the `>_<` wink, typing then blinking in a 5.04s loop (12 frames of
 * 420ms, see the `microbot-*` keyframes in globals.css). Pure CSS, so it never re-renders React and
 * pauses with the tab. With reduced motion it stays on `>_▬`, the base visibility of each part.
 * Every part is placed as in its Figma variant (the `>` moves as the line grows).
 */
export function MicroBotFace({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-[7px] left-[9px] h-[26.828px] w-[54px] overflow-clip rounded-[11.006px]",
        className,
      )}
    >
      {/* `>` and the block, before the underscore. */}
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[6.02px] animate-[microbot-prompt_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          bar,
          loop,
          "invisible top-[12.98px] left-[19.92px] h-[7.414px] w-[13.758px] animate-[microbot-prompt-block_5.04s_step-end_infinite]",
        )}
      />
      {/* `>_` */}
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[6.49px] animate-[microbot-underscore_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          bar,
          loop,
          "invisible top-[18.54px] left-[20.39px] h-[1.8535px] w-[13.758px] animate-[microbot-underscore_5.04s_step-end_infinite]",
        )}
      />
      {/* `>_▬` (the base frame) */}
      <span
        className={cn(
          glyph,
          loop,
          "left-[4.63px] animate-[microbot-underscore-block_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
      <span
        className={cn(
          bar,
          loop,
          "top-[18.54px] left-[18.53px] h-[1.8535px] w-[13.758px] animate-[microbot-underscore-block_5.04s_step-end_infinite]",
        )}
      />
      <span
        className={cn(
          bar,
          loop,
          "top-[10.44px] left-[34.76px] h-[9.2675px] w-[13.758px] animate-[microbot-underscore-block_5.04s_step-end_infinite]",
        )}
      />
      {/* The wink's `<`: the same glyph, flipped. */}
      <span
        className={cn(
          glyph,
          loop,
          "invisible left-[32.05px] -scale-x-100 animate-[microbot-wink_5.04s_step-end_infinite]",
        )}
      >
        {">"}
      </span>
    </div>
  )
}
