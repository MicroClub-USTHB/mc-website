"use client"

import { useImperativeHandle, useRef } from "react"
import { Maximize2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

/** The visible part of the canvas, in fractions of its size. */
export type NavigatorRect = { x: number; y: number; width: number; height: number }

export type NavigatorHandle = {
  /** Moves the indicator (written to the DOM directly: no React render while panning). */
  update: (rect: NavigatorRect) => void
}

/**
 * Figma "Navigation": a 120px map of the canvas with a pill on the part in view. Dragging or
 * clicking it moves the view there (`onNavigate`, the canvas point to centre, in fractions).
 * On touch screens, while the canvas is not explored yet, a tap opens the explore mode
 * (`onExplore`) instead, so a swipe on the page never gets trapped by the canvas.
 */
export function CanvasNavigator({
  ref,
  aspectRatio,
  onNavigate,
  onExplore,
  className,
}: {
  ref?: React.Ref<NavigatorHandle>
  aspectRatio: number
  onNavigate: (x: number, y: number) => void
  onExplore?: () => void
  className?: string
}) {
  const indicatorRef = useRef<HTMLSpanElement>(null)

  useImperativeHandle(ref, () => ({
    update({ x, y, width, height }) {
      const indicator = indicatorRef.current
      if (!indicator) return
      indicator.style.left = `${x * 100}%`
      indicator.style.top = `${y * 100}%`
      indicator.style.width = `${width * 100}%`
      indicator.style.height = `${height * 100}%`
    },
  }))

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "touch" && onExplore) return // A tap: handled by `onClick`.
    event.preventDefault()
    const map = event.currentTarget
    map.setPointerCapture(event.pointerId)
    const navigate = (pointer: { clientX: number; clientY: number }) => {
      const rect = map.getBoundingClientRect()
      onNavigate(
        Math.min(1, Math.max(0, (pointer.clientX - rect.left) / rect.width)),
        Math.min(1, Math.max(0, (pointer.clientY - rect.top) / rect.height)),
      )
    }
    navigate(event)
    const end = () => {
      map.removeEventListener("pointermove", navigate)
      map.removeEventListener("pointerup", end)
      map.removeEventListener("pointercancel", end)
    }
    map.addEventListener("pointermove", navigate)
    map.addEventListener("pointerup", end)
    map.addEventListener("pointercancel", end)
  }

  return (
    <button
      type="button"
      aria-label={onExplore ? "Explore the canvas" : "Canvas map"}
      onPointerDown={onPointerDown}
      onClick={(event) => {
        // A tap on a touch screen opens the explore mode; mouse clicks already navigated.
        if (onExplore && event.nativeEvent instanceof PointerEvent) {
          if (event.nativeEvent.pointerType === "touch") onExplore()
        }
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onExplore) {
          event.preventDefault()
          onExplore()
        }
      }}
      style={{ aspectRatio }}
      className={cn(
        "relative block w-30 cursor-pointer touch-none overflow-hidden border border-border bg-background/90 outline-none focus-visible:ring-4 focus-visible:ring-secondary",
        className,
      )}
    >
      <span ref={indicatorRef} aria-hidden className="absolute rounded-full bg-secondary" />
      {onExplore && (
        // Touch screens: a hint that the map opens the explore mode.
        <Maximize2Icon
          aria-hidden
          className="absolute top-2 right-2 hidden size-4 text-muted-foreground pointer-coarse:block"
        />
      )}
    </button>
  )
}
