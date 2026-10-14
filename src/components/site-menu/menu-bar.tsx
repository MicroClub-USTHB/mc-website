"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"
import { MenuToggleIcon } from "@/components/site-menu/menu-toggle-icon"
import { useWipeClip } from "@/components/site-menu/use-wipe-clip"
import { cn } from "@/lib/utils"

/**
 * Logo cell: no width while the in-page wordmark is attached to the toggle, then the MC mark
 * (anchored right) slides out from behind the toggle while the cell widens.
 */
const LOGO_CELL = cn(
  "relative h-(--menu-size) w-0 overflow-hidden bg-foreground outline-none",
  "transition-[width] duration-800 ease-out-expo",
  "group-data-[logo=compact]:w-(--menu-size)",
)

/**
 * Fixed bar: menu toggle + compact logo. While the menu is open, a "MICRO CLUB" wordmark covers
 * the logo, clipped by the same viewport edge as the panel wipe.
 */
export function MenuBar({ homeLabel }: { homeLabel: string }) {
  const { open, dark, toggle, navigateTo, attached, toggleRef } = useMenu()
  const darkToggleRef = useRef<HTMLSpanElement>(null)
  const darkToggleClip = useWipeClip(darkToggleRef)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      <div
        data-open={open || undefined}
        data-logo={attached ? "hidden" : "compact"}
        className={cn(
          "top-(--menu-top) left-(--menu-left)",
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
            "size-(--menu-size)",
            "group/toggle relative z-10 grid cursor-pointer place-items-center bg-background text-foreground transition-colors duration-300 outline-none",
            "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
          )}
        >
          <MenuToggleIcon className="size-(--menu-icon)" />
          {/* Dark-theme copy, wiped in with the panel so the icon never changes before it. */}
          {dark && (
            <motion.span
              ref={darkToggleRef}
              aria-hidden
              style={{ clipPath: darkToggleClip }}
              className="dark pointer-events-none absolute inset-0 grid place-items-center bg-background text-foreground transition-colors duration-300 group-hover/toggle:bg-accent group-hover/toggle:text-accent-foreground"
            >
              <MenuToggleIcon className="size-(--menu-icon)" />
            </motion.span>
          )}
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
            className="absolute top-[27%] right-[17.6%] h-auto w-[65%] max-w-none"
          />
        </Link>

        {!attached && <MenuWordmark />}
      </div>
    </div>
  )
}

/** "MICRO CLUB" over the logo cell, revealed by the panel's wipe edge. */
function MenuWordmark() {
  const { dark } = useMenu()
  const ref = useRef<HTMLSpanElement>(null)
  const clipPath = useWipeClip(ref)

  return (
    <motion.span
      ref={ref}
      aria-hidden
      style={{ clipPath }}
      className={cn(
        dark && "dark",
        "flex h-(--menu-size) w-[calc(var(--menu-size)*3)] items-center bg-foreground pl-[calc(var(--menu-size)*0.2)] text-background",
        "font-heading text-(length:--menu-text) leading-[1.22] font-medium tracking-[-0.02em] whitespace-nowrap uppercase",
        "pointer-events-none absolute top-0 left-(--menu-size)",
      )}
    >
      MICRO CLUB
    </motion.span>
  )
}
