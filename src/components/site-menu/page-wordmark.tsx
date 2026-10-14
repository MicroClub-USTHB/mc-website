"use client"

import Link from "next/link"

import { useMenu } from "@/components/site-menu/menu-context"
import { cn } from "@/lib/utils"

/**
 * "MICRO CLUB" wordmark next to the toggle at the top of the page. It scrolls away with the
 * page (not sticky) and stays above the open panel.
 */
export function PageWordmark({ label }: { label: string }) {
  const { wordmarkRef } = useMenu()

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
      </Link>
    </div>
  )
}
