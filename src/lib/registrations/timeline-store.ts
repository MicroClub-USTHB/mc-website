import "server-only"

import { isValidObjectId } from "mongoose"

import { connectToDatabase } from "@/lib/mongodb"
import { RegistrationModel } from "@/lib/registrations/model"
import type { RecommendationInput, ReviewInput } from "@/lib/registrations/review-schema"
import {
  MAX_REVIEWERS,
  currentRecommendation,
  currentRecommendations,
  currentReviews,
  hasReviewed,
  registrationStatus,
  type TimelineEntry,
} from "@/lib/registrations/timeline"

/** The signed-in HR member acting on a registration. */
export type TimelineActor = { id: string; name: string }

export type TimelineResult = { status: "success" } | { status: "error"; message: string }

const SUCCESS: TimelineResult = { status: "success" }

function failure(message: string): TimelineResult {
  return { status: "error", message }
}

const NOT_FOUND = "This registration no longer exists."
const CHANGED = "This application just changed. Check it and try again."

/** Timeline of a registration, or `null` when the id is malformed or unknown. */
async function readTimeline(id: string) {
  if (!isValidObjectId(id)) return null
  await connectToDatabase()
  const registration = await RegistrationModel.findById(id).select("timeline").lean()
  if (!registration) return null
  // Registrations submitted before the timeline existed have no such field.
  return (registration.timeline ?? []) as TimelineEntry[]
}

/**
 * Appends an entry and what it leads to, in one atomic update. It only applies if nothing was
 * added since `timeline` was read: two people cannot take the last place at the same time.
 */
async function append(id: string, timeline: TimelineEntry[], entry: TimelineEntry) {
  const next = [...timeline, entry]
  const { modifiedCount } = await RegistrationModel.updateOne(
    { _id: id, [`timeline.${timeline.length}`]: { $exists: false } },
    {
      $push: { timeline: entry },
      $set: { status: registrationStatus(next), recommendations: currentRecommendations(next) },
    },
  )
  return modifiedCount > 0 ? SUCCESS : failure(CHANGED)
}

export async function recordReview(
  id: string,
  actor: TimelineActor,
  { state, reason, questions }: ReviewInput,
) {
  const timeline = await readTimeline(id)
  if (!timeline) return failure(NOT_FOUND)

  const reviews = currentReviews(timeline)
  const review = reviews.find((entry) => entry.actorId === actor.id)
  // Staying in interview only changes its questions.
  const interviewQuestions = state === "interview" ? questions : ""
  if (
    state === (review?.state ?? "pending") &&
    (state !== "interview" || interviewQuestions === (review?.questions ?? ""))
  ) {
    return failure(CHANGED)
  }
  if (!review && reviews.length >= MAX_REVIEWERS) {
    return failure("Two HR members are already reviewing this application.")
  }
  if (!reason && !hasReviewed(timeline, actor.id)) {
    return failure("Give the reason for your first review.")
  }

  return append(id, timeline, {
    kind: "review",
    actorId: actor.id,
    actorName: actor.name,
    at: new Date(),
    state,
    ...(reason && { reason }),
    ...(interviewQuestions && { questions: interviewQuestions }),
  })
}

export async function recordRecommendation(
  id: string,
  actor: TimelineActor,
  { target, note }: RecommendationInput,
) {
  const timeline = await readTimeline(id)
  if (!timeline) return failure(NOT_FOUND)

  // Any HR member's recommendation replaces the current one; the same one again changes nothing.
  const recommendation = currentRecommendation(timeline)
  const same =
    recommendation?.actorId === actor.id &&
    recommendation.target === target &&
    (recommendation.note ?? "") === note
  if (same) return SUCCESS

  return append(id, timeline, {
    kind: "recommendation",
    actorId: actor.id,
    actorName: actor.name,
    at: new Date(),
    target,
    ...(note && { note }),
  })
}

/** Clears the registration's recommendation, whoever made it (it stays in the timeline). */
export async function removeRecommendation(id: string, actor: TimelineActor) {
  const timeline = await readTimeline(id)
  if (!timeline) return failure(NOT_FOUND)
  if (!currentRecommendation(timeline)) return SUCCESS

  return append(id, timeline, {
    kind: "recommendation-removed",
    actorId: actor.id,
    actorName: actor.name,
    at: new Date(),
  })
}
