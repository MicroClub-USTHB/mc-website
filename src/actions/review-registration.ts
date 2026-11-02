"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { adminRoutes } from "@/config/admin"
import { requireStaff } from "@/lib/auth/session"
import {
  recommendationSchema,
  reviewSchema,
  type RecommendationInput,
  type ReviewInput,
} from "@/lib/registrations/review-schema"
import {
  recordRecommendation,
  recordReview,
  removeRecommendationOf,
  type TimelineActor,
  type TimelineResult,
} from "@/lib/registrations/timeline-store"

const registrationIdSchema = z.string().min(1)

const INVALID: TimelineResult = { status: "error", message: "Check the form and try again." }
const FAILED: TimelineResult = { status: "error", message: "It could not be saved. Try again." }

async function reviewer(): Promise<TimelineActor> {
  const { user } = await requireStaff({ permissions: { registration: ["review"] } })
  return { id: user.id, name: user.name }
}

/** Runs a timeline change, then refreshes the list and the page, even for a refused change. */
async function applyChange(change: () => Promise<TimelineResult>) {
  try {
    const result = await change()
    revalidatePath(adminRoutes.registrations, "layout")
    return result
  } catch (error) {
    console.error("Registration timeline: saving failed", error)
    return FAILED
  }
}

export async function reviewRegistration(id: string, input: ReviewInput) {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  const parsed = reviewSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) return INVALID
  return applyChange(() => recordReview(parsedId.data, actor, parsed.data))
}

export async function recommendRegistration(id: string, input: RecommendationInput) {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  const parsed = recommendationSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) return INVALID
  return applyChange(() => recordRecommendation(parsedId.data, actor, parsed.data))
}

export async function removeRecommendation(id: string) {
  const actor = await reviewer()
  const parsedId = registrationIdSchema.safeParse(id)
  if (!parsedId.success) return INVALID
  return applyChange(() => removeRecommendationOf(parsedId.data, actor))
}
