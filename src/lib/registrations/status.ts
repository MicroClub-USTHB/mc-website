/** What one reviewer says about a registration: `pending` means they have not reviewed it. */
export const REVIEW_STATES = ["pending", "interview", "accepted", "rejected"] as const

export type ReviewState = (typeof REVIEW_STATES)[number]

/** State of a registration, computed from its reviews by `registrationStatus`. */
export const REGISTRATION_STATUSES = [
  "pending",
  "interview",
  "conflict",
  "accepted",
  "rejected",
] as const

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending",
  interview: "Interview",
  conflict: "Conflict",
  accepted: "Accepted",
  rejected: "Rejected",
}

export function isRegistrationStatus(value: unknown): value is RegistrationStatus {
  return REGISTRATION_STATUSES.includes(value as RegistrationStatus)
}

/**
 * Tabs of the admin registrations list: every status, and `second-review` for the pending
 * applications one HR member reviewed, waiting for the second (they stay in `pending` too).
 */
export const REGISTRATION_FILTERS = [
  "pending",
  "second-review",
  "interview",
  "conflict",
  "accepted",
  "rejected",
] as const

export type RegistrationFilter = (typeof REGISTRATION_FILTERS)[number]

export const REGISTRATION_FILTER_LABELS: Record<RegistrationFilter, string> = {
  ...REGISTRATION_STATUS_LABELS,
  "second-review": "2nd Review",
}

export function isRegistrationFilter(value: unknown): value is RegistrationFilter {
  return REGISTRATION_FILTERS.includes(value as RegistrationFilter)
}
