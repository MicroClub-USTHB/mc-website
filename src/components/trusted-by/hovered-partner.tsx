"use client"

import { createContext, useContext, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { EASE_OUT_QUART } from "@/lib/easing"

const HoveredPartnerContext = createContext<string | null>(null)
const SetHoveredPartnerContext = createContext<(name: string | null) => void>(() => {})

/** Attribute holding the partner name on each tile (see `LogoCell`). */
export const PARTNER_ATTRIBUTE = "data-partner"

/** Name of the partner whose tile is under the pointer, shared by the rows and the title. */
export function HoveredPartnerProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<string | null>(null)

  return (
    <SetHoveredPartnerContext value={setName}>
      <HoveredPartnerContext value={name}>{children}</HoveredPartnerContext>
    </SetHoveredPartnerContext>
  )
}

export function useSetHoveredPartner() {
  return useContext(SetHoveredPartnerContext)
}

/**
 * Figma title on hover, "TRUSTED BY : DJEEZY": " :" at the title size, then 24px further the
 * hovered partner's name (styled by `nameClassName`, Figma: `header-lg` medium, accent color),
 * vertically centered on the title. It stays on one line (a long name is truncated rather than pushing
 * the rows down) and is hidden from assistive tech, so the section keeps its "Trusted By" name.
 */
export function HoveredPartnerName({ nameClassName }: { nameClassName?: string }) {
  const name = useContext(HoveredPartnerContext)

  return (
    <span aria-hidden className="min-w-0 truncate">
      <AnimatePresence mode="wait" initial={false}>
        {name && (
          <motion.span
            key={name}
            initial={{ opacity: 0, y: "0.15em" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-0.15em" }}
            transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
            className="inline-flex items-center gap-6"
          >
            {/* Non-breaking space: a plain one would collapse at the start of the flex item. */}
            <span>{"\u00a0:"}</span>
            <span className={nameClassName}>{name}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * Hover area of the fixed rows: the tile under the pointer names the hovered partner. Moving rows
 * are skipped here: their tiles slide under a still pointer, so `LogoMarquee` tracks them itself.
 */
export function PartnerHoverArea({ className, ...props }: React.ComponentProps<"div">) {
  const setHovered = useSetHoveredPartner()

  function update(event: React.PointerEvent) {
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return
    if (event.target.closest("[data-marquee]")) return
    setHovered(
      event.target.closest(`[${PARTNER_ATTRIBUTE}]`)?.getAttribute(PARTNER_ATTRIBUTE) ?? null,
    )
  }

  return (
    <div
      onPointerOver={update}
      onPointerLeave={() => setHovered(null)}
      className={className}
      {...props}
    />
  )
}
