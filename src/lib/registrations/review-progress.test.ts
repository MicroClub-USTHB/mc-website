import { describe, expect, it } from "vitest"

import {
  finalDecisionAt,
  firstDecisions,
  reachedMilestone,
  reviewProgress,
  type ProgressRegistration,
} from "@/lib/registrations/review-progress"
import type { ReviewState } from "@/lib/registrations/status"
import type { TimelineEntry } from "@/lib/registrations/timeline"

const now = new Date("2026-11-10T12:00:00Z")

function review(actorId: string, state: ReviewState, daysAgo = 0): TimelineEntry {
  return {
    kind: "review",
    actorId,
    actorName: actorId,
    state,
    at: new Date(now.getTime() - daysAgo * 86_400_000),
  }
}

describe("firstDecisions", () => {
  it("counts each member's first decision once, not pending or later changes", () => {
    const timeline = [
      review("a", "pending", 3),
      review("a", "accepted", 2),
      review("a", "rejected", 1),
      review("b", "interview", 1),
    ]
    expect(firstDecisions(timeline).map((decision) => decision.actorId)).toEqual(["a", "b"])
    expect(firstDecisions(timeline)[0].at).toEqual(review("a", "accepted", 2).at)
  })
})

describe("reviewProgress", () => {
  const registrations: ProgressRegistration[] = [
    { timeline: [review("a", "accepted", 1), review("b", "accepted", 1)], status: "accepted" },
    { timeline: [review("b", "rejected", 2)], status: "pending" },
    { timeline: [review("a", "accepted", 5), review("b", "rejected", 0)], status: "conflict" },
    { timeline: [], status: "pending" },
  ]
  const progress = reviewProgress({
    registrations,
    userId: "a",
    now,
    deadlines: { reviews: null, decisions: null },
  })

  it("measures the team against two reviews per registration", () => {
    expect(progress.team).toMatchObject({ total: 8, done: 5, remaining: 3, percent: 62 })
    expect(progress.team.needYou).toBe(1)
  })

  it("averages the team pace over three days and predicts the finish", () => {
    // Four first decisions in the last three days: a, b (1 day), b (2 days), b (today).
    expect(progress.team.pace).toBeCloseTo(4 / 3)
    expect(progress.team.finishAt).toEqual(new Date(now.getTime() + 2 * 86_400_000))
  })

  it("asks for the pace a deadline needs", () => {
    const deadline = new Date(now.getTime() + 2 * 86_400_000)
    expect(
      reviewProgress({
        registrations,
        userId: "a",
        now,
        deadlines: { reviews: deadline, decisions: deadline },
      }).team.neededPace,
    ).toBe(2)
  })

  it("has no finish date without a pace", () => {
    const idle = reviewProgress({
      registrations: [{ timeline: [], status: "pending" }],
      userId: "a",
      now,
      deadlines: { reviews: null, decisions: null },
    })
    expect(idle.team.finishAt).toBeNull()
  })
})

describe("final decisions", () => {
  it("dates the answer from the entry that made it final, and counts only final ones", () => {
    const timeline = [
      review("a", "interview", 3),
      review("b", "accepted", 3),
      review("a", "accepted", 1),
    ]
    expect(finalDecisionAt(timeline)).toEqual(review("a", "accepted", 1).at)
    expect(finalDecisionAt([review("a", "interview", 1), review("b", "accepted", 1)])).toBeNull()
  })

  it("measures every registration against a final answer, with the deadline pace", () => {
    const deadline = new Date(now.getTime() + 2 * 86_400_000)
    const registrations: ProgressRegistration[] = [
      { timeline: [review("a", "accepted", 1), review("b", "accepted", 1)], status: "accepted" },
      { timeline: [review("a", "interview", 1), review("b", "accepted", 1)], status: "interview" },
      { timeline: [], status: "pending" },
    ]
    const { decisions } = reviewProgress({
      registrations,
      userId: "a",
      now,
      deadlines: { reviews: null, decisions: deadline },
    })
    expect(decisions).toMatchObject({ total: 3, done: 1, remaining: 2, percent: 33, neededPace: 1 })
  })
})

describe("reachedMilestone", () => {
  it("returns the highest step reached", () => {
    expect(reachedMilestone(10)).toBeNull()
    expect(reachedMilestone(62)).toBe(50)
    expect(reachedMilestone(100)).toBe(100)
  })
})
