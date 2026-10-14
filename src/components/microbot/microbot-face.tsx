"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Expression = { underscore?: boolean; block?: boolean; wink?: boolean }

/** Figma "Expressions" variants: `>`, `>▬`, `>_`, `>_▬` and the `>_<` wink. */
const EXPRESSIONS = {
  prompt: {},
  promptBlock: { block: true },
  underscore: { underscore: true },
  underscoreBlock: { underscore: true, block: true },
  wink: { underscore: true, wink: true },
} satisfies Record<string, Expression>

/** Typing then blinking, looped. */
const SEQUENCE: Expression[] = [
  EXPRESSIONS.prompt,
  EXPRESSIONS.promptBlock,
  EXPRESSIONS.prompt,
  EXPRESSIONS.promptBlock,
  EXPRESSIONS.underscore,
  EXPRESSIONS.underscoreBlock,
  EXPRESSIONS.underscore,
  EXPRESSIONS.underscoreBlock,
  EXPRESSIONS.underscore,
  EXPRESSIONS.underscoreBlock,
  EXPRESSIONS.wink,
  EXPRESSIONS.wink,
]
const FRAME_MS = 420

const glyph =
  "absolute top-[-6.31px] font-heading text-[26.128px] leading-[34.837px] font-medium text-primary-foreground"

/** Glassy terminal screen of MicroBot, the face of the launcher. */
export function MicroBotFace({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setFrame((f) => (f + 1) % SEQUENCE.length), FRAME_MS)
    return () => clearInterval(id)
  }, [reduceMotion])

  const { underscore, block, wink }: Expression = reduceMotion
    ? EXPRESSIONS.underscoreBlock
    : SEQUENCE[frame]

  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-[5.89px] left-[5.89px] h-[28.948px] w-[58.268px] overflow-hidden rounded-[11.876px] border-[0.742px] border-primary-foreground/12 backdrop-blur-[7.794px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(40px_20px_at_50%_50%,var(--foreground),var(--secondary))] opacity-56" />
      <span className={cn(glyph, underscore ? "left-[5px]" : "left-[6.49px]")}>{">"}</span>
      {underscore && (
        <span className="absolute top-[22px] left-5 h-0.5 w-[14.845px] bg-primary-foreground" />
      )}
      {block && (
        <span
          className={cn(
            "absolute top-[16.26px] h-2.5 w-[14.845px] bg-primary-foreground",
            underscore ? "left-[37.5px]" : "left-[21.49px]",
          )}
        />
      )}
      {wink && <span className={cn(glyph, "left-[37.5px]")}>{"<"}</span>}
    </div>
  )
}
