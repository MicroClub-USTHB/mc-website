/** The decisions an email announces: acceptance or refusal. */
export type DecisionKind = "accepted" | "rejected"

export const DECISION_KINDS: DecisionKind[] = ["accepted", "rejected"]

/**
 * Decision emails sent in any 24 hours: under Gmail's limit (about 500 a day for a personal
 * account), leaving room for tests and the HR address's own emails.
 */
export const DAILY_EMAIL_LIMIT = 450
/** Emails sent by one click: short enough to finish within one request. */
export const WAVE_SIZE = 100

/** How many emails the next wave sends: the wave size, within the daily limit and what waits. */
export function nextWaveSize({ sentLast24h, waiting }: { sentLast24h: number; waiting: number }) {
  return Math.max(0, Math.min(WAVE_SIZE, DAILY_EMAIL_LIMIT - sentLast24h, waiting))
}

/**
 * When the daily limit frees room again: 24 hours after the oldest email of the last 24 hours,
 * or `null` while there is room.
 */
export function limitResetsAt(sentLast24h: Date[]) {
  if (sentLast24h.length < DAILY_EMAIL_LIMIT) return null
  const oldest = Math.min(...sentLast24h.map((date) => date.getTime()))
  return new Date(oldest + 24 * 60 * 60 * 1000)
}

/** Refusals wait until every accepted applicant got their email, so nobody hears "no" first. */
export function refusalsLocked(acceptancesWaiting: number) {
  return acceptancesWaiting > 0
}

/**
 * Gmail's reason for a failed email, for HR. Its failures are almost never about one recipient
 * (wrong App Password, daily limit, lost connection), so a send stops at the first one.
 */
export function failureReason(error: unknown) {
  const { code, responseCode, response, message } = (error ?? {}) as {
    code?: string
    responseCode?: number
    response?: string
    message?: string
  }
  if (code === "EAUTH") return "Gmail refused the HR address's login: check HR_EMAIL_APP_PASSWORD."
  if (/5\.4\.5|4\.7\.0|limit/i.test(response ?? "")) {
    return "Gmail's sending limit is reached: try again in 24 hours."
  }
  if (code === "ETIMEDOUT" || code === "ECONNECTION" || code === "ESOCKET") {
    return "Gmail did not answer in time: try again in a few minutes."
  }
  return (
    response ?? message ?? (responseCode ? `Gmail answered ${responseCode}.` : "Unknown error.")
  )
}
