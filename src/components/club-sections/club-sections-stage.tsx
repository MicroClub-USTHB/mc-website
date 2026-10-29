"use client"

import { useEffect, useRef, useState } from "react"

import { ChevronLeftIcon } from "@/components/icons/chevron-left"
import { ChevronRightIcon } from "@/components/icons/chevron-right"
import { McButton } from "@/components/ui/mc-button"
import type { ClubSectionId } from "@/const/club-sections"
import { EASE_OUT_EXPO } from "@/lib/easing"
import { cn } from "@/lib/utils"

export type StageSection = {
  id: ClubSectionId
  title: string
  tag: string
  /** The illustration at rest and in its hovered / selected look (server-rendered). */
  looks: { rest: React.ReactNode; active: React.ReactNode }
}

/** Icon center in stage pixels (the stage is 840×440, cut from the 1440px desktop frame). */
type Placement = { x: number; y: number; scale?: number; tilt?: number }

const STAGE = { width: 840, height: 440 }

const illustrations: Record<
  ClubSectionId,
  {
    /** Icon viewBox size, in stage pixels at scale 1. */
    size: { width: number; height: number }
    /** Center of the tag shown above the hovered icon. */
    tag: { x: number; y: number }
    /** Paint order in the overview (the active icon always comes forward). */
    order: number
    /** Centered placement once the section is selected. */
    selected: Placement
  }
> = {
  it: {
    size: { width: 240, height: 240 },
    tag: { x: 161, y: 45 },
    order: 2,
    selected: { x: 411, y: 231, scale: 1.179 },
  },
  "game-dev": {
    size: { width: 362, height: 318 },
    tag: { x: 418, y: 47 },
    order: 1,
    selected: { x: 420, y: 231, scale: 1.23 },
  },
  robotics: {
    size: { width: 405, height: 263 },
    tag: { x: 644, y: 41 },
    order: 0,
    selected: { x: 419, y: 235, scale: 1.1235 },
  },
}

// Measured from the Figma frames: the resting overview, then one per hovered section.
const overviewLayouts: Record<ClubSectionId | "none", Record<ClubSectionId, Placement>> = {
  none: {
    it: { x: 170, y: 239 },
    "game-dev": { x: 403, y: 245, tilt: 3.4 },
    robotics: { x: 631, y: 226, tilt: -5 },
  },
  it: {
    it: { x: 161, y: 236, scale: 1.179 },
    "game-dev": { x: 429, y: 250, tilt: 3.4 },
    robotics: { x: 660, y: 231, tilt: -5 },
  },
  "game-dev": {
    it: { x: 139, y: 247 },
    "game-dev": { x: 418, y: 257, scale: 1.23 },
    robotics: { x: 661, y: 232, tilt: -5 },
  },
  robotics: {
    it: { x: 139, y: 256 },
    "game-dev": { x: 393, y: 265, tilt: 3.4 },
    robotics: { x: 643, y: 237, scale: 1.1235 },
  },
}

/** Where each icon comes from as the stage scrolls in, in stage pixels and degrees. */
const ENTRANCES: Record<ClubSectionId, { x: number; y: number; turn: number }> = {
  it: { x: -120, y: 40, turn: -25 },
  "game-dev": { x: 0, y: 120, turn: 8 },
  robotics: { x: 120, y: 40, turn: 20 },
}

/** How far the hidden carousel neighbours wait off-center, in stage pixels. */
const CAROUSEL_OFFSET = 220

/** Percent of the stage width. */
const ofWidth = (value: number) => `${(value / STAGE.width) * 100}%`

/**
 * Places an icon box (laid out at the stage's top left) with its center on `x`, `y`. Percentages
 * in `translate` are of the box itself, whose size in stage pixels is the icon's viewBox size.
 */
function transformOf(
  { x, y, scale = 1, tilt = 0 }: Placement,
  size: { width: number; height: number },
) {
  const tx = ((x - size.width / 2) / size.width) * 100
  const ty = ((y - size.height / 2) / size.height) * 100
  return `translate(${tx}%, ${ty}%) rotate(${tilt}deg) scale(${scale})`
}

const transition = "duration-300 ease-out-quart motion-reduce:transition-none"

/** Sizes the server-rendered SVG to its box; only its painted shapes take the pointer. */
const LOOK = "[&>svg]:block [&>svg]:w-full [&>svg>*]:pointer-events-auto"

type ClubSectionsStageProps = {
  sections: StageSection[]
  hovered: ClubSectionId | null
  /** Index of the selected section (carousel view), or `null` for the overview. */
  selected: number | null
  onHover: (id: ClubSectionId | null) => void
  onSelect: (index: number) => void
  onClose: () => void
  onStep: (step: 1 | -1) => void
}

function placementOf(
  id: ClubSectionId,
  index: number,
  count: number,
  hovered: ClubSectionId | null,
  selected: number | null,
): Placement & { visible: boolean } {
  if (selected === null) return { ...overviewLayouts[hovered ?? "none"][id], visible: true }

  // 0: centered, 1: next (waiting on the right), 2: previous (waiting on the left).
  const offset = (index - selected + count) % count
  const center = illustrations[id].selected
  if (offset === 0) return { ...center, visible: true }
  return {
    x: center.x + (offset === 1 ? CAROUSEL_OFFSET : -CAROUSEL_OFFSET),
    y: center.y,
    visible: false,
  }
}

/**
 * The three section illustrations: an overview where hovering brings one forward with its tag,
 * and a carousel showing the selected one.
 *
 * Icons move with transforms and change look with a cross-fade, so the browser animates their
 * already painted layers instead of laying out and repainting the SVG filters on every frame.
 */
export function ClubSectionsStage({
  sections,
  hovered,
  selected,
  onHover,
  onSelect,
  onClose,
  onStep,
}: ClubSectionsStageProps) {
  const isCarousel = selected !== null
  const stageRef = useRef<HTMLDivElement>(null)
  const entranceRefs = useRef(new Map<ClubSectionId, HTMLDivElement>())
  // The active looks are invisible until someone interacts: render them once the section comes
  // near the screen, so they stay out of the page's first load and hydration.
  const [hasActiveLooks, setHasActiveLooks] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setHasActiveLooks(true)
        observer.disconnect()
      },
      { rootMargin: "50% 0px" },
    )
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // The icons fly in as the stage scrolls into view. Created paused, so they stay hidden until then.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const scale = stage.offsetWidth / STAGE.width
    const animations = [...entranceRefs.current].map(([id, element], index) => {
      const { x, y, turn } = ENTRANCES[id]
      const animation = element.animate(
        [
          {
            transform: `translate(${x * scale}px, ${y * scale}px) rotate(${turn}deg) scale(0.6)`,
            opacity: 0,
          },
          { opacity: 1, offset: 0.4 },
          { transform: "none", opacity: 1 },
        ],
        {
          duration: 1000,
          delay: index * 140,
          easing: `cubic-bezier(${EASE_OUT_EXPO.join(",")})`,
          fill: "backwards",
        },
      )
      animation.pause()
      return animation
    })
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        for (const animation of animations) animation.play()
      },
      { threshold: 0.4 },
    )
    observer.observe(stage)
    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
    }
  }, [])

  return (
    <div
      ref={stageRef}
      // As wide as possible within the width (minus room for the hovered robot, which pokes out
      // on the right), the Figma size (840px) and the parent container's height.
      className="relative aspect-[840/440] w-[min(100%_-_1rem,52.5rem,100cqh*840/440)]"
      onPointerLeave={() => onHover(null)}
    >
      {sections.map(({ id, title, looks }, index) => {
        const { size, order } = illustrations[id]
        const { visible, ...placement } = placementOf(id, index, sections.length, hovered, selected)
        const isActive = isCarousel ? visible : hovered === id

        return (
          <button
            key={id}
            type="button"
            data-section={id}
            aria-label={isCarousel ? `${title}, back to all sections` : title}
            inert={!visible}
            className={cn(
              "pointer-events-none absolute top-0 left-0 grid cursor-pointer rounded-3xl outline-none *:col-start-1 *:row-start-1 focus-visible:outline-2 focus-visible:outline-ring",
              "transition-[transform,opacity,visibility] ease-out-quart motion-reduce:transition-none",
              !visible && "invisible opacity-0",
            )}
            style={{
              zIndex: isActive ? 3 : order,
              width: ofWidth(size.width),
              transform: transformOf(placement, size),
              // Visibility flips once, after the fade out: a transitioned visibility would be
              // restyled on every frame.
              transitionDuration: "300ms, 300ms, 0s",
              transitionDelay: visible ? "0s" : "0s, 0s, 300ms",
            }}
            onPointerEnter={() => onHover(id)}
            onFocus={() => onHover(id)}
            onBlur={() => onHover(null)}
            onClick={() => (isCarousel ? onClose() : onSelect(index))}
          >
            <div
              ref={(element) => {
                if (element) entranceRefs.current.set(id, element)
                else entranceRefs.current.delete(id)
              }}
              className="grid *:col-start-1 *:row-start-1"
            >
              {/*
                Both looks are rendered once and faded: animating the SVG colors would repaint
                every filter on each frame. The active look fades over the resting one, which
                fades out a beat later (the active look is partly translucent): the two never
                dip together to the background. Each look is isolated: otherwise the robot's
                blended layers would blend with the other look whenever theirs is fully opaque,
                and snap to a different color as a fade ends. No `will-change`: it freezes the layers'
                resolution, so scaled up icons would stay blurry. Only painted shapes react to the
                pointer, as the icons' boxes overlap a lot.
              */}
              <div
                className={cn(
                  LOOK,
                  "isolate transition-opacity duration-200 ease-out-quart motion-reduce:transition-none",
                  isActive && hasActiveLooks && "opacity-0 delay-100 duration-300",
                )}
              >
                {looks.rest}
              </div>
              {hasActiveLooks && (
                <div
                  className={cn(
                    LOOK,
                    "isolate transition-opacity",
                    transition,
                    !isActive && "opacity-0",
                  )}
                >
                  {looks.active}
                </div>
              )}
            </div>
          </button>
        )
      })}
      {sections.map(({ id, tag }) => (
        <span
          key={id}
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary px-4 py-1.5 paragraph-md whitespace-nowrap text-secondary-foreground sm:px-6 sm:py-2.5 sm:header-xs",
            "transition-[opacity,translate]",
            transition,
            !isCarousel && hovered === id
              ? "opacity-100"
              : "translate-y-[calc(-50%+0.5rem)] opacity-0",
          )}
          style={{
            left: ofWidth(illustrations[id].tag.x),
            top: `${(illustrations[id].tag.y / STAGE.height) * 100}%`,
          }}
        >
          {tag}
        </span>
      ))}
      {(
        [
          { step: -1, x: 112, label: "Previous section", Icon: ChevronLeftIcon },
          { step: 1, x: 727, label: "Next section", Icon: ChevronRightIcon },
        ] as const
      ).map(({ step, x, label, Icon }) => (
        <McButton
          key={step}
          variant="secondary"
          size="xl"
          icon="only"
          iconDefinition={<Icon />}
          inert={!isCarousel}
          className={cn(
            "absolute z-10 size-10 -translate-1/2 rounded-full border-border bg-card p-0 sm:size-13.5 [&_svg]:size-5",
            "transition-[opacity,background-color,color]",
            transition,
            !isCarousel && "opacity-0",
          )}
          style={{ left: ofWidth(x), top: `${(231 / STAGE.height) * 100}%` }}
          onClick={() => onStep(step)}
        >
          {label}
        </McButton>
      ))}
    </div>
  )
}
