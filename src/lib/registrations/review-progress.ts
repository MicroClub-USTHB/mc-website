import { addDays } from "date-fns"

import type { RegistrationStatus } from "@/lib/registrations/status"
import {
  MAX_REVIEWERS,
  currentReviews,
  registrationStatus,
  type TimelineEntry,
} from "@/lib/registrations/timeline"

/** Days the team pace is averaged over: recent enough to react, long enough to be steady. */
export const TEAM_PACE_DAYS = 3
/** Team progress steps celebrated once, in percent. */
export const MILESTONES = [25, 50, 75, 100] as const

export type ProgressRegistration = { timeline: TimelineEntry[]; status: RegistrationStatus }

/**
 * When each member first decided on a registration (interview, accepted or rejected): the work
 * counted for pace. Later changes, going back to pending and edits of questions do not count.
 */
export function firstDecisions(timeline: TimelineEntry[]) {
  const first = new Map<string, Date>()
  for (const entry of timeline) {
    if (entry.kind !== "review" || entry.state === "pending" || first.has(entry.actorId)) continue
    first.set(entry.actorId, new Date(entry.at))
  }
  return [...first].map(([actorId, at]) => ({ actorId, at }))
}

/** Average decisions a day over the last `days` days, today included. */
function pace(dates: Date[], now: Date, days: number) {
  const since = addDays(now, -days)
  return dates.filter((date) => date > since && date <= now).length / days
}

/** The day `remaining` work is done at `perDay` a day, or `null` without a pace. */
function finishDate(remaining: number, perDay: number, now: Date) {
  if (remaining <= 0) return now
  if (perDay <= 0) return null
  // Today counts as the first working day.
  return addDays(now, Math.ceil(remaining / perDay) - 1)
}

/** Whole days left until `deadline`, at least 1, or `null` without one. */
function daysUntil(deadline: Date | null, now: Date) {
  return deadline ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000)) : null
}

/** A final answer: what the interviews stage ends with. */
function isFinal(status: RegistrationStatus) {
  return status === "accepted" || status === "rejected"
}

/**
 * When a registration got its final answer (accepted or rejected, and still so), from its
 * timeline: the entry after which it stayed final. `null` while it has none.
 */
export function finalDecisionAt(timeline: TimelineEntry[]) {
  if (!isFinal(registrationStatus(timeline))) return null
  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    if (!isFinal(registrationStatus(timeline.slice(0, index)))) return new Date(timeline[index].at)
  }
  return null
}

/**
 * The team's progress toward two reviews per registration, its pace and when it finishes; with a
 * deadline, the daily pace needed to meet it; then the same for the final answers.
 */
export function reviewProgress({
  registrations,
  userId,
  now,
  deadlines,
}: {
  registrations: ProgressRegistration[]
  userId: string
  now: Date
  /** Two reviews on every registration, then every final answer (interviews done). */
  deadlines: { reviews: Date | null; decisions: Date | null }
}) {
  const total = registrations.length * MAX_REVIEWERS
  let done = 0
  let needYou = 0
  let decided = 0
  const decisionDates: Date[] = []
  const teamDates: Date[] = []

  for (const { timeline } of registrations) {
    const reviews = currentReviews(timeline)
    const reviewedByMe = reviews.some((review) => review.actorId === userId)
    done += Math.min(reviews.length, MAX_REVIEWERS)
    if (reviews.length === 1 && !reviewedByMe) needYou += 1
    const finalAt = finalDecisionAt(timeline)
    if (finalAt) {
      decided += 1
      decisionDates.push(finalAt)
    }
    for (const decision of firstDecisions(timeline)) teamDates.push(decision.at)
  }

  const remaining = total - done
  const teamPace = pace(teamDates, now, TEAM_PACE_DAYS)
  const daysLeft = daysUntil(deadlines.reviews, now)
  const decisionsLeft = registrations.length - decided
  const decisionPace = pace(decisionDates, now, TEAM_PACE_DAYS)
  const decisionDaysLeft = daysUntil(deadlines.decisions, now)

  const teamFinish = finishDate(remaining, teamPace, now)

  return {
    team: {
      total,
      done,
      remaining,
      percent: total > 0 ? Math.floor((done / total) * 100) : 100,
      pace: teamPace,
      finishAt: teamFinish,
      /** Reviews a day needed to finish by the deadline. */
      neededPace: daysLeft ? Math.ceil(remaining / daysLeft) : null,
      /** Registrations reviewed once, by someone else: they only need one more. */
      needYou,
    },
    /** Final answers: every registration accepted or rejected, once the interviews are done. */
    decisions: {
      total: registrations.length,
      done: decided,
      remaining: decisionsLeft,
      percent: registrations.length > 0 ? Math.floor((decided / registrations.length) * 100) : 100,
      pace: decisionPace,
      finishAt: finishDate(decisionsLeft, decisionPace, now),
      neededPace: decisionDaysLeft ? Math.ceil(decisionsLeft / decisionDaysLeft) : null,
    },
  }
}

export type ReviewProgress = ReturnType<typeof reviewProgress>

/** The highest milestone the team reached, or `null` before the first. */
export function reachedMilestone(percent: number) {
  return MILESTONES.findLast((milestone) => percent >= milestone) ?? null
}
