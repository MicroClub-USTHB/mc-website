import { describe, expect, it } from "vitest"

import type { RegistrationStatus, ReviewState } from "@/lib/registrations/status"
import {
  currentRecommendation,
  currentRecommendations,
  currentReviews,
  decisions,
  hasReviewed,
  registrationStatus,
  type TimelineEntry,
} from "@/lib/registrations/timeline"

const at = new Date("2026-11-01T10:00:00Z")

function review(actorId: string, state: ReviewState): TimelineEntry {
  return { kind: "review", actorId, actorName: actorId, at, state }
}

function recommend(actorId: string, target: string): TimelineEntry {
  return { kind: "recommendation", actorId, actorName: actorId, at, target }
}

function unrecommend(actorId: string): TimelineEntry {
  return { kind: "recommendation-removed", actorId, actorName: actorId, at }
}

describe("registrationStatus", () => {
  // The two reviewers' states and the status they give, in both orders.
  const table: [ReviewState, ReviewState, RegistrationStatus][] = [
    ["pending", "pending", "pending"],
    ["pending", "interview", "pending"],
    ["pending", "accepted", "pending"],
    ["pending", "rejected", "pending"],
    ["interview", "interview", "interview"],
    ["interview", "accepted", "interview"],
    ["interview", "rejected", "interview"],
    ["accepted", "accepted", "accepted"],
    ["rejected", "rejected", "rejected"],
    ["accepted", "rejected", "conflict"],
  ]

  it.each(table)("%s + %s = %s", (a, b, status) => {
    expect(registrationStatus([review("a", a), review("b", b)])).toBe(status)
    expect(registrationStatus([review("b", b), review("a", a)])).toBe(status)
  })

  it("is pending without reviews or with a single one", () => {
    expect(registrationStatus([])).toBe("pending")
    expect(registrationStatus([review("a", "accepted")])).toBe("pending")
  })

  it("follows each reviewer's latest review", () => {
    const timeline = [review("a", "rejected"), review("b", "accepted"), review("a", "accepted")]
    expect(registrationStatus(timeline)).toBe("accepted")
  })

  it("ignores recommendations", () => {
    const timeline = [review("a", "accepted"), recommend("c", "dev"), review("b", "accepted")]
    expect(registrationStatus(timeline)).toBe("accepted")
  })
})

describe("currentReviews", () => {
  it("frees the place of a reviewer back to pending", () => {
    const timeline = [review("a", "accepted"), review("b", "rejected"), review("b", "pending")]
    expect(currentReviews(timeline).map((entry) => entry.actorId)).toEqual(["a"])
  })
})

describe("hasReviewed", () => {
  it("counts any past review, pending included", () => {
    const timeline = [review("a", "accepted"), review("a", "pending")]
    expect(hasReviewed(timeline, "a")).toBe(true)
    expect(hasReviewed(timeline, "b")).toBe(false)
  })
})

describe("recommendations", () => {
  const timeline = [
    recommend("a", "dev"),
    recommend("b", "design"),
    recommend("a", "robotics"),
    unrecommend("b"),
  ]

  it("keeps one recommendation, the latest, whoever made it", () => {
    expect(currentRecommendation([recommend("a", "dev"), recommend("b", "design")])).toMatchObject({
      actorId: "b",
      target: "design",
    })
    expect(
      currentRecommendation([recommend("a", "dev"), recommend("a", "robotics")]),
    ).toMatchObject({
      actorId: "a",
      target: "robotics",
    })
  })

  it("is cleared by a removal, until the next recommendation", () => {
    expect(currentRecommendation(timeline)).toBeUndefined()
    expect(currentRecommendation([...timeline, recommend("c", "dev")])).toMatchObject({
      actorId: "c",
    })
  })

  it("ignores reviews", () => {
    expect(currentRecommendation([recommend("a", "dev"), review("b", "accepted")])).toMatchObject({
      target: "dev",
    })
  })

  it("stores one recommendation at most", () => {
    expect(currentRecommendations(timeline)).toEqual([])
    expect(currentRecommendations([recommend("a", "dev"), recommend("b", "design")])).toEqual([
      { actorId: "b", actorName: "b", target: "design" },
    ])
  })
})

describe("decisions", () => {
  it("lists the reviewers holding a place, latest decision first", () => {
    const later = (actorId: string, state: ReviewState, minutes: number): TimelineEntry => ({
      kind: "review",
      actorId,
      actorName: actorId,
      at: new Date(at.getTime() + minutes * 60_000),
      state,
    })
    const timeline = [
      later("a", "accepted", 0),
      later("b", "rejected", 5),
      later("c", "interview", 10),
      later("c", "pending", 15),
    ]
    expect(decisions(timeline)).toEqual([
      { name: "b", state: "rejected" },
      { name: "a", state: "accepted" },
    ])
  })
})
