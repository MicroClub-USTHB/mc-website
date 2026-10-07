"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, type MotionStyle } from "motion/react"

/**
 * Paragraph typed in character by character as it scrolls into view. The scroll progress is a
 * single `--reveal` CSS variable; each character derives its opacity from it and its position
 * `--i`, so no per-character JS runs while scrolling. Screen readers get the plain text.
 */
type RevealTextProps = {
  text: string
  className?: string
  style?: React.CSSProperties
}

export function RevealText({ text, className, style }: RevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] })
  const chars = Array.from(text)

  return (
    <motion.p
      ref={ref}
      style={{ ...style, "--reveal": reduceMotion ? 1 : scrollYProgress } as MotionStyle}
      className={className}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {chars.map((char, i) => (
          <span
            key={i}
            style={{ "--i": i / chars.length } as React.CSSProperties}
            // Fades over the next 10% of the text: 0 before `--reveal` reaches it, 1 once past.
            className="opacity-[clamp(0,calc((var(--reveal)*1.1_-_var(--i))*10),1)]"
          >
            {char}
          </span>
        ))}
      </span>
    </motion.p>
  )
}
