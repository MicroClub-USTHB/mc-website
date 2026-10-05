"use client"

import Link from "next/link"

import { useMenu } from "@/components/layout/site-menu/menu-context"
import { BAR_POSITION, WORDMARK_BOX, WORDMARK_TEXT } from "@/components/layout/site-menu/styles"
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
          BAR_POSITION,
          WORDMARK_BOX,
          WORDMARK_TEXT,
          "absolute translate-x-14 ring-1 ring-border lg:translate-x-[85px]",
        )}
      >
        MICRO CLUB
      </Link>
    </div>
  )
}
