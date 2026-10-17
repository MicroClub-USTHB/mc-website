"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import type { DepartmentId } from "@/const/departments"
import { cn } from "@/lib/utils"

export type DepartmentPanel = {
  id: DepartmentId
  /** Short name of the footer tab, the panel's button. */
  tab: string
  name: string
  /** Name, tagline, description and link (server-rendered). */
  card: React.ReactNode
  /** Inline illustration (server-rendered), its shapes tagged with `data-el`. */
  illustration: React.ReactNode
}

/** The panel row from `lg`, an accordion below. */
const DESKTOP = "(width >= 64rem)"
/** Width of an open panel in rem (Figma 606px), as `lg:w-151.5`. */
const OPEN_WIDTH = 37.875
/** Visible part of the strip next to the open panel at either edge of the row, in rem. */
const PEEK = 3

/** Row slide and panel widening, none with reduced motion. */
const transition = "motion-safe:duration-700 motion-safe:ease-out-expo"

/**
 * Illustration shapes, tagged by `scripts/department-art.mjs`. From `lg`, a closed strip draws
 * each shape at its strip place (`--closed`); opening moves them into the card along with the
 * widening, fades in the card-only shapes and fades out the strip-only ones towards their
 * partner (`--open`). The accordion always shows the card.
 */
const art = {
  base: cn(
    "[&_[data-el=out]]:opacity-0 [&_[data-el]]:[transform-origin:0_0] [&_[data-el]]:[transform-box:view-box]",
    "lg:motion-safe:[&_[data-el]]:[transition:transform_700ms_var(--ease-out-expo),opacity_500ms_var(--ease-out-quart)]",
  ),
  open: "lg:[&_[data-el=out]]:[transform:var(--open,none)]",
  closed:
    "lg:[&_[data-el]]:[transform:var(--closed,none)] lg:[&_[data-el=in]]:opacity-0 lg:[&_[data-el=out]]:opacity-100",
}

/**
 * "Our Departments": a row of department strips, one open at a time. Clicking a strip (or Enter /
 * Space) widens it into its card while the illustration's shapes travel from their strip layout
 * to the card's, like the Figma variants. The open row is wider than the content: it slides so
 * the open card stays in view, with a slice of its neighbours left to click. Clicking the open
 * card's tab or Escape folds the row back into the overview. Below `lg`, an accordion.
 * Client island: only the open state lives here, the content comes from the server.
 */
export function DepartmentPanels({ panels }: { panels: DepartmentPanel[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [shift, setShift] = useState(0)

  /**
   * Row offset (px) once `index` is open: the panel opens from where its strip is now, moved
   * just enough to fit in view with a slice of its neighbours, so it stays under the pointer.
   */
  function rowShift(index: number) {
    const viewport = viewportRef.current
    const strip = trackRef.current?.children[index]
    if (!viewport || !strip) return 0

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const gap = parseFloat(getComputedStyle(trackRef.current!).columnGap) || 0
    const width = viewport.clientWidth
    const count = panels.length
    const pitch = (width - (count - 1) * gap) / count + gap
    const openWidth = OPEN_WIDTH * rem
    const peek = PEEK * rem + gap

    const left = strip.getBoundingClientRect().left - viewport.getBoundingClientRect().left
    const minLeft = index > 0 ? peek : 0
    const maxLeft = width - openWidth - (index < count - 1 ? peek : 0)
    const target = Math.min(Math.max(left, minLeft), maxLeft)
    const rowWidth = (count - 1) * pitch + openWidth
    return Math.min(0, Math.max(width - rowWidth, target - index * pitch))
  }

  function show(index: number | null) {
    if (index === open) return
    const desktop = window.matchMedia(DESKTOP).matches
    setShift(desktop && index !== null ? rowShift(index) : 0)
    setOpen(index)
  }

  // Keep the open card in view when the row is resized.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || open === null) return
    let width = viewport.clientWidth
    const observer = new ResizeObserver(() => {
      if (viewport.clientWidth === width) return
      width = viewport.clientWidth
      setShift(window.matchMedia(DESKTOP).matches ? rowShift(open) : 0)
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  })

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "Escape" || open === null) return
    const button = trackRef.current?.children[open]?.querySelector("button")
    // The card turns inert: hand focus back to its button before closing.
    if (button && !button.contains(document.activeElement)) button.focus()
    show(null)
  }

  return (
    <div ref={viewportRef} onKeyDown={handleKeyDown} className="lg:overflow-x-clip">
      <div
        ref={trackRef}
        style={
          {
            "--count": panels.length,
            "--shift": `${shift}px`,
          } as React.CSSProperties
        }
        className={cn(
          "flex flex-col gap-3 [--gap:1.5rem]",
          // Closed strips share the content width; the open panel overflows it to the right.
          "[--strip:calc((100%-(var(--count)-1)*var(--gap))/var(--count))]",
          "lg:h-207 lg:translate-x-(--shift) lg:flex-row lg:gap-(--gap) lg:motion-safe:transition-transform",
          transition,
        )}
      >
        {panels.map((panel, index) => {
          const isOpen = index === open
          return (
            <div
              key={panel.id}
              data-panel
              className={cn(
                "relative isolate flex flex-col overflow-hidden border border-border bg-background",
                "lg:w-(--strip) lg:shrink-0 lg:motion-safe:transition-[width]",
                transition,
                art.base,
                isOpen ? cn("lg:w-151.5", art.open) : art.closed,
              )}
            >
              {/* First in the DOM (accordion header), the footer tab of the row from `lg`. */}
              <h3 className="lg:order-last">
                <button
                  type="button"
                  id={`department-${panel.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`department-${panel.id}-card`}
                  onClick={() => show(isOpen ? null : index)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 border-border bg-accent px-6 py-3 paragraph-xl text-accent-foreground uppercase outline-none lg:justify-center lg:border-t lg:px-2 lg:py-2",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    // From `lg` the whole strip is the button, its focus ring framing the panel.
                    "lg:after:absolute lg:after:inset-0 lg:focus-visible:ring-0 lg:focus-visible:after:ring-2 lg:focus-visible:after:ring-ring lg:focus-visible:after:ring-inset",
                    isOpen && "border-b lg:border-b-0 lg:after:pointer-events-none",
                  )}
                >
                  {panel.tab}
                  <span className="sr-only">, {panel.name}</span>
                  <ChevronDownIcon
                    aria-hidden
                    className={cn(
                      "size-5 shrink-0 transition-transform duration-300 ease-out-quart motion-reduce:transition-none lg:hidden",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </h3>

              <div
                id={`department-${panel.id}-card`}
                role="region"
                aria-labelledby={`department-${panel.id}`}
                inert={!isOpen}
                className={cn(
                  "grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out-quart motion-reduce:transition-none lg:min-h-0 lg:flex-1 lg:grid-rows-[1fr]",
                  isOpen && "grid-rows-[1fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  {/* Card width from the start: the text never reflows while the panel widens. */}
                  <div
                    className={cn(
                      "transition-opacity motion-reduce:transition-none lg:w-151.5",
                      isOpen
                        ? "duration-500 ease-out-quart lg:delay-200"
                        : "duration-200 ease-out-quart lg:opacity-0",
                    )}
                  >
                    {panel.card}
                  </div>
                  {panel.illustration}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
