"use client"

import { createContext, useContext, useState } from "react"

type ActiveEvent = {
  /** Event of the hovered slice, `null` when no slice is hovered. */
  activeId: string | null
  /** Last event that was active, kept so a label can fade out with its text. */
  lastId: string | null
}

const ActiveEventContext = createContext<ActiveEvent>({ activeId: null, lastId: null })
const SetActiveEventContext = createContext<(id: string | null) => void>(() => {})

/**
 * Active event of the Events Hub, shared by the chain (which sets it while a slice is hovered)
 * and by the event list and category label (which light it up). No event is active by default.
 */
export function ActiveEventProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ActiveEvent>({ activeId: null, lastId: null })

  // Stable setter; bails out when the active event does not change (called on every pointer move).
  const [setActiveEvent] = useState(() => (id: string | null) => {
    setState((current) =>
      current.activeId === id ? current : { activeId: id, lastId: id ?? current.lastId },
    )
  })

  return (
    <SetActiveEventContext value={setActiveEvent}>
      <ActiveEventContext value={state}>{children}</ActiveEventContext>
    </SetActiveEventContext>
  )
}

export function useActiveEvent() {
  return useContext(ActiveEventContext)
}

export function useSetActiveEvent() {
  return useContext(SetActiveEventContext)
}
