"use client"

import { useRef, useState } from "react"

import {
  ClubSectionsStage,
  type StageSection,
} from "@/components/club-sections/club-sections-stage"
import type { ClubSectionId } from "@/const/club-sections"
import { cn } from "@/lib/utils"

export type ShowcaseSection = StageSection & {
  /** Title, description and link shown while the section is open (server-rendered). */
  details: React.ReactNode
}

type ClubSectionsShowcaseProps = {
  sections: ShowcaseSection[]
  /** The "Our Sections" heading (server-rendered). */
  heading: React.ReactNode
}

const transition = "duration-300 ease-out-quart motion-reduce:transition-none"

/**
 * "Our Sections": an overview of the three illustrations, and an infinite carousel with the
 * selected section's details. Arrow keys move the carousel, Escape goes back to the overview.
 * Client island: only the hover/selection state lives here, the content comes from the server.
 *
 * Layouts: title above and details below the illustrations (phones, portrait tablets), title
 * and details under them (desktop), and side by side on short landscape screens (`short:`).
 */
export function ClubSectionsShowcase({ sections, heading }: ClubSectionsShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<ClubSectionId | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const section = selected === null ? null : sections[selected]

  function step(by: 1 | -1) {
    setSelected((index) =>
      index === null ? index : (index + by + sections.length) % sections.length,
    )
  }

  function close() {
    const root = rootRef.current
    const hadFocus = root?.contains(document.activeElement)
    setSelected(null)
    setHovered(null)
    // The arrows become inert: hand focus back to the section that was open.
    if (hadFocus && section) {
      requestAnimationFrame(() =>
        root?.querySelector<HTMLElement>(`[data-section="${section.id}"]`)?.focus(),
      )
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (selected === null) return
    const action = { ArrowLeft: () => step(-1), ArrowRight: () => step(1), Escape: close }[
      event.key
    ]
    if (!action) return
    event.preventDefault()
    action()
  }

  return (
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] [grid-template-areas:'title'_'stage'_'details']",
        "lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-x-12 lg:[grid-template-areas:'stage_stage'_'title_details']",
        "short:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] short:grid-rows-[minmax(0,1fr)_auto] short:gap-x-6 short:[grid-template-areas:'stage_details'_'stage_title']",
      )}
    >
      {/* First in the DOM so the h2 precedes the sections' h3s; grid areas place it visually. */}
      <div className="mb-2 [grid-area:title] lg:mb-0 lg:self-end short:mt-3 short:mb-0">
        {heading}
      </div>

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Micro Club sections"
        // Size container: the stage fits the space left by the texts (see ClubSectionsStage).
        // From xl, it dips 39px into the details row, as in the Figma frames (the open icon stays clear of the text).
        className="[container-type:size] flex min-h-0 min-w-0 items-center justify-center [grid-area:stage] xl:-mb-9.75 lg:landscape:items-end short:mb-0 short:items-center"
      >
        <ClubSectionsStage
          sections={sections}
          hovered={hovered}
          selected={selected}
          onHover={(id) => selected === null && setHovered(id)}
          onSelect={setSelected}
          onClose={close}
          onStep={step}
        />
      </div>

      {/*
        Every section's details share one cell, so it is as tall as the longest and always
        holds its space: opening or switching sections never moves the layout.
      */}
      <div className="mt-6 grid [grid-area:details] lg:mt-0 lg:mr-8 lg:w-131.75 short:mt-0 short:mr-0 short:w-auto short:self-end compact:mt-3">
        {sections.map((item, index) => {
          const isShown = index === selected
          return (
            <div
              key={item.id}
              inert={!isShown}
              className={cn(
                "col-start-1 row-start-1 flex flex-col items-end text-right short:items-start short:text-left",
                // Hidden with `inert` + opacity: a visibility transition would restyle every frame.
                "transition-[opacity,translate]",
                transition,
                !isShown && "translate-y-4 opacity-0",
              )}
            >
              {item.details}
            </div>
          )
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {section?.title}
      </p>
    </div>
  )
}
