import { describe, expect, it } from "vitest"

import { formatCalendarDate, formatClubTime } from "./dates"

describe("formatClubTime", () => {
  it("shows a UTC moment in Algiers time", () => {
    expect(formatClubTime(new Date("2026-11-05T21:56:00Z"), "d MMM yyyy HH:mm")).toBe(
      "5 Nov 2026 22:56",
    )
  })

  it("moves a late evening UTC moment to the next day", () => {
    expect(formatClubTime("2026-11-05T23:30:00.000Z", "d MMM yyyy")).toBe("6 Nov 2026")
  })
})

describe("formatCalendarDate", () => {
  it("keeps a birth date stored as midnight UTC on its day", () => {
    expect(formatCalendarDate(new Date(Date.UTC(2004, 2, 1)), "d MMMM yyyy")).toBe("1 March 2004")
  })
})
