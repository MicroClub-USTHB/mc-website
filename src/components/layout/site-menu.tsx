"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLenis } from "lenis/react"
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react"

import { MenuLink } from "@/components/layout/menu-link"
import { MenuToggleIcon } from "@/components/layout/menu-toggle-icon"
import { menuLinks, siteConfig } from "@/config/site"
import { EASE_IN_OUT_QUART, EASE_OUT_QUART } from "@/lib/easing"
import { cn } from "@/lib/utils"

/** Menu reveal timings, like wondermake.xyz: wipe in from the left, wipe back out to it. */
const OPEN_TRANSITION = { duration: 0.65, ease: EASE_IN_OUT_QUART }
const CLOSE_TRANSITION = { duration: 0.5, ease: EASE_OUT_QUART }

/** Square cells of the bar: Figma 85 px on desktop. */
const CELL = "size-14 lg:size-[85px]"

/** Bar origin: Figma x80 / y96 on desktop. */
const BAR_POSITION = "top-4 left-4 lg:top-24 lg:left-20"

/**
 * Fixed logo cell: no width while the in-page wordmark is attached to the toggle, then the MC
 * mark (anchored right) slides out from behind the toggle while the cell widens.
 */
const LOGO_CELL = cn(
  "relative h-14 w-0 overflow-hidden bg-foreground outline-none lg:h-[85px] lg:w-0",
  "transition-[width] duration-800 ease-out-expo",
  "group-data-[logo=compact]:w-14 lg:group-data-[logo=compact]:w-[85px]",
)

const LOGO_MARK = "absolute top-[27%] right-[17.6%] h-auto w-[65%] max-w-none lg:w-[55px]"

/** "MICRO CLUB" wordmark shown over the logo cell while the menu is open. */
const MENU_WORDMARK =
  "pointer-events-none absolute top-0 left-14 flex h-14 w-42 items-center bg-foreground pl-3 text-background lg:left-[85px] lg:h-[85px] lg:w-[255px] lg:pl-[18px]"

/** "MICRO CLUB" text style (Figma header-md medium). */
const WORDMARK_TEXT = "header-xs font-medium whitespace-nowrap uppercase lg:header-md"

/**
 * Hamburger menu (Figma "Menu Bar"), like wondermake.xyz:
 * - a "MICRO CLUB" wordmark sits in the page next to the toggle and scrolls away with it,
 * - once it leaves the viewport, a compact MC mark slides out from behind the fixed toggle,
 * - the toggle opens a full-screen panel of section links that wipes in from the left; one
 *   shared `reveal` value drives the panel wipe and the "MICRO CLUB" wordmark over the mark, so
 *   both are revealed by the exact same edge.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wordmarkRef = useRef<HTMLAnchorElement>(null)
  const menuWordmarkRef = useRef<HTMLSpanElement>(null)

  // The in-page wordmark counts as attached while any part of it is still level with the fixed
  // toggle, i.e. until its bottom edge scrolls past the toggle's top edge.
  const [attached, setAttached] = useState(true)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", () => {
    const wordmarkEl = wordmarkRef.current
    const toggleEl = toggleRef.current
    if (!wordmarkEl || !toggleEl) return
    const next = wordmarkEl.getBoundingClientRect().bottom > toggleEl.getBoundingClientRect().top
    if (next !== attached) setAttached(next)
  })

  // 0 = closed, 1 = open. The panel and the menu wordmark are clipped by the same viewport edge.
  const reveal = useMotionValue(0)
  useEffect(() => {
    const controls = animate(reveal, open ? 1 : 0, open ? OPEN_TRANSITION : CLOSE_TRANSITION)
    return () => controls.stop()
  }, [open, reveal])

  const panelClip = useTransform(reveal, (r) => `inset(0 ${(1 - r) * 100}% 0 0)`)
  const panelVisibility = useTransform(reveal, (r) => (r === 0 ? "hidden" : "visible"))
  const menuWordmarkClip = useTransform(reveal, (r) => {
    const el = menuWordmarkRef.current
    if (!el) return "inset(0 100% 0 0)"
    const { left, width } = el.getBoundingClientRect()
    const edge = r * document.documentElement.clientWidth
    return `inset(0 ${Math.min(width, Math.max(0, left + width - edge))}px 0 0)`
  })

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

  /**
   * Closes the menu and scrolls to `target`. Menu links jump instantly (`immediate`) while the
   * panel still covers the page, so the closing wipe reveals the section directly.
   */
  function navigateTo(target: string | number, { immediate = false } = {}) {
    setOpen(false)
    lenis?.start()
    lenis?.scrollTo(target, { immediate })
  }

  return (
    <div ref={rootRef}>
      {/* In-page wordmark: scrolls away with the page (not sticky), stays above the open panel. */}
      <div className="absolute inset-x-0 top-0 z-50 mx-auto max-w-site">
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
              className={LOGO_MARK}
            />
          </Link>

          {!attached && (
            <motion.span
              ref={menuWordmarkRef}
              aria-hidden
              style={{ clipPath: menuWordmarkClip }}
              className={cn(MENU_WORDMARK, WORDMARK_TEXT)}
            >
              MICRO CLUB
            </motion.span>
          )}
        </div>
      </header>

      <motion.nav
        id="site-menu-panel"
        aria-label="Main"
        inert={!open}
        style={{ clipPath: panelClip, visibility: panelVisibility }}
        data-lenis-prevent
        className="fixed inset-0 z-40 overflow-y-auto bg-background will-change-[clip-path]"
      >
        <ul className="mx-auto max-w-site px-4 pt-18 pb-10 lg:px-20 lg:pt-[181px]">
          {menuLinks.map((link) => (
            <li key={link.id}>
              <MenuLink
                href={`/#${link.id}`}
                onNavigate={() => navigateTo(`#${link.id}`, { immediate: true })}
              >
                {link.label}
              </MenuLink>
            </li>
          ))}
        </ul>
      </motion.nav>
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
