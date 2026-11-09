import { describe, expect, it } from "vitest"

import {
  dayKey,
  dayLanes,
  fromDateTimeInput,
  interviewScheduleSchema,
  monthWeeks,
  toDateTimeInput,
  weekDays,
} from "@/lib/registrations/interview"

describe("datetime-local values", () => {
  it("reads and writes club time (UTC+1)", () => {
    const date = fromDateTimeInput("2026-11-09T14:30")
    expect(date?.toISOString()).toBe("2026-11-09T13:30:00.000Z")
    expect(toDateTimeInput(date)).toBe("2026-11-09T14:30")
  })

  it("treats empty and invalid values as none", () => {
    expect(fromDateTimeInput("")).toBeNull()
    expect(fromDateTimeInput("tomorrow")).toBeNull()
    expect(toDateTimeInput(null)).toBe("")
  })
})

describe("calendar days", () => {
  it("keys a moment by its club day", () => {
    expect(dayKey("2026-11-09T23:30:00Z")).toBe("2026-11-10")
  })

  it("starts weeks on Sunday", () => {
    const days = weekDays("2026-11-11T10:00:00Z").map(dayKey)
    expect(days[0]).toBe("2026-11-08")
    expect(days[6]).toBe("2026-11-14")
  })

  it("shows whole weeks covering the month", () => {
    const weeks = monthWeeks("2026-11-15T10:00:00Z")
    expect(dayKey(weeks[0][0])).toBe("2026-11-01")
    expect(dayKey(weeks.at(-1)!.at(-1)!)).toBe("2026-12-05")
  })
})

describe("dayLanes", () => {
  it("puts overlapping interviews side by side and lone ones full width", () => {
    expect(dayLanes([600, 610, 700])).toEqual([
      { lane: 0, lanes: 2 },
      { lane: 1, lanes: 2 },
      { lane: 0, lanes: 1 },
    ])
  })

  it("reuses a lane once it is free", () => {
    expect(dayLanes([600, 615, 630])).toEqual([
      { lane: 0, lanes: 2 },
      { lane: 1, lanes: 2 },
      { lane: 0, lanes: 2 },
    ])
  })
})

describe("interviewScheduleSchema", () => {
  it("accepts an empty schedule and refuses a bad date", () => {
    expect(interviewScheduleSchema.safeParse({ at: "", interviewerId: "" }).success).toBe(true)
    expect(interviewScheduleSchema.safeParse({ at: "nope", interviewerId: "" }).success).toBe(false)
  })
})
