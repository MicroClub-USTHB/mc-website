/** Review status of a registration, `pending` until HR accepts or rejects it. */
export const REGISTRATION_STATUSES = ["pending", "accepted", "rejected"] as const

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
}

export function isRegistrationStatus(value: unknown): value is RegistrationStatus {
  return REGISTRATION_STATUSES.includes(value as RegistrationStatus)
}
