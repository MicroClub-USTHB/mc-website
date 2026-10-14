import { useTransform } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"

/**
 * `clip-path` that reveals the element at the same edge as the panel wipe, so a layer in the
 * other theme (the menu wordmark, the toggle) appears exactly where the panel passes over it.
 */
export function useWipeClip(ref: React.RefObject<HTMLElement | null>) {
  const { reveal } = useMenu()

  return useTransform(reveal, (progress) => {
    const el = ref.current
    if (!el) return "inset(0 100% 0 0)"
    const { left, width } = el.getBoundingClientRect()
    const edge = progress * document.documentElement.clientWidth
    const hidden = Math.min(width, Math.max(0, left + width - edge))
    return `inset(0 ${hidden}px 0 0)`
  })
}
