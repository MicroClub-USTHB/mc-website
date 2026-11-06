import { describe, expect, it } from "vitest"

import {
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  readContactValues,
  validateContact,
} from "@/lib/contact/schema"

/** Words browser autofill and password managers recognize in a field's name (Chrome's heuristics, simplified). */
const AUTOFILL_WORDS =
  /company|business|organi[sz]ation|firm|website|url|homepage|name|e-?mail|phone|tel|mobile|address|street|city|zip|postal|country|state|birth|card|user|login|password/i

describe("readContactValues", () => {
  it("trims the fields and reads missing ones as empty", () => {
    const form = new FormData()
    form.set("name", "  Ana  ")
    form.set("email", " ana@example.com ")
    expect(readContactValues(form)).toEqual({ name: "Ana", email: "ana@example.com", message: "" })
  })
})

describe("validateContact", () => {
  const valid = { name: "Ana", email: "ana@example.com", message: "Hello" }

  it("accepts a complete message", () => {
    expect(validateContact(valid)).toEqual({})
  })

  it("asks for every empty field", () => {
    expect(Object.keys(validateContact({ name: "", email: "", message: "" }))).toEqual([
      "name",
      "email",
      "message",
    ])
  })

  it.each(["ana", "ana@example", "ana @example.com", "ana@example.c"])(
    "refuses the email %s",
    (email) => {
      expect(validateContact({ ...valid, email }).email).toBeDefined()
    },
  )

  it("enforces the lengths", () => {
    const errors = validateContact({
      ...valid,
      name: "a".repeat(CONTACT_LIMITS.name + 1),
      message: "a".repeat(CONTACT_LIMITS.message + 1),
    })
    expect(errors.name).toBeDefined()
    expect(errors.message).toBeDefined()
  })
})

describe("HONEYPOT_FIELD", () => {
  // A decoy autofill fills drops real messages as a bot's.
  it("is not a name browser autofill fills", () => {
    expect(HONEYPOT_FIELD).not.toMatch(AUTOFILL_WORDS)
  })
})
