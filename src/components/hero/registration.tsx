"use client"

import { RegistrationsButton } from "@/components/shared/registrations-button"
import { useRegistrationsPhase } from "@/lib/registrations/use-registrations-phase"

/**
 * The hero's registrations call to action (see `RegistrationsButton`), under the headline. Its
 * box is the slot the menu bar docks it from once it scrolls up there (`RegistrationsDock`), and
 * hides while it is docked (`data-docked`). Its size is kept while the page hydrates (the phase
 * needs the visitor's clock); it goes away for good once the registrations close.
 */
export function Registration() {
  const state = useRegistrationsPhase()
  if (state?.phase.status === "closed") return null

  return (
    <div data-registrations-slot className="data-docked:invisible">
      {state ? (
        <RegistrationsButton phase={state.phase} now={state.now} />
      ) : (
        <div className="h-[64.275px] w-[259.176px]" />
      )}
    </div>
  )
}
