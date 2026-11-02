import type { RegistrationStatus, ReviewState } from "@/lib/registrations/status"

/** Reviewers an application can have at once. */
export const MAX_REVIEWERS = 2

type TimelineAction = {
  actorId: string
  /** Kept with the entry: the timeline must survive the deletion of the account. */
  actorName: string
  at: Date
}

export type ReviewEntry = TimelineAction & {
  kind: "review"
  state: ReviewState
  reason?: string
}

export type RecommendationEntry = TimelineAction & {
  kind: "recommendation"
  /** Id of a `RECOMMENDATION_TARGETS` entry. */
  target: string
  note?: string
}

export type RecommendationRemovedEntry = TimelineAction & { kind: "recommendation-removed" }

/** One action on a registration: append-only, the source of truth of its reviews and status. */
export type TimelineEntry = ReviewEntry | RecommendationEntry | RecommendationRemovedEntry

/** Latest review of each reviewer holding a place: going back to pending frees it. */
export function currentReviews(timeline: TimelineEntry[]) {
  const latest = new Map<string, ReviewEntry>()
  for (const entry of timeline) {
    if (entry.kind === "review") latest.set(entry.actorId, entry)
  }
  return [...latest.values()].filter((review) => review.state !== "pending")
}

/** Whether this person ever reviewed the registration: only their first review needs a reason. */
export function hasReviewed(timeline: TimelineEntry[], actorId: string) {
  return timeline.some((entry) => entry.kind === "review" && entry.actorId === actorId)
}

/** The recommendation this person has on the registration now, if any. */
export function currentRecommendation(timeline: TimelineEntry[], actorId: string) {
  const latest = timeline.findLast((entry) => entry.actorId === actorId && entry.kind !== "review")
  return latest?.kind === "recommendation" ? latest : undefined
}

/** Everyone recommending the registration now, for the recommendations page. */
export function currentRecommendations(timeline: TimelineEntry[]) {
  const latest = new Map<string, RecommendationEntry | RecommendationRemovedEntry>()
  for (const entry of timeline) {
    if (entry.kind !== "review") latest.set(entry.actorId, entry)
  }
  return [...latest.values()].flatMap((entry) =>
    entry.kind === "recommendation"
      ? [{ actorId: entry.actorId, actorName: entry.actorName, target: entry.target }]
      : [],
  )
}

/**
 * State of a registration: `pending` until two people reviewed it, `interview` as soon as one of
 * them asks for it, otherwise their shared answer, or `conflict` when they disagree.
 */
export function registrationStatus(timeline: TimelineEntry[]): RegistrationStatus {
  const states = currentReviews(timeline).map((review) => review.state)
  if (states.length < MAX_REVIEWERS) return "pending"
  if (states.includes("interview")) return "interview"
  return states[0] === states[1] ? states[0] : "conflict"
}
