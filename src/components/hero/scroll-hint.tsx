"use client"

import Image from "next/image"
import { useLenis } from "lenis/react"

import { homeSections } from "@/config/site"
import { cn } from "@/lib/utils"
import mouse from "@/assets/hero/headline/mouse.svg"

/** The section after the hero. */
const NEXT_SECTION = homeSections[1]

/**
 * Figma "SCROLL DOWN" hint, at the bottom centre of the hero view: a mouse that gently bobs. A
 * click scrolls to the next section, so the canvas never hides the rest of the page.
 */
export function ScrollHint({ className }: { className?: string }) {
  const lenis = useLenis()

  return (
    <a
      href={`#${NEXT_SECTION.id}`}
      onClick={(event) => {
        if (!lenis) return
        event.preventDefault()
        lenis.scrollTo(`#${NEXT_SECTION.id}`)
      }}
      aria-label={`Scroll down to ${NEXT_SECTION.label}`}
      className={cn(
        "flex w-[100px] flex-col items-center gap-1 rounded-md text-center paragraph-sm text-muted-foreground opacity-50 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-secondary",
        className,
      )}
    >
      {/* CSS keyframes on `translate`: runs on the compositor, no JavaScript per frame. */}
      <span
        aria-hidden
        className="grid size-6 animate-[scroll-hint-bob_1.6s_ease-in-out_infinite] place-items-center motion-reduce:animate-none"
      >
        <Image src={mouse} alt="" unoptimized className="h-[21.89px] w-[14.23px] max-w-none" />
      </span>
      SCROLL DOWN
    </a>
  )
}
