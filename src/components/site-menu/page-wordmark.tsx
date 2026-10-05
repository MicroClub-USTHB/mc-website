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
          "top-4 left-4 lg:top-24 lg:left-20",
          "flex h-14 w-42 items-center bg-foreground pl-3 text-background lg:h-[85px] lg:w-[255px] lg:pl-[18px]",
          "header-xs font-medium whitespace-nowrap uppercase lg:header-md",
          "absolute translate-x-14 ring-1 ring-border lg:translate-x-[85px]",
        )}
      >
        MICRO CLUB
      </Link>
    </div>
  )
}
