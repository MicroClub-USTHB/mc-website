"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLenis } from "lenis/react"
import { AnimatePresence, motion, useInView } from "motion/react"

import { MenuLink } from "@/components/layout/menu-link"
import { MenuToggleIcon } from "@/components/layout/menu-toggle-icon"
import { menuLinks, siteConfig } from "@/config/site"
import { EASE_IN_OUT_QUART, EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/** Panel wipe from the left edge (open) and back to it (close), like wondermake.xyz. */
const WIPE = {
  closed: { clipPath: "inset(0 100% 0 0)" },
  open: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.65, ease: EASE_IN_OUT_QUART } },
  exit: { clipPath: "inset(0 100% 0 0)", transition: { duration: 0.5, ease: EASE_OUT_QUART } },
}

/** Square cells of the bar: Figma 85 px on desktop. */
const CELL = "size-14 lg:size-[85px]"

/** Bar origin: Figma x80 / y96 on desktop. */
const BAR_POSITION = "top-4 left-4 lg:top-24 lg:left-20"

/**
 * Fixed logo cell, driven by `data-logo` on the bar:
 * - hidden: no width (the in-page wordmark is visible instead),
 * - compact: MC mark, sliding out from behind the toggle; widens to the wordmark on hover,
 * - expanded: "MICRO CLUB" wordmark (menu open).
 */
const LOGO_CELL = cn(
  "relative h-14 w-0 overflow-hidden bg-foreground text-background outline-none lg:h-[85px] lg:w-0",
  "transition-[width] duration-800 ease-out-expo",
  "group-data-[logo=compact]:w-14 lg:group-data-[logo=compact]:w-[85px]",
  "group-data-[logo=compact]:group-hover:w-42 lg:group-data-[logo=compact]:group-hover:w-[255px]",
  "group-data-[logo=compact]:group-focus-within:w-42 lg:group-data-[logo=compact]:group-focus-within:w-[255px]",
  "group-data-[logo=expanded]:w-42 lg:group-data-[logo=expanded]:w-[255px]",
)

/** MC mark: anchored right so it slides out from behind the toggle while the cell widens. */
const LOGO_MARK = cn(
  "absolute top-[27%] right-[17.6%] h-auto w-[65%] max-w-none opacity-0 lg:w-[55px]",
  "transition-opacity duration-400 ease-out-expo",
  "group-data-[logo=compact]:opacity-100 group-data-[logo=compact]:group-focus-within:opacity-0 group-data-[logo=compact]:group-hover:opacity-0",
)

/** "MICRO CLUB" wordmark: fades in from the left when the cell is wide. */
const LOGO_WORDMARK = cn(
  "absolute inset-y-0 left-3 flex -translate-x-4 items-center opacity-0 lg:left-[18px]",
  "transition duration-600 ease-out-expo",
  "group-data-[logo=expanded]:translate-x-0 group-data-[logo=expanded]:opacity-100",
  "group-data-[logo=compact]:group-hover:translate-x-0 group-data-[logo=compact]:group-hover:opacity-100",
  "group-data-[logo=compact]:group-focus-within:translate-x-0 group-data-[logo=compact]:group-focus-within:opacity-100",
)

/** "MICRO CLUB" text style (Figma header-md medium). */
const WORDMARK_TEXT = "header-xs font-medium whitespace-nowrap uppercase lg:header-md"

/**
 * Hamburger menu (Figma "Menu Bar"), like wondermake.xyz:
 * - a "MICRO CLUB" wordmark sits in the page next to the toggle and scrolls away with it,
 * - once it leaves the viewport, a compact MC mark slides out from behind the fixed toggle,
 * - the toggle opens a full-screen panel of section links that wipes in from the left.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wordmarkRef = useRef<HTMLAnchorElement>(null)
  const wordmarkInView = useInView(wordmarkRef, { initial: true })
  const logo = open ? "expanded" : wordmarkInView ? "hidden" : "compact"

  // While open: lock page scroll, close on Escape, keep keyboard focus inside the menu.
  useEffect(() => {
    if (!open) return
    lenis?.stop()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (event.key === "Tab") trapFocus(event, rootRef.current)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      lenis?.start()
    }
  }, [open, lenis])

  function navigateTo(target: string | number) {
    setOpen(false)
    lenis?.start()
    lenis?.scrollTo(target)
  }

  return (
    <div ref={rootRef}>
      {/* In-page wordmark: scrolls away with the page (not sticky). */}
      <div className="absolute inset-x-0 top-0 mx-auto max-w-site">
        <Link
          ref={wordmarkRef}
          href="/"
          aria-label={`${siteConfig.name} home`}
          className={cn(
            BAR_POSITION,
            "absolute flex h-14 w-42 translate-x-14 items-center bg-foreground pl-3 text-background ring-1 ring-border lg:h-[85px] lg:w-[255px] lg:translate-x-[85px] lg:pl-[18px]",
            WORDMARK_TEXT,
          )}
        >
          MICRO CLUB
        </Link>
      </div>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
        <div
          data-open={open || undefined}
          data-logo={logo}
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
            onClick={() => setOpen((value) => !value)}
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
            aria-label={`${siteConfig.name} home`}
            aria-hidden={logo === "hidden" || undefined}
            tabIndex={logo === "hidden" ? -1 : undefined}
            onClick={(event) => {
              event.preventDefault()
              navigateTo(0)
            }}
            className={LOGO_CELL}
          >
            <Image src="/brand/mc-logo.svg" alt="" width={55} height={39} className={LOGO_MARK} />
            <span className={cn(LOGO_WORDMARK, WORDMARK_TEXT)}>MICRO CLUB</span>
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu-panel"
            aria-label="Main"
            variants={WIPE}
            initial="closed"
            animate="open"
            exit="exit"
            data-lenis-prevent
            className="fixed inset-0 z-40 overflow-y-auto bg-background will-change-[clip-path]"
          >
            <ul className="mx-auto max-w-site px-4 pt-18 pb-10 lg:px-20 lg:pt-[181px]">
              {menuLinks.map((link) => (
                <li key={link.id}>
                  <MenuLink href={`/#${link.id}`} onNavigate={() => navigateTo(`#${link.id}`)}>
                    {link.label}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Keeps Tab / Shift+Tab cycling inside `container`. */
function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return
  const focusables = container.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
