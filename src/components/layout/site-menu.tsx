"use client"

import { useState } from "react"
import Link from "next/link"
import { Dialog } from "@base-ui/react/dialog"
import { MenuIcon, XIcon } from "lucide-react"

import { ThemeToggle } from "@/components/layout/theme-toggle"
import { homeSections, siteConfig, sitePages } from "@/config/site"

const iconButton =
  "inline-flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

/**
 * Hamburger menu used instead of a classic navbar.
 * TODO: swap the raw Base UI dialog for the mcoli-ui component once available.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="font-heading text-lg font-semibold">
        {siteConfig.name}
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger aria-label="Open menu" className={iconButton}>
            <MenuIcon className="size-5" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/20 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm" />
            <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-3/4 flex-col gap-6 border-l bg-background p-6 shadow-lg transition duration-200 ease-in-out data-ending-style:translate-x-10 data-ending-style:opacity-0 data-starting-style:translate-x-10 data-starting-style:opacity-0 sm:max-w-sm">
              <div className="flex items-center justify-between">
                <Dialog.Title className="font-heading text-lg font-semibold">
                  {siteConfig.name}
                </Dialog.Title>
                <Dialog.Close aria-label="Close menu" className={iconButton}>
                  <XIcon className="size-5" />
                </Dialog.Close>
              </div>
              <nav aria-label="Main" className="flex flex-col gap-1">
                {homeSections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/#${section.id}`}
                    onClick={close}
                    className="py-2 hover:text-primary"
                  >
                    {section.label}
                  </Link>
                ))}
                <hr className="my-2" />
                {sitePages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={close}
                    className="py-2 hover:text-primary"
                  >
                    {page.label}
                  </Link>
                ))}
              </nav>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
