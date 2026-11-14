import { z } from "zod"

import { isRecommendationTarget } from "@/lib/registrations/recommendations"
import { REVIEW_STATES } from "@/lib/registrations/status"
import { FINAL_DECISIONS } from "@/lib/registrations/timeline"

/** Longest reason or note accepted on the timeline. */
export const REVIEW_TEXT_MAX_LENGTH = 1000

const reviewText = z
  .string()
  .trim()
  .max(REVIEW_TEXT_MAX_LENGTH, `Keep it under ${REVIEW_TEXT_MAX_LENGTH} characters.`)

/**
 * A review: its state, the reason, and for an interview the questions to ask in it (kept only
 * with `interview`), so whichever HR member hosts the interview knows them.
 */
export const reviewSchema = z.object({
  state: z.enum(REVIEW_STATES),
  reason: reviewText,
  questions: reviewText.default(""),
})

export const recommendationSchema = z.object({
  target: z.string().refine(isRecommendationTarget, "Choose a section or a department."),
  note: reviewText,
})

/** The final decision after the interview, with an optional note for the team. */
export const finalDecisionSchema = z.object({
  state: z.enum(FINAL_DECISIONS, "Choose accepted or refused."),
  note: reviewText,
})

export type FinalDecisionInput = z.infer<typeof finalDecisionSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type RecommendationInput = z.infer<typeof recommendationSchema>
