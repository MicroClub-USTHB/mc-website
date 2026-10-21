"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right"
import { useMenu } from "@/components/site-menu/menu-context"
import { siteRoutes } from "@/config/site"
import { cn } from "@/lib/utils"

/**
 * Same as the menu links: the fill grows from the edge the pointer crossed and shrinks toward the
 * edge it leaves by.
 */
function setFillOrigin(event: React.PointerEvent<HTMLAnchorElement>) {
  const { top, height } = event.currentTarget.getBoundingClientRect()
  const fromTop = event.clientY - top < height / 2
  event.currentTarget.style.setProperty("--fill-origin", fromTop ? "top" : "bottom")
}

/**
 * "JOIN NOW" cell at the right end of the fixed menu bar, the main call to action of the site.
 * It is built like the rest of the bar: a square-cornered cell as tall as the toggle with the same
 * hairline ring, the primary color (the toggle is white, the logo navy), the heading font in caps.
 * It stays on screen over every section, light or dark, since the bar does too. Hover and focus
 * flood it with the page color from the edge the pointer entered, like the menu links, and the
 * arrow plays its animation. Over the open menu in its dark theme it takes the dark tokens too.
 * Hidden on the registrations page itself.
 */
export function JoinButton() {
  const pathname = usePathname()
  const { open, dark } = useMenu()
  if (pathname === siteRoutes.registrations) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      <Link
        href={siteRoutes.registrations}
        onPointerEnter={setFillOrigin}
        onPointerLeave={setFillOrigin}
        className={cn(
          open && dark && "dark",
          "group pointer-events-auto absolute top-(--menu-top) right-(--menu-left)",
          "flex h-(--menu-size) items-center gap-[calc(var(--menu-size)*0.14)] overflow-hidden bg-primary px-[calc(var(--menu-size)*0.3)] text-primary-foreground ring-1 ring-border outline-none",
          "transition-colors duration-500",
          "focus-visible:ring-4 focus-visible:ring-ring",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 origin-(--fill-origin,bottom) scale-y-0 bg-background transition-transform duration-400 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
        />
        <span className="relative font-heading text-[length:clamp(0.75rem,calc(var(--menu-size)*0.2),1.0625rem)] leading-none font-medium tracking-[-0.01em] whitespace-nowrap uppercase transition-colors duration-150 group-hover:text-primary group-focus-visible:text-primary">
          Join now
        </span>
        <ArrowUpRightIcon
          size={20}
          className="relative transition-colors duration-150 group-hover:text-primary group-focus-visible:text-primary max-sm:hidden"
        />
      </Link>
    </div>
  )
}
