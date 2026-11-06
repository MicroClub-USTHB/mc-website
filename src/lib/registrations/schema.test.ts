import { describe, expect, it } from "vitest"

import {
  normalizePhone,
  parseBirthDate,
  REGISTRATION_HONEYPOT_FIELD,
} from "@/lib/registrations/schema"

/** Words browser autofill and password managers recognize in a field's name (Chrome's heuristics, simplified). */
const AUTOFILL_WORDS =
  /company|business|organi[sz]ation|firm|website|url|homepage|name|e-?mail|phone|tel|mobile|address|street|city|zip|postal|country|state|birth|card|user|login|password/i

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

describe("REGISTRATION_HONEYPOT_FIELD", () => {
  // Autofill filled the old `company` decoy from saved addresses: real registrations were dropped.
  it("is not a name browser autofill fills", () => {
    expect(REGISTRATION_HONEYPOT_FIELD).not.toMatch(AUTOFILL_WORDS)
  })
})
