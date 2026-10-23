"use client"

import { usePathname } from "next/navigation"

import { RegistrationsButton } from "@/components/shared/registrations-button"
import { useMenu } from "@/components/site-menu/menu-context"
import { siteRoutes } from "@/config/site"
import { useRegistrationsPhase } from "@/lib/registrations/use-registrations-phase"
import { cn } from "@/lib/utils"

/**
 * The registrations call to action, fixed at the right end of the menu bar and centred on it
 * (Figma "Other section"): "Opening soon" or "Register now" with its countdown, nothing once the
 * registrations close. Scaled with the bar (1 at its 85px design size), and to fit beside the wordmark on phones.
 * Hidden while the menu is open (it would sit over the menu's wordmark), and on the
 * registrations page itself. Drawn once hydrated: the phase needs the visitor's clock.
 */
export function RegistrationsCorner() {
  const pathname = usePathname()
  const { open } = useMenu()
  const state = useRegistrationsPhase()
  if (!state || state.phase.status === "closed" || pathname === siteRoutes.registrations) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto max-w-site">
      <div
        className={cn(
          // The bar's scale (never under 0.8, to stay readable on tablets), capped by the room left of the "MICRO CLUB" wordmark (toggle + 3
          // cells wide, plus a gap): never over it on phones. There, the countdown sits on the
          // button's right edge instead of past it (see below), so the pair is only as wide as
          // the button (188px at most), scaled to the room left (not to the smaller bar) to stay readable.
          "absolute right-(--menu-left)",
          "[--corner-scale:clamp(0.45,min(max(tan(atan2(var(--menu-size),85px)),0.8),tan(atan2(100vw-2*var(--menu-left)-4*var(--menu-size)-1rem,263px))),1)]",
          "max-sm:[--corner-scale:clamp(0.5,tan(atan2(100vw-2*var(--menu-left)-4*var(--menu-size)-0.5rem,188px)),0.85)]",
          "top-[calc(var(--menu-top)+var(--menu-size)/2-32.1375px*var(--corner-scale))]",
        )}
      >
        <RegistrationsButton
          phase={state.phase}
          now={state.now}
          className={cn(
            "pointer-events-auto origin-top-right scale-(--corner-scale) transition-opacity duration-300",
            // Phones: the button in the flow (its width sizes the pair), the countdown on its
            // top right corner, clear of its label.
            "max-sm:h-auto max-sm:w-auto max-sm:pt-[19px] max-sm:[&>[data-slot=button]]:relative max-sm:[&>[data-slot=button]]:top-0",
            "max-sm:[&>[role=timer]]:right-0 max-sm:[&>[role=timer]]:left-auto",
            open && "pointer-events-none opacity-0",
          )}
        />
      </div>
    </div>
  )
}
