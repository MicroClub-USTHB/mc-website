import { describe, expect, it } from "vitest"

import {
  dayKey,
  dayLanes,
  interviewScheduleSchema,
  monthWeeks,
  scheduleMoments,
  scheduleParts,
  shiftTime,
  weekDays,
} from "@/lib/registrations/interview"

describe("schedule parts", () => {
  it("reads and writes club time (UTC+1)", () => {
    const moments = scheduleMoments({ date: "2026-11-09", start: "14:30", end: "15:15" })
    expect(moments?.at.toISOString()).toBe("2026-11-09T13:30:00.000Z")
    expect(moments?.endAt.toISOString()).toBe("2026-11-09T14:15:00.000Z")
    expect(scheduleParts(moments?.at, moments?.endAt)).toEqual({
      date: "2026-11-09",
      start: "14:30",
      end: "15:15",
    })
  })

  it("ends 30 minutes after the start by default, and is empty without a date", () => {
    expect(scheduleParts("2026-11-09T13:30:00Z").end).toBe("15:00")
    expect(scheduleParts(null)).toEqual({ date: "", start: "", end: "" })
    expect(scheduleMoments({ date: "", start: "10:00", end: "10:30" })).toBeNull()
  })

  it("shifts times within the day", () => {
    expect(shiftTime("10:45", 30)).toBe("11:15")
    expect(shiftTime("23:45", 30)).toBe("23:59")
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
    const half = (start: number) => ({ start, end: start + 30 })
    expect(dayLanes([half(600), half(610), half(700)])).toEqual([
      { lane: 0, lanes: 2 },
      { lane: 1, lanes: 2 },
      { lane: 0, lanes: 1 },
    ])
  })

  it("reuses a lane once it is free", () => {
    const half = (start: number) => ({ start, end: start + 30 })
    expect(dayLanes([half(600), half(615), half(630)])).toEqual([
      { lane: 0, lanes: 2 },
      { lane: 1, lanes: 2 },
      { lane: 0, lanes: 2 },
    ])
  })
})

describe("interviewScheduleSchema", () => {
  const parse = (value: Partial<Record<"date" | "start" | "end", string>>) =>
    interviewScheduleSchema.safeParse({
      date: "",
      start: "",
      end: "",
      interviewerId: "",
      ...value,
    }).success

  it("accepts an empty schedule or a day with an interval", () => {
    expect(parse({})).toBe(true)
    expect(parse({ date: "2026-11-09", start: "10:00", end: "10:30" })).toBe(true)
  })

  it("refuses a day without times, or an end before the start", () => {
    expect(parse({ date: "2026-11-09" })).toBe(false)
    expect(parse({ date: "2026-11-09", start: "10:30", end: "10:00" })).toBe(false)
    expect(parse({ date: "nope", start: "10:00", end: "10:30" })).toBe(false)
  })
})
