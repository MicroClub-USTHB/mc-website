import {
  currentRecommendation,
  currentReviews,
  type TimelineEntry,
} from "@/lib/registrations/timeline"

/** One HR member's standing decisions across every registration. */
export type MemberActivity = {
  actorId: string
  name: string
  interview: number
  accepted: number
  rejected: number
  /** Registrations whose current recommendation is theirs. */
  recommended: number
  /** Their latest action of any kind. */
  lastActiveAt: Date
}

/**
 * What each HR member decided, from the timelines: their current review of each registration
 * (a later change replaces an earlier one, going back to pending removes it) and the current
 * recommendations they made. Most active first.
 */
export function teamActivity(timelines: TimelineEntry[][]): MemberActivity[] {
  const members = new Map<string, MemberActivity>()
  const member = (entry: TimelineEntry) => {
    let activity = members.get(entry.actorId)
    if (!activity) {
      activity = {
        actorId: entry.actorId,
        name: entry.actorName,
        interview: 0,
        accepted: 0,
        rejected: 0,
        recommended: 0,
        lastActiveAt: new Date(entry.at),
      }
      members.set(entry.actorId, activity)
    }
    return activity
  }

  for (const timeline of timelines) {
    for (const entry of timeline) {
      const activity = member(entry)
      if (new Date(entry.at) >= activity.lastActiveAt) {
        activity.lastActiveAt = new Date(entry.at)
        activity.name = entry.actorName
      }
    }
    for (const review of currentReviews(timeline)) {
      if (review.state !== "pending") member(review)[review.state] += 1
    }
    const recommendation = currentRecommendation(timeline)
    if (recommendation) member(recommendation).recommended += 1
  }

  const total = (activity: MemberActivity) =>
    activity.interview + activity.accepted + activity.rejected + activity.recommended
  return [...members.values()].sort(
    (a, b) => total(b) - total(a) || b.lastActiveAt.getTime() - a.lastActiveAt.getTime(),
  )
}
