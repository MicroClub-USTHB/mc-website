import { REGISTRATIONS_WINDOW } from "@/config/registrations"

/**
 * Where the registrations window stands at `now` (ms): `upcoming` and `open` carry the time
 * their countdown runs to (`null`: open with no end).
 */
export type RegistrationsPhase =
  | { status: "closed" }
  | { status: "upcoming"; until: number }
  | { status: "open"; until: number | null }

const opensAt = REGISTRATIONS_WINDOW.opensAt ? Date.parse(REGISTRATIONS_WINDOW.opensAt) : null
const closesAt = REGISTRATIONS_WINDOW.closesAt ? Date.parse(REGISTRATIONS_WINDOW.closesAt) : null

/** Whether the window has any date: otherwise registrations never show. */
export const hasRegistrationsWindow = opensAt !== null || closesAt !== null

export function registrationsPhase(now: number): RegistrationsPhase {
  if (!hasRegistrationsWindow) return { status: "closed" }
  if (opensAt !== null && now < opensAt) return { status: "upcoming", until: opensAt }
  if (closesAt !== null && now >= closesAt) return { status: "closed" }
  return { status: "open", until: closesAt }
}

/** Server checks: whether a registration can be made right now. */
export function areRegistrationsOpen() {
  return registrationsPhase(Date.now()).status === "open"
}

/**
 * The time a server render happens at, handed to the client so the countdown hydrates with the
 * server's HTML (the page is static, regenerated every minute).
 */
export function serverRenderTime() {
  return Date.now()
}
