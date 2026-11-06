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

/** The review entries of a document's timeline, in a MongoDB expression. */
const REVIEW_ENTRIES = {
  $filter: {
    input: { $ifNull: ["$timeline", []] },
    as: "entry",
    cond: { $eq: ["$$entry.kind", "review"] },
  },
}

/**
 * MongoDB filter: exactly one reviewer holds a place. The same rule as `currentReviews`, in the
 * database's terms (change both together): the latest review of each person, unless pending.
 */
export const ONE_REVIEWER_FILTER = {
  $expr: {
    $eq: [
      {
        $size: {
          $filter: {
            input: { $setUnion: [{ $map: { input: REVIEW_ENTRIES, in: "$$this.actorId" } }] },
            as: "actorId",
            cond: {
              $ne: [
                {
                  $let: {
                    vars: {
                      latest: {
                        $last: {
                          $filter: {
                            input: REVIEW_ENTRIES,
                            as: "review",
                            cond: { $eq: ["$$review.actorId", "$$actorId"] },
                          },
                        },
                      },
                    },
                    in: "$$latest.state",
                  },
                },
                "pending",
              ],
            },
          },
        },
      },
      1,
    ],
  },
}

/**
 * Who decided on a registration, for the admin tables: each reviewer holding a place and their
 * decision, the latest decision first.
 */
export function decisions(timeline: TimelineEntry[]) {
  return currentReviews(timeline)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .map((review) => ({ name: review.actorName, state: review.state }))
}

/** Whether this person ever reviewed the registration: only their first review needs a reason. */
export function hasReviewed(timeline: TimelineEntry[], actorId: string) {
  return timeline.some((entry) => entry.kind === "review" && entry.actorId === actorId)
}

/**
 * The registration's recommendation now: one per application, the latest made by any HR member
 * (a newer one replaces it, a removal clears it). The earlier ones stay in the timeline only.
 */
export function currentRecommendation(timeline: TimelineEntry[]) {
  const latest = timeline.findLast(
    (entry): entry is RecommendationEntry | RecommendationRemovedEntry => entry.kind !== "review",
  )
  return latest?.kind === "recommendation" ? latest : undefined
}

/**
 * The current recommendation as stored on the registration for the recommendations page (a list,
 * of one at most, so the page filters on it like on any array).
 */
export function currentRecommendations(timeline: TimelineEntry[]) {
  const recommendation = currentRecommendation(timeline)
  return recommendation
    ? [
        {
          actorId: recommendation.actorId,
          actorName: recommendation.actorName,
          target: recommendation.target,
        },
      ]
    : []
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
