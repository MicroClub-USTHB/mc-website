"use client"

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react"
import { useLenis } from "lenis/react"
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  type MotionValue,
} from "motion/react"

import { EASE_IN_OUT_QUART, EASE_OUT_QUART } from "@/lib/easing"

/** Menu reveal timings, like wondermake.xyz: wipe in from the left, wipe back out to it. */
const OPEN_TRANSITION = { duration: 0.65, ease: EASE_IN_OUT_QUART }
const CLOSE_TRANSITION = { duration: 0.5, ease: EASE_OUT_QUART }

type MenuContextValue = {
  open: boolean
  toggle: () => void
  /** Closes the menu and scrolls to `target` (`immediate` jumps instead of smooth scrolling). */
  navigateTo: (target: string | number, options?: { immediate?: boolean }) => void
  /** Whether the panel (and the bar over it) uses the dark tokens: the inverse of the section behind the toggle. */
  dark: boolean
  /** Whether the in-page wordmark is still level with the fixed toggle. */
  attached: boolean
  /** 0 = closed, 1 = open. Drives the panel wipe and the menu wordmark with the same edge. */
  reveal: MotionValue<number>
  toggleRef: RefObject<HTMLButtonElement | null>
  wordmarkRef: RefObject<HTMLAnchorElement | null>
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function useMenu() {
  const menu = useContext(MenuContext)
  if (!menu) throw new Error("useMenu must be used inside <MenuProvider>")
  return menu
}

/**
 * Menu state, rendered as the site `<header>`. Its children stay Server Components, so the
 * logo and navigation links are part of the server-rendered HTML.
 */
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const lenis = useLenis()
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wordmarkRef = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const [attached, setAttached] = useState(true)
  const [dark, setDark] = useState(false)
  const reveal = useMotionValue(0)

  // The in-page wordmark stays attached until its bottom edge scrolls past the toggle's top edge.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", () => {
    const wordmark = wordmarkRef.current
    const toggle = toggleRef.current
    if (!wordmark || !toggle) return
    const next = wordmark.getBoundingClientRect().bottom > toggle.getBoundingClientRect().top
    if (next !== attached) setAttached(next)
  })

  useEffect(() => {
    const controls = animate(reveal, open ? 1 : 0, open ? OPEN_TRANSITION : CLOSE_TRANSITION)
    return () => controls.stop()
  }, [open, reveal])

  // While open: lock page scroll, close on Escape, keep keyboard focus inside the header.
  useEffect(() => {
    if (!open) return
    lenis?.stop()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (event.key === "Tab") trapFocus(event, headerRef.current)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      lenis?.start()
    }
  }, [open, lenis])

  const value: MenuContextValue = {
    open,
    toggle: () => {
      // Opens inverted: dark over a light section, light over a dark one. Kept while it closes.
      if (!open) setDark(!isDarkBehind(toggleRef.current))
      setOpen(!open)
    },
    navigateTo: (target, { immediate = false } = {}) => {
      setOpen(false)
      lenis?.start()
      lenis?.scrollTo(target, { immediate })
    },
    dark,
    attached,
    reveal,
    toggleRef,
    wordmarkRef,
  }

  return (
    <MenuContext value={value}>
      <header ref={headerRef}>{children}</header>
    </MenuContext>
  )
}

/** Whether the page content behind `toggle` (not the header itself) sits in a dark-themed section. */
function isDarkBehind(toggle: HTMLElement | null) {
  if (!toggle) return false
  const { left, top, width, height } = toggle.getBoundingClientRect()
  const header = toggle.closest("header")
  const behind = document
    .elementsFromPoint(left + width / 2, top + height / 2)
    .find((el) => !header?.contains(el))
  return !!behind?.closest(".dark")
}

/** Keeps Tab / Shift+Tab cycling inside `container`. */
function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return
  const focusables = container.querySelectorAll<HTMLElement>(
    "a[href]:not([tabindex='-1']), button:not([disabled])",
  )
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
