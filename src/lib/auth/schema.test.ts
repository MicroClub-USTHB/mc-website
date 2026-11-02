import { describe, expect, it } from "vitest"

import { PASSWORD_LIMITS, signInSchema } from "@/lib/auth/schema"

describe("signInSchema", () => {
  it("trims and lowercases the email", () => {
    expect(signInSchema.parse({ email: "  Adel@Example.COM ", password: "x" })).toEqual({
      email: "adel@example.com",
      password: "x",
    })
  })

  it("asks for each empty field", () => {
    const result = signInSchema.safeParse({ email: "", password: "" })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => [issue.path[0], issue.message])
    expect(messages).toEqual([
      ["email", "Enter your email."],
      ["password", "Enter your password."],
    ])
  })

  it.each(["adel", "adel@", "adel@example", "adel @example.com"])(
    "refuses the email %j",
    (email) => {
      expect(signInSchema.safeParse({ email, password: "x" }).success).toBe(false)
    },
  )

  it("leaves the password length rule to the server, apart from its maximum", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(true)
    const tooLong = "x".repeat(PASSWORD_LIMITS.max + 1)
    expect(signInSchema.safeParse({ email: "a@b.co", password: tooLong }).success).toBe(false)
  })
})
