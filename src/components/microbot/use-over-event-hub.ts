import { useEffect, useState } from "react"

import { homeSections } from "@/config/site"

/**
 * Whether the Event Hub is the section under the launcher. Sections of a `SectionStack` overlap, and
 * the Event Hub stays pinned while Trusted By scrolls over it, so its own box cannot tell: the last
 * section in page order crossing the launcher's top edge is the one on top. An IntersectionObserver
 * whose root is that 1px line reports the crossings, so scrolling does no layout reads. Rebuilt on
 * resize, as the launcher's position follows the screen size.
 */
export function useOverEventHub(launcherRef: React.RefObject<HTMLElement | null>) {
  const [over, setOver] = useState(false)

  useEffect(() => {
    let observer: IntersectionObserver | null = null
    const observe = () => {
      observer?.disconnect()
      const top = Math.floor(launcherRef.current?.getBoundingClientRect().top ?? 0)
      const crossing = new Set<string>()
      observer = new IntersectionObserver(
        (entries) => {
          for (const { isIntersecting, target } of entries) {
            if (isIntersecting) crossing.add(target.id)
            else crossing.delete(target.id)
          }
          const onTop = homeSections.findLast((section) => crossing.has(section.id))
          setOver(onTop?.id === "featured-events")
        },
        { rootMargin: `${-top}px 0px ${top + 1 - window.innerHeight}px 0px` },
      )
      for (const { id } of homeSections) {
        const section = document.getElementById(id)
        if (section) observer.observe(section)
      }
    }
    observe()
    window.addEventListener("resize", observe)
    return () => {
      window.removeEventListener("resize", observe)
      observer?.disconnect()
    }
  }, [launcherRef])

  return over
}
