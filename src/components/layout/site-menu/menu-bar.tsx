"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useTransform } from "motion/react"

import { useMenu } from "@/components/layout/site-menu/menu-context"
import { MenuToggleIcon } from "@/components/layout/site-menu/menu-toggle-icon"
import {
  BAR_POSITION,
  CELL,
  WORDMARK_BOX,
  WORDMARK_TEXT,
} from "@/components/layout/site-menu/styles"
import { cn } from "@/lib/utils"

/**
 * Logo cell: no width while the in-page wordmark is attached to the toggle, then the MC mark
 * (anchored right) slides out from behind the toggle while the cell widens.
 */
const LOGO_CELL = cn(
  "relative h-14 w-0 overflow-hidden bg-foreground outline-none lg:h-[85px] lg:w-0",
  "transition-[width] duration-800 ease-out-expo",
  "group-data-[logo=compact]:w-14 lg:group-data-[logo=compact]:w-[85px]",
)

/**
 * Fixed bar: menu toggle + compact logo. While the menu is open, a "MICRO CLUB" wordmark covers
 * the logo, clipped by the same viewport edge as the panel wipe.
 */
export function MenuBar({ homeLabel }: { homeLabel: string }) {
  const { open, toggle, navigateTo, attached, toggleRef } = useMenu()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      <div
        data-open={open || undefined}
        data-logo={attached ? "hidden" : "compact"}
        className={cn(
          BAR_POSITION,
          "group pointer-events-auto absolute flex ring-1 ring-border transition-shadow data-open:ring-2",
        )}
      >
        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu-panel"
          onClick={toggle}
          className={cn(
            CELL,
            "relative z-10 grid place-items-center bg-background text-foreground transition-colors duration-300 outline-none",
            "group-data-open:hover:bg-accent group-data-open:hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
          )}
        >
          <MenuToggleIcon className="size-6 lg:size-8" />
        </button>

        <Link
          href="/"
          aria-label={homeLabel}
          aria-hidden={attached || undefined}
          tabIndex={attached ? -1 : undefined}
          onClick={(event) => {
            event.preventDefault()
            navigateTo(0)
          }}
          className={LOGO_CELL}
        >
          {/* Preloaded + eager: the cell starts at 0 width, so a lazy image would only load once
              it slides in, showing an empty square first. */}
          <Image
            src="/brand/mc-logo.svg"
            alt=""
            width={55}
            height={39}
            preload
            loading="eager"
            className="absolute top-[27%] right-[17.6%] h-auto w-[65%] max-w-none lg:w-[55px]"
          />
        </Link>

        {!attached && <MenuWordmark />}
      </div>
    </div>
  )
}

/** "MICRO CLUB" over the logo cell, revealed by the panel's wipe edge. */
function MenuWordmark() {
  const { reveal } = useMenu()
  const ref = useRef<HTMLSpanElement>(null)

  const clipPath = useTransform(reveal, (progress) => {
    const el = ref.current
    if (!el) return "inset(0 100% 0 0)"
    const { left, width } = el.getBoundingClientRect()
    const edge = progress * document.documentElement.clientWidth
    const hidden = Math.min(width, Math.max(0, left + width - edge))
    return `inset(0 ${hidden}px 0 0)`
  })

  return (
    <motion.span
      ref={ref}
      aria-hidden
      style={{ clipPath }}
      className={cn(
        WORDMARK_BOX,
        WORDMARK_TEXT,
        "pointer-events-none absolute top-0 left-14 lg:left-[85px]",
      )}
    >
      MICRO CLUB
    </motion.span>
  )
}
