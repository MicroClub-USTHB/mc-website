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

/** Device pixels per CSS pixel of the bitmaps, capped: sharp on phones, without their 3x memory. */
const MAX_RASTER_DPR = 2

/**
 * Touch devices (phones, tablets): each layer is drawn once into a bitmap (an image in its
 * place), and the bitmaps are what move. Safari renders SVG filters (the blurs and glows) on the
 * CPU and outside its compositor, so an SVG layer moved or uncovered by the accordion is redrawn,
 * filters included, frame after frame; a bitmap is only moved by the GPU. Desktops keep the
 * vector layers, which they already move smoothly, and stay sharp at every scale.
 *
 * Each layer becomes a standalone SVG image (with the defs it references and the page's color
 * tokens written out), decoded off the main thread, drawn at its on-screen size, then swapped in
 * with the same attributes, styles and transforms. Runs once the art is in, before it is used.
 */
async function rasterizeLayers(root: HTMLElement, signal: AbortSignal, urls: string[]) {
  const defs = root.querySelector("svg:not([data-el]) defs")
  const tokens = getComputedStyle(root)
  const scale =
    (parseFloat(getComputedStyle(root).scale) || 1) *
    Math.min(MAX_RASTER_DPR, devicePixelRatio || 1)
  const byId = new Map([...(defs?.children ?? [])].map((element) => [element.id, element]))

  /** The defs a piece of markup uses, and the defs those use in turn. */
  function usedDefs(markup: string, found = new Set<string>()) {
    for (const [, id] of markup.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) {
      const def = byId.get(id)
      if (!def || found.has(id)) continue
      found.add(id)
      usedDefs(def.outerHTML, found)
    }
    return found
  }

  for (const layer of root.querySelectorAll<SVGSVGElement>("svg[data-el]")) {
    if (signal.aborted) return
    const [, , width, height] = (layer.getAttribute("viewBox") ?? "").split(" ").map(Number)
    if (!width || !height) continue
    const body = layer.innerHTML
    const shared = [...usedDefs(body)].map((id) => byId.get(id)!.outerHTML).join("")
    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${layer.getAttribute("viewBox")}" width="${width}" height="${height}" fill="none"><defs>${shared}</defs>${body}</svg>`.replace(
        /var\((--[\w-]+)\)/g,
        (token, name: string) => tokens.getPropertyValue(name).trim() || token,
      )
    const image = new Image()
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
    try {
      await image.decode()
    } catch {
      continue // This layer stays a vector.
    }
    if (signal.aborted) return
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.ceil(width * scale))
    canvas.height = Math.max(1, Math.ceil(height * scale))
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height)
    // Into an image: a canvas stays a GPU layer of its own for good, and 126 of them would be
    // re-managed by the compositor every frame; an image only becomes one while it moves.
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!blob || signal.aborted) continue
    const bitmap = new Image()
    bitmap.alt = ""
    bitmap.decoding = "async"
    bitmap.src = URL.createObjectURL(blob)
    urls.push(bitmap.src)
    try {
      await bitmap.decode()
    } catch {
      continue
    }
    if (signal.aborted) return
    for (const { name, value } of layer.attributes) {
      if (name === "data-el" || name === "style" || name === "aria-hidden")
        bitmap.setAttribute(name, value)
    }
    layer.replaceWith(bitmap)
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
    const urls: string[] = []
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        fetch(`/art/departments/${id}`, { signal: controller.signal })
          .then((response) => (response.ok ? response.text() : ""))
          .then((html) => {
            element.innerHTML = html
            fitLayers(element)
            if (window.matchMedia("(pointer: coarse)").matches) {
              return rasterizeLayers(element, controller.signal, urls)
            }
          })
          .catch(() => {})
      },
      { rootMargin: "100% 0px" },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      controller.abort()
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [id])

  return (
    <div
      ref={ref}
      style={{ width, height }}
      className="absolute top-0 left-0 origin-top-left [scale:var(--s)] [--s:var(--js-s,tan(atan2(var(--pw,100cqw),610px)))] lg:[--s:var(--js-s,tan(atan2(38.125rem*var(--k),610px)))] [&>*]:absolute [&>*]:inset-0 [&>*]:size-full [&>svg]:overflow-visible"
    />
  )
}
