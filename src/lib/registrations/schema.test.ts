import { describe, expect, it } from "vitest"

import { normalizePhone, parseBirthDate } from "@/lib/registrations/schema"

describe("normalizePhone", () => {
  it.each([
    ["0555 12 34 56", "555123456"],
    ["+213 555-12-34-56", "555123456"],
    ["00213555123456", "555123456"],
    ["(0555) 123 456", "555123456"],
  ])("%s -> %s", (typed, digits) => {
    expect(normalizePhone(typed)).toBe(digits)
  })
})

describe("parseBirthDate", () => {
  it("reads an existing day", () => {
    expect(parseBirthDate("12/05/2004")?.toISOString()).toBe("2004-05-12T00:00:00.000Z")
    expect(parseBirthDate("29/02/2004")).not.toBeNull()
  })

  it("refuses days that do not exist and other formats", () => {
    expect(parseBirthDate("29/02/2005")).toBeNull()
    expect(parseBirthDate("31/04/2004")).toBeNull()
    expect(parseBirthDate("2004-05-12")).toBeNull()
    expect(parseBirthDate("1/5/2004")).toBeNull()
  })
})
