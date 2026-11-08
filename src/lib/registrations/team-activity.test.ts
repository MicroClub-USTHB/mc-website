import { describe, expect, it } from "vitest"

import { teamActivity } from "@/lib/registrations/team-activity"
import type { TimelineEntry } from "@/lib/registrations/timeline"

const at = (minute: number) => new Date(Date.UTC(2026, 10, 8, 10, minute))
const review = (
  actorId: string,
  state: "pending" | "interview" | "accepted" | "rejected",
  minute: number,
): TimelineEntry => ({
  kind: "review",
  actorId,
  actorName: actorId.toUpperCase(),
  at: at(minute),
  state,
})

describe("teamActivity", () => {
  it("counts each member's current review only", () => {
    const [a] = teamActivity([[review("a", "interview", 1), review("a", "accepted", 2)]])
    expect(a).toMatchObject({ actorId: "a", interview: 0, accepted: 1, lastActiveAt: at(2) })
  })

  it("drops a review taken back to pending but keeps the member", () => {
    const [a] = teamActivity([[review("a", "rejected", 1), review("a", "pending", 2)]])
    expect(a).toMatchObject({ rejected: 0, accepted: 0, interview: 0, lastActiveAt: at(2) })
  })

  it("credits the current recommendation to its author", () => {
    const members = teamActivity([
      [
        { kind: "recommendation", actorId: "a", actorName: "A", at: at(1), target: "dev" },
        { kind: "recommendation", actorId: "b", actorName: "B", at: at(2), target: "it" },
      ],
      [
        { kind: "recommendation", actorId: "a", actorName: "A", at: at(3), target: "dev" },
        { kind: "recommendation-removed", actorId: "b", actorName: "B", at: at(4) },
      ],
    ])
    expect(members.find((m) => m.actorId === "a")?.recommended).toBe(0)
    expect(members.find((m) => m.actorId === "b")?.recommended).toBe(1)
  })

  it("adds up across registrations, most active first", () => {
    const members = teamActivity([
      [review("a", "accepted", 1), review("b", "rejected", 2)],
      [review("b", "interview", 3)],
    ])
    expect(members.map((m) => [m.actorId, m.accepted, m.rejected, m.interview])).toEqual([
      ["b", 0, 1, 1],
      ["a", 1, 0, 0],
    ])
  })
})
