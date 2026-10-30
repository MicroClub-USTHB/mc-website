import { z } from "zod"

import { isRecommendationTarget } from "@/lib/registrations/recommendations"
import { REVIEW_STATES } from "@/lib/registrations/status"

/** Longest reason or note accepted on the timeline. */
export const REVIEW_TEXT_MAX_LENGTH = 1000

const reviewText = z
  .string()
  .trim()
  .max(REVIEW_TEXT_MAX_LENGTH, `Keep it under ${REVIEW_TEXT_MAX_LENGTH} characters.`)

export const reviewSchema = z.object({ state: z.enum(REVIEW_STATES), reason: reviewText })

export const recommendationSchema = z.object({
  target: z.string().refine(isRecommendationTarget, "Choose a section or a department."),
  note: reviewText,
})

export type ReviewInput = z.infer<typeof reviewSchema>
export type RecommendationInput = z.infer<typeof recommendationSchema>
