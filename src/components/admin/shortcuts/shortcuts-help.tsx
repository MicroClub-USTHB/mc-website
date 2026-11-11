"use client"

import { KeyboardIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Keys } from "@/components/admin/shortcuts/kbd"
import { useShortcut } from "@/components/admin/shortcuts/use-shortcut"
import { McButton } from "@/components/ui/mc-button"
import {
  McDialog,
  McDialogContent,
  McDialogDescription,
  McDialogHeader,
  McDialogTitle,
} from "@/components/ui/mc-dialog"
import { adminRoutes } from "@/config/admin"

type Group = { title: string; shortcuts: { keys: string[][]; label: string }[] }

const REGISTRATION: Group[] = [
  {
    title: "Review",
    shortcuts: [
      { keys: [["Ctrl", "A"]], label: "Accept" },
      { keys: [["Ctrl", "R"]], label: "Reject" },
      { keys: [["Ctrl", "I"]], label: "To interview, or edit its details" },
    ],
  },
  {
    title: "In the review dialog",
    shortcuts: [
      { keys: [["Enter"]], label: "Confirm, from the reason" },
      { keys: [["Shift", "Enter"]], label: "New line in the reason" },
      { keys: [["Ctrl", "Enter"]], label: "Confirm, from any field" },
      { keys: [["Esc"]], label: "Cancel" },
    ],
  },
  {
    title: "Registration",
    shortcuts: [
      { keys: [["←"], ["→"]], label: "Previous or next in the list" },
      { keys: [["S"]], label: "Open the student ID" },
      { keys: [["M"]], label: "Mark or clear my place" },
    ],
  },
]

const LIST: Group[] = [{ title: "Registrations", shortcuts: [{ keys: [["/"]], label: "Search" }] }]

const CALENDAR: Group[] = [
  {
    title: "Calendar",
    shortcuts: [
      { keys: [["T"]], label: "Today" },
      { keys: [["←"], ["→"]], label: "Previous or next period" },
      { keys: [["W"]], label: "Week view" },
      { keys: [["M"]], label: "Month view" },
      { keys: [["A"]], label: "Agenda view" },
    ],
  },
]

const GENERAL: Group = {
  title: "Everywhere",
  shortcuts: [{ keys: [["?"]], label: "Show the shortcuts" }],
}

/** The shortcuts of the page at `pathname`, then the ones working everywhere. */
function groupsFor(pathname: string) {
  const page = pathname.startsWith(`${adminRoutes.registrations}/`)
    ? REGISTRATION
    : pathname === adminRoutes.registrations
      ? LIST
      : pathname === adminRoutes.calendar
        ? CALENDAR
        : []
  return [...page, GENERAL]
}

/**
 * Header button and `?` key opening the keyboard shortcuts of the current page, so they can be
 * found without reading a manual.
 */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useShortcut("?", () => setOpen(true))
  const groups = groupsFor(pathname)

  return (
    <>
      <McButton
        variant="tertiary"
        size="sm"
        icon="only"
        iconDefinition={<KeyboardIcon className="size-4" />}
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex"
        aria-keyshortcuts="Shift+?"
        title="Keyboard shortcuts (?)"
      >
        Keyboard shortcuts
      </McButton>
      <McDialog open={open} onOpenChange={setOpen}>
        <McDialogContent className="max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100%-2rem))] overflow-y-auto">
          <McDialogHeader>
            <McDialogTitle>Keyboard shortcuts</McDialogTitle>
            <McDialogDescription>
              {groups.length > 1
                ? "For this page. They wait while you type in a field."
                : "This page has no shortcuts of its own."}
            </McDialogDescription>
          </McDialogHeader>
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <section key={group.title} className="flex flex-col gap-2">
                <h3 className="paragraph-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {group.title}
                </h3>
                <dl className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.label}
                      className="flex items-center justify-between gap-4 px-3 py-2"
                    >
                      <dt className="paragraph-sm text-foreground">{shortcut.label}</dt>
                      <dd className="flex shrink-0 items-center gap-1.5 paragraph-xs text-muted-foreground">
                        {shortcut.keys.map((keys, index) => (
                          <span key={keys.join("+")} className="inline-flex items-center gap-1.5">
                            {index > 0 && "or"}
                            <Keys keys={keys} />
                          </span>
                        ))}
                        <span className="sr-only">
                          {shortcut.keys.map((keys) => keys.join(" + ")).join(" or ")}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </McDialogContent>
      </McDialog>
    </>
  )
}
