"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { homeSections, siteConfig, sitePages } from "@/config/site"

/** Hamburger menu used instead of a classic navbar. */
export function SiteMenu() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="font-heading text-lg font-semibold">
        {siteConfig.name}
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon-lg" aria-label="Open menu" />}>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{siteConfig.name}</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
          </SheetHeader>
          <nav aria-label="Main" className="flex flex-col gap-1 px-4">
            {homeSections.map((section) => (
              <Link key={section.id} href={`/#${section.id}`} onClick={close} className="py-2">
                {section.label}
              </Link>
            ))}
            <hr className="my-2" />
            {sitePages.map((page) => (
              <Link key={page.href} href={page.href} onClick={close} className="py-2">
                {page.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
