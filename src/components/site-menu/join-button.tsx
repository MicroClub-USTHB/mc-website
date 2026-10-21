"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRightIcon, RocketIcon } from "lucide-react"

import { siteRoutes } from "@/config/site"

/**
 * "JOIN NOW" button at the right end of the header bar, like "GET STARTED" on wondermake.xyz: it is
 * as tall as the toggle, bordered like it, and scrolls away with the page (not sticky). On hover or
 * focus the box lifts with a hard shadow, an arrow slides in on the left, pushing the label, and
 * the rocket takes off. Hidden on the registrations page itself. Stays under the open menu panel.
 */
export function JoinButton() {
  const pathname = usePathname()
  if (pathname === siteRoutes.registrations) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto max-w-site">
      <Link
        href={siteRoutes.registrations}
        className={[
          "group pointer-events-auto absolute top-(--menu-top) right-(--menu-left)",
          "flex h-(--menu-size) min-w-[calc(var(--menu-size)*2.25)] items-center justify-between gap-3 bg-background px-[calc(var(--menu-size)*0.27)] text-foreground ring-1 ring-border outline-none max-sm:justify-center",
          "transition-[transform,box-shadow,background-color] duration-400 ease-out-expo",
          "hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_0_var(--foreground)]",
          "focus-visible:translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[-4px_4px_0_0_var(--foreground)] focus-visible:ring-foreground",
          "motion-reduce:transition-none motion-reduce:hover:translate-0 motion-reduce:focus-visible:translate-0",
        ].join(" ")}
      >
        <ArrowRightIcon
          aria-hidden
          strokeWidth={2.5}
          className="absolute left-[calc(var(--menu-size)*0.27)] size-4 -translate-x-2 opacity-0 transition-[opacity,translate] duration-400 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        />
        <span className="font-heading text-[length:clamp(0.6875rem,calc(var(--menu-size)*0.1875),1rem)] leading-6 font-bold tracking-[0.1em] whitespace-nowrap uppercase transition-transform duration-400 ease-out-expo group-hover:translate-x-6 group-focus-visible:translate-x-6">
          Join now
        </span>
        <RocketIcon
          aria-hidden
          className="size-5 shrink-0 transition-transform duration-400 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-12 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:rotate-12 max-sm:hidden"
        />
      </Link>
    </div>
  )
}
