"use client"

import { useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"
import { useWipeClip } from "@/components/site-menu/use-wipe-clip"
import { isBarePage } from "@/config/site"
import { cn } from "@/lib/utils"

/**
 * "MICRO CLUB" wordmark next to the toggle, part of the hero: fixed like the hero, which stays
 * put while About scrolls over it. Once About's edge reaches the bar (`attached` turns false) it
 * folds away to the left, wiped from its right edge, while the compact logo cell widens from
 * behind the toggle: the navy block shrinks into the MC mark. Scrolling back up unfolds it.
 * Stays above the open panel.
 */
export function PageWordmark({ label }: { label: string }) {
  const { wordmarkRef, dark, attached } = useMenu()
  const darkRef = useRef<HTMLSpanElement>(null)
  const darkClip = useWipeClip(darkRef)
  const pathname = usePathname()
  if (isBarePage(pathname)) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      {/*
        Folding away: this window slides left behind the toggle while the wordmark slides right
        within it, by the same distance, so the wordmark stays put and is wiped from its right
        edge. Two opposite transforms: run by the compositor, no repaint.
      */}
      <div
        className={cn(
          "absolute top-[calc(var(--menu-top)-1px)] left-[calc(var(--menu-left)-1px)] translate-x-(--menu-size) overflow-hidden p-px",
          "pointer-events-auto transition-transform duration-800 ease-out-expo",
          !attached && "pointer-events-none -translate-x-[calc(var(--menu-size)*2+1px)]",
        )}
      >
        <Link
          ref={wordmarkRef}
          href="/"
          aria-label={label}
          aria-hidden={!attached || undefined}
          tabIndex={attached ? undefined : -1}
          className={cn(
            "relative flex h-(--menu-size) w-[calc(var(--menu-size)*3)] items-center bg-foreground pl-[calc(var(--menu-size)*0.2)] text-background",
            "font-heading text-(length:--menu-text) leading-[1.22] font-medium tracking-[-0.02em] whitespace-nowrap uppercase",
            "ring-1 ring-border transition-transform duration-800 ease-out-expo",
            !attached && "translate-x-[calc(var(--menu-size)*3+1px)]",
          )}
        >
          MICRO CLUB
          {/* Dark-theme copy, wiped in with the panel when the menu opens in the dark theme. */}
          {dark && (
            <motion.span
              ref={darkRef}
              aria-hidden
              style={{ clipPath: darkClip }}
              className="dark pointer-events-none absolute inset-0 flex items-center bg-foreground pl-[calc(var(--menu-size)*0.2)] text-background"
            >
              MICRO CLUB
            </motion.span>
          )}
        </Link>
      </div>
    </div>
  )
}
