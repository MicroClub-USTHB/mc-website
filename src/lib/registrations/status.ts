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
