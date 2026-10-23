"use client"

import { useEffect, useRef } from "react"

/**
 * The covered section of a `SectionStack`: sticky with `top` set so it sticks when its bottom
 * edge meets the bottom of the screen (`100svh - its height`, 0 for a section shorter than the
 * screen). The height is measured with a ResizeObserver, never while scrolling. Once the
 * covering sections fill the screen (their top edge above it), the covered one is hidden
 * (`visibility`, no paint, no hit testing) and shown again as they scroll back down.
 */
export function StickyUnder({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    // `top` itself, not an inherited custom property: a section that grows (an accordion opening)
    // reports a new height every frame, and a custom property would restyle the whole section.
    const observer = new ResizeObserver(([entry]) => {
      element.style.top = `min(0px, calc(100svh - ${entry.borderBoxSize[0].blockSize}px))`
    })
    observer.observe(element)

    const edge = element.nextElementSibling?.firstElementChild
    const cover = new IntersectionObserver(([entry]) => {
      element.style.visibility =
        !entry.isIntersecting && entry.boundingClientRect.top < 0 ? "hidden" : ""
    })
    if (edge) cover.observe(edge)
    return () => {
      observer.disconnect()
      cover.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className="sticky top-0 z-0">
      {children}
    </div>
  )
}
