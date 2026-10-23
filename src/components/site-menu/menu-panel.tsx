"use client"

import { motion, useTransform } from "motion/react"

import { useMenu } from "@/components/site-menu/menu-context"
import { cn } from "@/lib/utils"

/**
 * Full-screen navigation panel, wiped in from the left by the shared `reveal` value. Always in
 * the DOM (links are server-rendered for crawlers); hidden and inert while closed.
 */
export function MenuPanel({ children }: { children: React.ReactNode }) {
  const { open, dark, reveal } = useMenu()
  const clipPath = useTransform(reveal, (progress) => `inset(0 ${(1 - progress) * 100}% 0 0)`)
  const visibility = useTransform(reveal, (progress) => (progress === 0 ? "hidden" : "visible"))

  return (
    <motion.nav
      id="site-menu-panel"
      aria-label="Main"
      inert={!open}
      style={{ clipPath, visibility }}
      data-lenis-prevent
      className={cn(
        dark && "dark",
        "fixed inset-0 z-40 overflow-y-auto bg-background will-change-[clip-path]",
      )}
    >
      {children}
    </motion.nav>
  )
}
