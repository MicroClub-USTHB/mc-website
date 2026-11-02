import { useEffect, useState } from "react"

import { homeSections } from "@/config/site"

/** How far below the bar (px) a title counts, so the bar is out of the way before it arrives. */
const LEAD = 48

/**
 * Screens where the bar slides aside: below `lg` there is no margin beside the titles for it, and
 * they rest below the bar instead (`pt-below-menu`).
 */
const DOCKING = "(min-width: 64rem)"

/**
 * Whether a section title is at the fixed menu bar. Sections of a `SectionStack` overlap, and a
 * covered section keeps its title in place under the sections scrolling over it, so titles only
 * count from the section on top down: that section is the last one in page order crossing the
 * bar's top edge, and the next one may bring its title in before it gets there. Two
 * IntersectionObservers report the crossings, a 1px line for the sections and the bar's height for
 * the titles, so scrolling does no layout reads. Rebuilt on resize, as the bar follows the screen
 * size, and on navigation (the sections are only on the landing page). Off below `lg`.
 */
export function useTitleAtBar(
  barRef: React.RefObject<HTMLElement | null>,
  pathname: string,
): boolean {
  const [atBar, setAtBar] = useState(false)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const sections = homeSections.flatMap(({ id }) => {
      const section = document.getElementById(id)
      return section ? [{ section, title: section.querySelector("h2:not(.sr-only)") }] : []
    })
    let observers: IntersectionObserver[] = []
    const observe = () => {
      observers.forEach((observer) => observer.disconnect())
      observers = []
      if (!window.matchMedia(DOCKING).matches) {
        setAtBar(false)
        return
      }
      const { top, bottom } = bar.getBoundingClientRect()
      const height = window.innerHeight
      const crossing = new Set<Element>()
      const track = (entries: IntersectionObserverEntry[]) => {
        for (const { isIntersecting, target } of entries) {
          if (isIntersecting) crossing.add(target)
          else crossing.delete(target)
        }
        const onTop = sections.findLastIndex(({ section }) => crossing.has(section))
        const visible = sections.slice(Math.max(onTop, 0))
        setAtBar(visible.some(({ title }) => title && crossing.has(title)))
      }
      const barTop = `${-Math.floor(top)}px 0px`
      const sectionLine = new IntersectionObserver(track, {
        rootMargin: `${barTop} ${Math.floor(top) + 1 - height}px 0px`,
      })
      const titleBand = new IntersectionObserver(track, {
        rootMargin: `${barTop} ${Math.ceil(bottom) + LEAD - height}px 0px`,
      })
      for (const { section, title } of sections) {
        sectionLine.observe(section)
        if (title) titleBand.observe(title)
      }
      observers = [sectionLine, titleBand]
    }
    observe()
    window.addEventListener("resize", observe)
    return () => {
      window.removeEventListener("resize", observe)
      observers.forEach((observer) => observer.disconnect())
    }
  }, [barRef, pathname])

  return atBar
}
