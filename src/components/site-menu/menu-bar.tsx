"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"
import { MenuToggleIcon } from "@/components/site-menu/menu-toggle-icon"
import { useWipeClip } from "@/components/site-menu/use-wipe-clip"
import { cn } from "@/lib/utils"

/**
 * Logo cell: no width while the in-page wordmark is attached to the toggle, then the navy cell
 * widens from behind the toggle. The MC mark is placed by the final cell size, so it stays still
 * and is uncovered by the widening cell instead of sliding with it.
 */
const LOGO_CELL = cn(
  "relative h-(--menu-size) w-0 overflow-hidden bg-foreground outline-none",
  "transition-[width] duration-800 ease-out-expo",
  "group-data-[logo=compact]:w-(--menu-size)",
)

/** ms: the logo folds before the bar slides aside, and unfolds once it has slid back. */
const FOLD_DELAY = 300

/**
 * The bar, positioned from the width of its wrapper (a container, so without the scrollbar).
 * Docked, it sits in the middle of the left margin, the space outside the section titles (`gutter`
 * is the sections' side padding, `edge` what the screen has beyond the site width). The toggle is
 * wider than that margin around 1440px, so it shrinks to fit, down to its 48px minimum. It only
 * docks from `lg`: below, the margin is too narrow for it and the titles rest below the bar
 * (`pt-below-menu`).
 */
const BAR = cn(
  "[--menu-gutter:1rem] sm:[--menu-gutter:1.5rem] lg:[--menu-gutter:5rem]",
  "[--menu-edge:max(0px,(100cqw-90rem)/2)]",
  "[--menu-margin:calc(var(--menu-edge)+var(--menu-gutter))]",
  "[--menu-docked:clamp(3rem,calc(var(--menu-margin)-0.5rem),var(--menu-size))]",
  "top-(--menu-top) left-[calc(var(--menu-edge)+var(--menu-left))]",
  "origin-left transition-[left,scale] duration-500 ease-out-quart motion-reduce:transition-none",
  "data-docked:left-[max(0.25rem,calc((var(--menu-margin)-var(--menu-docked))/2))]",
  "data-docked:scale-[tan(atan2(var(--menu-docked),var(--menu-size)))] data-docked:delay-300",
  "group pointer-events-auto absolute flex ring-1 ring-border",
)

/**
 * Fixed bar: menu toggle + compact logo. While the menu is open, a "MICRO CLUB" wordmark covers
 * the logo, clipped by the same viewport edge as the panel wipe. When a section title reaches it
 * (`docked`), the logo folds into the toggle, then the toggle slides out of the title's way.
 */
export function MenuBar({ homeLabel }: { homeLabel: string }) {
  const { open, dark, toggle, navigateTo, attached, docked, toggleRef } = useMenu()
  const darkToggleRef = useRef<HTMLSpanElement>(null)
  const darkToggleClip = useWipeClip(darkToggleRef)
  const [folded, setFolded] = useState(false)
  const logoHidden = attached || folded

  useEffect(() => {
    const timer = setTimeout(() => setFolded(docked), docked ? 0 : FOLD_DELAY)
    return () => clearTimeout(timer)
  }, [docked])

  return (
    <div className="@container pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        data-open={open || undefined}
        data-docked={docked || undefined}
        data-logo={logoHidden ? "hidden" : "compact"}
        className={BAR}
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
          aria-hidden={logoHidden || undefined}
          tabIndex={logoHidden ? -1 : undefined}
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
            className="absolute top-[27%] left-[calc(var(--menu-size)*0.174)] h-auto w-[calc(var(--menu-size)*0.65)] max-w-none"
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
  const clipPath = useWipeClip(ref, 1)

  return (
    // The ring stays in the light theme, like the toggle's, so both borders match over any panel.
    <motion.span
      ref={ref}
      aria-hidden
      style={{ clipPath }}
      className="pointer-events-none absolute top-0 left-(--menu-size) h-(--menu-size) w-[calc(var(--menu-size)*3)] ring-1 ring-border"
    >
      <span
        className={cn(
          dark && "dark",
          "flex size-full items-center bg-foreground pl-[calc(var(--menu-size)*0.2)] text-background",
          "font-heading text-(length:--menu-text) leading-[1.22] font-medium tracking-[-0.02em] whitespace-nowrap uppercase",
        )}
      >
        MICRO CLUB
      </span>
    </motion.span>
  )
}
