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
/** Figma sizes, in rem: panel height (828px), gap between strips (24px), open card (606px). */
const DESIGN_HEIGHT = 51.75
const GAP = 1.5
const OPEN_WIDTH = 37.875
/** Visible part of the strip next to the open panel at either edge of the row, in rem. */
const PEEK = 3

/** Row slide and panel widening, none with reduced motion. */
const transition = "motion-safe:duration-700 motion-safe:ease-out-expo"

/**
 * Illustration shapes, tagged by `scripts/department-art.mjs`. A closed panel draws each shape at
 * its place in the strip from `lg` (`--closed`), in the accordion's bar below (`--bar`); opening
 * moves them into the card along with the widening, fades in the card-only shapes and fades out
 * the strip-only ones towards their partner (`--open`), from the top of the art down (`--d`,
 * see `department-art-motion.ts`, which also plays inside the shapes on the way).
 */
const art = {
  base: cn(
    "[&_[data-el=out]]:opacity-0 [&_[data-el]]:[transform-origin:0_0]",
    "motion-safe:[&_[data-el]]:[transition:transform_700ms_var(--ease-out-expo)_var(--d,0ms),opacity_500ms_var(--ease-out-quart)_var(--d,0ms)]",
  ),
  open: "[&_[data-el=out]]:[transform:var(--open,none)]",
  closed: cn(
    "[&_[data-el=in]]:opacity-0 [&_[data-el=out]]:opacity-100",
    // The bar's places are in strip units from its bottom-left corner, the top of the card art's
    // window at y 362.2 (see `DepartmentArt`): `--bu` turns them into art units.
    "[&_[data-el]]:[transform:translate(0,362.2px)_scale(var(--bu))_var(--bar)]",
    "lg:[&_[data-el]]:[transform:var(--closed,none)]",
  ),
}

/**
 * "Our Departments": a row of department strips, one open at a time. Clicking a strip (or Enter /
 * Space) widens it into its card while the illustration's shapes travel from their strip layout
 * to the card's, like the Figma variants. The open row is wider than the content: it slides so
 * the open card stays in view, with a slice of its neighbours left to click. Clicking the open
 * card again (anywhere on it) or Escape folds the row back into the overview. Below `lg`, an accordion.
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

    // Mirrors the row's CSS: gaps and cards scaled with its height (`--k`), strips fill the rest.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const width = viewport.clientWidth
    const count = panels.length
    const scale = Math.min(1, viewport.clientHeight / (DESIGN_HEIGHT * rem))
    const gap = GAP * rem * scale
    const pitch = (width - (count - 1) * gap) / count + gap
    const openWidth = OPEN_WIDTH * rem * scale
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

  /**
   * The row's size (`--cw` × `--ch`, its container's from `lg`) and a panel's inner width (`--pw`,
   * the accordion's container), measured: the CSS reads them in place of the container query
   * units, its fallback until hydration. A style using those units is recomputed whenever its
   * container lays out, on every frame of a panel's animation: for the dozens of art layers
   * moving with it, that cost more than the animation itself.
   */
  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const panel = track?.firstElementChild
    if (!viewport || !track || !panel) return
    const set = (name: string, value: string) => {
      if (track.style.getPropertyValue(name) !== value) track.style.setProperty(name, value)
    }
    const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value))
    // Each size is only set where it is read, and fixed while a panel animates: the row from `lg`
    // (the accordion's grows as it opens), a panel below (the row's widens as it opens).
    // The art's scale factors (`--js-*`) are worked out here too, as plain numbers: Safari does
    // not resolve the CSS versions (`tan(atan2())` of measured lengths) inside the shapes'
    // transforms, which then fall back to none (the closed strips and bars draw nothing).
    const observer = new ResizeObserver((entries) => {
      const desktop = window.matchMedia(DESKTOP).matches
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      for (const { target, contentBoxSize } of entries) {
        const [{ inlineSize, blockSize }] = contentBoxSize
        if (target === panel && !desktop) {
          // Mirrors the accordion bar's CSS (`--bh`, `--bw`, then `--bl`, `--bu`, `--bax`, `--bfit`).
          const bh = 6 * rem
          const bw = (window.matchMedia("(width >= 40rem)").matches ? 10 : 8) * rem
          const bax = clamp(0.4, ((inlineSize - bw) * 135) / (bh * 785), 1)
          set("--pw", `${inlineSize}px`)
          set("--js-bl", `${(bw * 135) / bh}`)
          set("--js-bu", `${(bh * 610) / (inlineSize * 135)}`)
          set("--js-bax", `${bax}`)
          set("--js-bfit", `${clamp(0.55, bax * 1.25, 1)}`)
          set("--js-s", `${inlineSize / 610}`)
        }
        if (target === viewport && desktop) {
          // Mirrors the row's CSS (`--k`, `--gap`, `--strip`, then `--ax`, `--fit`, the art's `--s`).
          const k = blockSize / (DESIGN_HEIGHT * rem)
          const gap = GAP * rem * k
          const strip = (inlineSize - (panels.length - 1) * gap) / panels.length
          const ax = strip / (8.4375 * rem * k)
          set("--cw", `${inlineSize}px`)
          set("--ch", `${blockSize}px`)
          set("--js-k", `${k}`)
          set("--js-ax", `${ax}`)
          set("--js-fit", `${Math.min(ax, 1.25)}`)
          set("--js-s", `${(38.125 * rem * k) / 610}`)
        }
      }
    })
    observer.observe(viewport)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [panels.length])

  // Keep the open card in view when the row is resized.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || open === null) return
    const size = () => `${viewport.clientWidth}x${viewport.clientHeight}`
    let last = size()
    const observer = new ResizeObserver(() => {
      if (size() === last) return
      last = size()
      setShift(window.matchMedia(DESKTOP).matches ? rowShift(open) : 0)
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  })

  /**
   * Closes the open card on a click on it, except on its links and tab (they act on their own)
   * or at the end of a text selection.
   */
  function closeOnClick(event: React.MouseEvent) {
    if (event.target instanceof Element && event.target.closest("a, button")) return
    if (window.getSelection()?.toString()) return
    show(null)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "Escape" || open === null) return
    const button = trackRef.current?.children[open]?.querySelector("button")
    // The card turns inert: hand focus back to its button before closing.
    if (button && !button.contains(document.activeElement)) button.focus()
    show(null)
  }

  return (
    <div ref={viewportRef} onKeyDown={handleKeyDown} className="lg:h-[100cqh] lg:overflow-x-clip">
      <div
        ref={trackRef}
        style={
          {
            "--count": panels.length,
            "--shift": `${shift}px`,
          } as React.CSSProperties
        }
        className={cn(
          "flex flex-col gap-3",
          // From `lg` the row fills its size container (the section's leftover height, at most the
          // 828px design): `--k` is its height over the design's, the scale of cards, tabs and art.
          "lg:h-full lg:[--k:var(--js-k,tan(atan2(var(--ch,100cqh),51.75rem)))]",
          // Strips share the content width (`100cqw`) with the design's gaps, scaled; the open card
          // overflows it. The strip art lays itself out (see `scripts/department-art.mjs`): `--ax`
          // is the strip's width over the scaled 135px design strip, `--fit` its objects' scale.
          "lg:[--gap:calc(1.5rem*var(--k))]",
          "lg:[--strip:calc((var(--cw,100cqw)-(var(--count)-1)*var(--gap))/var(--count))]",
          "lg:[--ax:var(--js-ax,tan(atan2(var(--strip),8.4375rem*var(--k))))] lg:[--fit:var(--js-fit,min(var(--ax),1.25))]",
          "lg:translate-x-(--shift) lg:flex-row lg:gap-(--gap) lg:motion-safe:transition-transform",
          transition,
        )}
      >
        {panels.map((panel, index) => {
          const isOpen = index === open
          return (
            <div
              key={panel.id}
              data-panel
              data-open={isOpen || undefined}
              // Clicking anywhere on the open card closes it (its tab already does).
              onClick={isOpen ? (event) => closeOnClick(event) : undefined}
              className={cn(
                "relative isolate flex flex-col overflow-hidden border border-border bg-background",
                // The accordion bar lays out the strip art (see `barTransform` in
                // `scripts/department-art.mjs`), in the 135px strip's units: `--bu` is one in
                // art units (the art spans the panel, 610 units), `--bl` the label's width,
                // `--bax` the strip's length squeezed into the bar beside it, `--bfit` the scale
                // of its objects. `--hh` is the header's height: the bar's, then the open card's.
                "max-lg:[container-type:inline-size] max-lg:[--bh:6rem] max-lg:[--hh:var(--bh)]",
                "max-lg:[--bw:8rem] sm:max-lg:[--bw:10rem]",
                "max-lg:[--bl:var(--js-bl,tan(atan2(var(--bw)*135,var(--bh))))] max-lg:[--bu:var(--js-bu,tan(atan2(var(--bh)*610,var(--pw,100cqw)*135)))]",
                "max-lg:[--bax:var(--js-bax,clamp(0.4,tan(atan2((var(--pw,100cqw)-var(--bw))*135,var(--bh)*785)),1))] max-lg:[--bfit:var(--js-bfit,clamp(0.55,var(--bax)*1.25,1))]",
                "lg:w-(--strip) lg:shrink-0 lg:motion-safe:transition-[width]",
                transition,
                art.base,
                isOpen
                  ? cn(
                      "cursor-pointer max-lg:[--hh:3.5rem] lg:w-[calc(37.875rem*var(--k))]",
                      art.open,
                    )
                  : art.closed,
              )}
            >
              {/* First in the DOM (accordion header), the footer tab of the row from `lg`. */}
              <h3 className="lg:order-last lg:[zoom:var(--k)]">
                <button
                  type="button"
                  id={`department-${panel.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`department-${panel.id}-card`}
                  onClick={() => show(isOpen ? null : index)}
                  className={cn(
                    "flex h-(--hh) w-full cursor-pointer outline-none motion-safe:transition-[height] lg:h-auto",
                    transition,
                    // The whole strip (bar below `lg`) is the button, its focus ring framing it.
                    "after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset",
                    isOpen && "after:pointer-events-none",
                  )}
                >
                  {/* The tab: the bar's label at its start, the header once open. */}
                  <span
                    className={cn(
                      "flex w-(--bw) shrink-0 items-center gap-3 border-border bg-accent px-4 paragraph-md text-accent-foreground uppercase motion-safe:transition-[width] sm:paragraph-xl",
                      "max-lg:border-r lg:w-full lg:justify-center lg:border-t lg:px-2 lg:py-2 lg:paragraph-xl",
                      transition,
                      isOpen && "w-full border-b max-lg:border-r-0 lg:border-b-0",
                    )}
                  >
                    {panel.tab}
                    <span className="sr-only">, {panel.name}</span>
                    <ChevronDownIcon
                      aria-hidden
                      className={cn(
                        "ml-auto size-5 shrink-0 rotate-180 transition-opacity duration-300 ease-out-quart motion-reduce:transition-none lg:hidden",
                        !isOpen && "opacity-0",
                      )}
                    />
                  </span>
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
                <div className="flex min-h-0 flex-col overflow-hidden lg:block">
                  {/*
                    Card width from the start: the text never reflows while the panel widens.
                    Zoomed with the row, it keeps the design's line breaks at any height.
                  */}
                  <div
                    className={cn(
                      "transition-opacity motion-reduce:transition-none lg:w-151.5 lg:[zoom:var(--k)]",
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
