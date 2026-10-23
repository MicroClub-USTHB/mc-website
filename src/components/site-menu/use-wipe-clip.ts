import { useTransform } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"

/**
 * `clip-path` that reveals the element at the same edge as the panel wipe, so a layer in the
 * other theme (the menu wordmark, the toggle) appears exactly where the panel passes over it.
 * `bleed` (px) keeps a ring drawn outside the element visible, once the wipe has passed it.
 */
export function useWipeClip(ref: React.RefObject<HTMLElement | null>, bleed = 0) {
  const { reveal } = useMenu()

  return useTransform(reveal, (progress) => {
    const el = ref.current
    if (!el) return "inset(0 100% 0 0)"
    const { left, width } = el.getBoundingClientRect()
    const edge = progress * document.documentElement.clientWidth
    const hidden = Math.min(width, Math.max(0, left + width - edge))
    const right = hidden === 0 ? -bleed : hidden
    return `inset(${-bleed}px ${right}px ${-bleed}px ${-bleed}px)`
  })
}
