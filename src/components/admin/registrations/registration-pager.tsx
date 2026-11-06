"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { McButton } from "@/components/ui/mc-button"
import { McTooltip, McTooltipContent, McTooltipTrigger } from "@/components/ui/mc-tooltip"

type Target = { href: string; name: string } | null

/** Where the arrow keys already mean something: fields, dialogs, menus and other widgets. */
const KEEPS_ARROW_KEYS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"], [role="slider"], [role="tablist"], [role="radiogroup"]'

function ArrowLink({ target, direction }: { target: Target; direction: "previous" | "next" }) {
  const icon =
    direction === "previous" ? (
      <ChevronLeftIcon className="size-4" />
    ) : (
      <ChevronRightIcon className="size-4" />
    )
  const label = direction === "previous" ? "Previous application" : "Next application"

  if (!target) {
    return (
      <McButton variant="secondary" size="sm" icon="only" iconDefinition={icon} disabled>
        {label}
      </McButton>
    )
  }
  return (
    <McTooltip>
      <McTooltipTrigger
        render={
          <McButton
            variant="secondary"
            size="sm"
            icon="only"
            iconDefinition={icon}
            nativeButton={false}
            render={<Link href={target.href} />}
          >
            {`${label}: ${target.name}`}
          </McButton>
        }
      />
      <McTooltipContent side="bottom" sideOffset={12} title={label} description={target.name} />
    </McTooltip>
  )
}

/**
 * Previous and next applications of the list the registration was opened from, as arrows and with
 * the ← and → keys (ignored while typing, in a dialog or with a modifier, so Alt+← still goes back).
 * `position` is `null` once the registration left the list: only its total is shown then.
 */
export function RegistrationPager({
  previous,
  next,
  position,
  total,
}: {
  previous: Target
  next: Target
  position: number | null
  total: number
}) {
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.shiftKey) return
      const target = event.key === "ArrowLeft" ? previous : event.key === "ArrowRight" ? next : null
      if (!target) return
      const element = event.target instanceof Element ? event.target : null
      if (element?.closest(KEEPS_ARROW_KEYS)) return
      // A dialog left open without the focus inside it (e.g. while it closes).
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return
      event.preventDefault()
      router.push(target.href)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [previous, next, router])

  return (
    <nav aria-label="Applications" className="flex items-center gap-2">
      <ArrowLink target={previous} direction="previous" />
      <p className="min-w-20 text-center paragraph-sm text-muted-foreground tabular-nums">
        {position === null ? (
          <>
            <span className="font-medium text-foreground">{total}</span> in this list
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">{position}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>
      <ArrowLink target={next} direction="next" />
    </nav>
  )
}
