import { describe, expect, it } from "vitest"

import { parseWindow, parseWindowDate } from "@/lib/registrations/window"

describe("parseWindowDate", () => {
  it("reads a date with its offset", () => {
    expect(parseWindowDate("opensAt", "2026-11-10T09:00:00+01:00")).toBe(
      Date.UTC(2026, 10, 10, 8, 0, 0),
    )
    expect(parseWindowDate("opensAt", "2026-11-10T08:00Z")).toBe(Date.UTC(2026, 10, 10, 8, 0))
    expect(parseWindowDate("opensAt", null)).toBeNull()
  })

  it.each([
    "2026-11-10T09:00:00",
    "2026-11-10",
    "2026-11-1O T09:00:00+01:00",
    "2026-13-40T09:00:00+01:00",
    "10/11/2026 09:00",
    "",
  ])("refuses %j", (value) => {
    expect(() => parseWindowDate("opensAt", value)).toThrow(/REGISTRATIONS_WINDOW\.opensAt/)
  })
})

describe("parseWindow", () => {
  it("accepts a window that opens before it closes, or a single date", () => {
    expect(
      parseWindow({ opensAt: "2026-11-10T09:00:00+01:00", closesAt: "2026-11-20T23:59:00+01:00" }),
    ).toEqual({ opensAt: Date.UTC(2026, 10, 10, 8), closesAt: Date.UTC(2026, 10, 20, 22, 59) })
    expect(parseWindow({ opensAt: null, closesAt: null })).toEqual({
      opensAt: null,
      closesAt: null,
    })
  })

  it("refuses a window that closes before it opens", () => {
    expect(() =>
      parseWindow({ opensAt: "2026-11-20T09:00:00+01:00", closesAt: "2026-11-10T09:00:00+01:00" }),
    ).toThrow(/before closesAt/)
  })
})
