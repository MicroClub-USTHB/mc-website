"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLenis } from "lenis/react"
import { MenuIcon, PlusIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { MenuLink } from "@/components/layout/menu-link"
import { menuLinks, siteConfig } from "@/config/site"
import { EASE_IN_OUT_QUART, EASE_OUT_QUART } from "@/lib/easing"

/** Panel wipe from the left edge (open) and back to it (close), like wondermake.xyz. */
const WIPE = {
  closed: { clipPath: "inset(0 100% 0 0)" },
  open: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.65, ease: EASE_IN_OUT_QUART } },
  exit: { clipPath: "inset(0 100% 0 0)", transition: { duration: 0.5, ease: EASE_OUT_QUART } },
}

/** Square cells of the bar: Figma 85 px on desktop. */
const CELL = "size-14 lg:size-[85px]"

/**
 * Hamburger menu (Figma "Menu Bar"): a toggle + logo bar fixed top-left and a full-screen panel
 * of section links that wipes in from the left. Hovering the bar (or opening the menu) expands
 * the logo into the "MICRO CLUB" wordmark.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

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
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
        <div
          data-open={open || undefined}
          className="group pointer-events-auto absolute top-4 left-4 flex ring-1 ring-border transition-shadow lg:top-24 lg:left-20 data-open:ring-2"
        >
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu-panel"
            onClick={() => setOpen((value) => !value)}
            className={`${CELL} relative grid place-items-center bg-background text-foreground transition-colors duration-300 outline-none group-data-open:hover:bg-accent group-data-open:hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground`}
          >
            <MenuIcon className="col-start-1 row-start-1 size-6 transition duration-500 ease-out-expo group-data-open:rotate-90 group-data-open:opacity-0 lg:size-8" />
            <PlusIcon className="col-start-1 row-start-1 size-6 -rotate-45 opacity-0 transition duration-500 ease-out-expo group-data-open:rotate-45 group-data-open:opacity-100 lg:size-8" />
          </button>

          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            onClick={(event) => {
              event.preventDefault()
              navigateTo(0)
            }}
            className="relative h-14 w-14 overflow-hidden bg-foreground text-background transition-[width] duration-600 ease-out-expo outline-none group-focus-within:w-42 group-hover:w-42 group-data-open:w-42 lg:h-[85px] lg:w-[85px] lg:group-focus-within:w-[255px] lg:group-hover:w-[255px] lg:group-data-open:w-[255px]"
          >
            <Image
              src="/brand/mc-logo.svg"
              alt=""
              width={55}
              height={39}
              priority
              className="absolute top-[27%] left-[17.6%] h-auto w-[65%] max-w-none transition duration-400 ease-out-expo group-focus-within:-translate-x-full group-focus-within:opacity-0 group-hover:-translate-x-full group-hover:opacity-0 group-data-open:-translate-x-full group-data-open:opacity-0 lg:w-[55px]"
            />
            <span className="absolute inset-y-0 left-3 flex -translate-x-4 items-center header-xs font-medium whitespace-nowrap opacity-0 transition duration-600 ease-out-expo group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 group-data-open:translate-x-0 group-data-open:opacity-100 lg:left-[18px] lg:header-md">
              MICRO CLUB
            </span>
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
