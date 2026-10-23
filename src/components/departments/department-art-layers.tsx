"use client"

import { useEffect, useRef } from "react"

import type { DepartmentId } from "@/const/departments"

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
