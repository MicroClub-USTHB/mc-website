import { describe, expect, it } from "vitest"

import { CONTACT_LIMITS, readContactValues, validateContact } from "@/lib/contact/schema"

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
