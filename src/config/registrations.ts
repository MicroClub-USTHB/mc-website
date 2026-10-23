/**
 * Registrations window: when the "Register now" call to action shows and the registrations page
 * accepts members. ISO 8601 dates with their offset (Algeria is UTC+1, no daylight saving), or
 * `null`.
 *
 * - both `null`: closed. No button, `/registrations` is a 404 and the hero headline stands alone.
 * - `opensAt` only: "Opening soon" (disabled) counting down to it, then open with no end.
 * - `closesAt` only: open, counting down to the close, then closed.
 * - both: "Opening soon" until `opensAt`, open until `closesAt`, then closed.
 */
export const REGISTRATIONS_WINDOW: { opensAt: string | null; closesAt: string | null } = {
  opensAt: null,
  closesAt: "2026-11-30T23:59:59+01:00",
}
