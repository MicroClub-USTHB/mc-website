import { describe, expect, it } from "vitest"

import type { RegistrationStatus, ReviewState } from "@/lib/registrations/status"
import {
  currentRecommendation,
  currentRecommendations,
  currentReviews,
  decisions,
  finalDecision,
  hasReviewed,
  interviewQuestions,
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
    ["interview", "accepted", "conflict"],
    ["interview", "rejected", "conflict"],
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

describe("interviewQuestions", () => {
  const ask = (actorId: string, questions: string, minute: number): TimelineEntry => ({
    kind: "review",
    actorId,
    actorName: actorId,
    state: "interview",
    at: new Date(at.getTime() + minute * 60_000),
    questions,
  })

  it("lists the questions of each reviewer still asking for an interview, latest first", () => {
    expect(interviewQuestions([ask("a", "Why us?", 1), ask("b", "Which project?", 2)])).toEqual([
      { actorId: "b", name: "b", questions: "Which project?" },
      { actorId: "a", name: "a", questions: "Why us?" },
    ])
  })

  it("keeps a reviewer's latest questions and drops them once they decide", () => {
    expect(interviewQuestions([ask("a", "Old", 1), ask("a", "New", 2)])).toEqual([
      { actorId: "a", name: "a", questions: "New" },
    ])
    expect(interviewQuestions([ask("a", "Why us?", 1), review("a", "accepted")])).toEqual([])
  })
})

describe("final decision", () => {
  function decide(actorId: string, state: "accepted" | "rejected"): TimelineEntry {
    return { kind: "final-decision", actorId, actorName: actorId, state, at }
  }
  const interview = [review("a", "interview"), review("b", "interview")]

  it("sets the status after the interview, whatever the reviews", () => {
    expect(registrationStatus(interview)).toBe("interview")
    expect(registrationStatus([...interview, decide("c", "accepted")])).toBe("accepted")
    expect(registrationStatus([...interview, decide("c", "rejected")])).toBe("rejected")
  })

  it("follows the latest final decision, even after later reviews", () => {
    expect(
      registrationStatus([
        ...interview,
        decide("c", "accepted"),
        decide("a", "rejected"),
        review("b", "accepted"),
      ]),
    ).toBe("rejected")
    expect(finalDecision([...interview, decide("c", "accepted")])?.actorId).toBe("c")
  })

  it("is not a recommendation", () => {
    expect(currentRecommendation([...interview, decide("c", "accepted")])).toBeUndefined()
  })
})
