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
