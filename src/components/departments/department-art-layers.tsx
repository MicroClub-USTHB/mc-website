"use client"

import { useEffect, useRef } from "react"

import type { DepartmentId } from "@/const/departments"

/** Extra room (art units) around a layer's shapes, for antialiasing and strokes. */
const MARGIN = 2

/**
 * Shrinks each layer to the area its shapes (and the regions of their filters) cover: the layers
 * are moved as separate GPU layers, and a full-size one (the whole 610×832 art) would cost the
 * memory of a screenful of pixels each, dozens of times over (phones reload a tab that runs out of
 * it). The layer keeps its place: its box moves to the shapes' corner, its viewBox crops to them,
 * and its transform origin stays at the art's corner, so every transform keeps its effect.
 */
function fitLayers(root: HTMLElement) {
  for (const layer of root.querySelectorAll<SVGSVGElement>("svg[data-el]")) {
    const box = layer.getBBox()
    let [left, top, right, bottom] = [box.x, box.y, box.x + box.width, box.y + box.height]
    if (box.width === 0 && box.height === 0) continue
    // Filters paint outside the shapes (blurs, glows): their regions are in art units.
    for (const filtered of layer.querySelectorAll("[filter]")) {
      const id = filtered.getAttribute("filter")?.match(/#([^)]+)/)?.[1]
      const filter = id ? root.ownerDocument.getElementById(id) : null
      if (!filter) continue
      const [x, y, width, height] = ["x", "y", "width", "height"].map((name) =>
        parseFloat(filter.getAttribute(name) ?? ""),
      )
      if ([x, y, width, height].some(Number.isNaN)) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x + width)
      bottom = Math.max(bottom, y + height)
    }
    left = Math.floor(left - MARGIN)
    top = Math.floor(top - MARGIN)
    const width = Math.ceil(right + MARGIN) - left
    const height = Math.ceil(bottom + MARGIN) - top
    layer.setAttribute("viewBox", `${left} ${top} ${width} ${height}`)
    Object.assign(layer.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      transformOrigin: `${-left}px ${-top}px`,
    })
  }
}

/**
 * The art's layers, drawn at the art's size in px (one px per viewBox unit, so the transforms keep
 * the art's units) and scaled to the panel (`--s`: below `lg` the art spans the panel, `--pw`).
 * The markup is fetched (`/art/departments/<id>`, static) once the section is within a screen of
 * the view, instead of weighing on the page's HTML and its hydration data twice.
 */
export function DepartmentArtLayers({
  id,
  width,
  height,
}: {
  id: DepartmentId
  width: number
  height: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const controller = new AbortController()
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        fetch(`/art/departments/${id}`, { signal: controller.signal })
          .then((response) => (response.ok ? response.text() : ""))
          .then((html) => {
            element.innerHTML = html
            fitLayers(element)
          })
          .catch(() => {})
      },
      { rootMargin: "100% 0px" },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      controller.abort()
    }
  }, [id])

  return (
    <div
      ref={ref}
      style={{ width, height }}
      className="absolute top-0 left-0 origin-top-left [scale:var(--s)] [--s:tan(atan2(var(--pw,100cqw),610px))] lg:[--s:tan(atan2(38.125rem*var(--k),610px))] [&>svg]:absolute [&>svg]:inset-0 [&>svg]:size-full [&>svg]:overflow-visible"
    />
  )
}
