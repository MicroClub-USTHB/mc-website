"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import { interviewScheduleSchema, type InterviewScheduleInput } from "@/lib/registrations/interview"
import { saveInterview } from "@/lib/registrations/interview-store"
import type { PlaceSource } from "@/lib/registrations/place"
import { saveReviewPlace } from "@/lib/registrations/place-store"
import {
  finalDecisionSchema,
  recommendationSchema,
  reviewSchema,
  type FinalDecisionInput,
  type RecommendationInput,
  type ReviewInput,
} from "@/lib/registrations/review-schema"
import {
  recordFinalDecision,
  recordRecommendation,
  recordReview,
  removeRecommendation as clearRecommendation,
  type TimelineActor,
  type TimelineResult,
} from "@/lib/registrations/timeline-store"

const registrationIdSchema = z.string().min(1)
/** `location.search` of the registration page: the list the member is walking through. */
const searchSchema = z.string().max(2000).catch("")

const INVALID: TimelineResult = { status: "error", message: "Check the form and try again." }
const FAILED: TimelineResult = { status: "error", message: "It could not be saved. Try again." }

async function reviewer(): Promise<TimelineActor> {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  return { id: user.id, name: user.name }
}

/**
 * Runs a timeline change, then refreshes the lists and the page, even for a refused change. A
 * saved change also becomes the member's place (`place.ts`); that one is best effort.
 */
async function applyChange(
  change: () => Promise<TimelineResult>,
  place?: { actor: TimelineActor; id: string; search: unknown; source: PlaceSource },
) {
  try {
    const result = await change()
    if (result.status === "success" && place) {
      await saveReviewPlace(
        place.actor.id,
        place.id,
        searchSchema.parse(place.search),
        place.source,
      ).catch((error) => console.error("Review place: saving failed", error))
    }
    revalidatePath(adminRoutes.registrations, "layout")
    revalidatePath(adminRoutes.recommendations)
    revalidatePath(adminRoutes.calendar)
    return result
  } catch (error) {
    console.error("Registration timeline: saving failed", error)
    return FAILED
  }
}

/**
 * Records a review. Asking for an interview can also set its date and host (`interview`); when
 * only those change, the review itself is left as it is.
 */
export async function reviewRegistration(
  id: string,
  input: ReviewInput,
  search = "",
  interview?: InterviewScheduleInput & { scheduleOnly?: boolean },
) {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  const parsed = reviewSchema.safeParse(input)
  const schedule = interview && interviewScheduleSchema.safeParse(interview)
  if (!parsedId.success || !parsed.success || (schedule && !schedule.success)) return INVALID
  const scheduleInput = parsed.data.state === "interview" ? schedule?.data : undefined
  return applyChange(
    async () => {
      const result = interview?.scheduleOnly
        ? ({ status: "success" } as const)
        : await recordReview(parsedId.data, actor, parsed.data)
      if (result.status === "success" && scheduleInput) {
        return saveInterview(parsedId.data, actor, scheduleInput)
      }
      return result
    },
    {
      actor,
      id: parsedId.data,
      search,
      source: "review",
    },
  )
}

export async function recommendRegistration(id: string, input: RecommendationInput, search = "") {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  const parsed = recommendationSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) return INVALID
  return applyChange(() => recordRecommendation(parsedId.data, actor, parsed.data), {
    actor,
    id: parsedId.data,
    search,
    source: "recommendation",
  })
}

/** Sets an interview's date and host from the calendar, whoever asked for the interview. */
export async function scheduleInterview(id: string, input: InterviewScheduleInput) {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  const parsed = interviewScheduleSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) return INVALID
  return applyChange(() => saveInterview(parsedId.data, actor, parsed.data))
}

export async function removeRecommendation(id: string) {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  if (!parsedId.success) return INVALID
  return applyChange(() => clearRecommendation(parsedId.data, actor))
}

/** The final decision after the interview, by any HR member: sets the registration's status. */
export async function decideRegistration(id: string, input: FinalDecisionInput, search = "") {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  const parsed = finalDecisionSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) return INVALID
  return applyChange(() => recordFinalDecision(parsedId.data, actor, parsed.data), {
    actor,
    id: parsedId.data,
    search,
    source: "review",
  })
}
