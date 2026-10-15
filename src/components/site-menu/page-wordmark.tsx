"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"
import { useWipeClip } from "@/components/site-menu/use-wipe-clip"
import { cn } from "@/lib/utils"

/**
 * "MICRO CLUB" wordmark next to the toggle at the top of the page. It scrolls away with the
 * page (not sticky) and stays above the open panel.
 */
export function PageWordmark({ label }: { label: string }) {
  const { wordmarkRef, dark } = useMenu()
  const darkRef = useRef<HTMLSpanElement>(null)
  const darkClip = useWipeClip(darkRef)

  return (
    <div className="absolute inset-x-0 top-0 z-50 mx-auto max-w-site">
      <Link
        ref={wordmarkRef}
        href="/"
        aria-label={label}
        className={cn(
          "top-(--menu-top) left-(--menu-left)",
          "flex h-(--menu-size) w-[calc(var(--menu-size)*3)] items-center bg-foreground pl-[calc(var(--menu-size)*0.2)] text-background",
          "font-heading text-(length:--menu-text) leading-[1.22] font-medium tracking-[-0.02em] whitespace-nowrap uppercase",
          "absolute translate-x-(--menu-size) ring-1 ring-border",
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
  )
}
