"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/** Links under the header bar, between the pages of the signed-in role. */
export function AdminNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin pages" className="border-t border-primary-foreground/15">
      <ul className="mx-auto flex max-w-site gap-1 overflow-x-auto px-4 py-2 sm:px-8">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-1.5 paragraph-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring",
                  active
                    ? "bg-primary-foreground text-primary"
                    : "text-primary-foreground hover:bg-primary-foreground/15",
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
