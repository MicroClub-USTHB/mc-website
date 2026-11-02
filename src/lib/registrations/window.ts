import { REGISTRATIONS_WINDOW } from "@/config/registrations"

/**
 * Where the registrations window stands at `now` (ms): `upcoming` and `open` carry the time
 * their countdown runs to (`null`: open with no end).
 */
export type RegistrationsPhase =
  | { status: "closed" }
  | { status: "upcoming"; until: number }
  | { status: "open"; until: number | null }

/** `2026-11-10T09:00:00+01:00`: a date, a time and an explicit offset (`Z` or `±hh:mm`). */
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/

/**
 * Reads one date of `REGISTRATIONS_WINDOW`, throwing on a value that would be misread: no offset
 * (read in the server's timezone), a date alone (midnight UTC) or an impossible date (`NaN`, which
 * would leave the window open). Thrown when the module loads, so `next build` fails on it.
 */
export function parseWindowDate(name: string, value: string | null) {
  if (value === null) return null
  const time = Date.parse(value)
  if (!ISO_WITH_OFFSET.test(value) || Number.isNaN(time)) {
    throw new Error(
      `REGISTRATIONS_WINDOW.${name} must be a date with its offset, like "2026-11-10T09:00:00+01:00" (got "${value}")`,
    )
  }
  return time
}

/** Both dates of the window, checked: `opensAt` must come before `closesAt`. */
export function parseWindow(window: { opensAt: string | null; closesAt: string | null }) {
  const opens = parseWindowDate("opensAt", window.opensAt)
  const closes = parseWindowDate("closesAt", window.closesAt)
  if (opens !== null && closes !== null && opens >= closes) {
    throw new Error("REGISTRATIONS_WINDOW.opensAt must be before closesAt")
  }
  return { opensAt: opens, closesAt: closes }
}

const { opensAt, closesAt } = parseWindow(REGISTRATIONS_WINDOW)

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
