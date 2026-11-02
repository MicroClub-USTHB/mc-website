import { z } from "zod"

/** Same bounds as the Better Auth config (`minPasswordLength`, default max length). */
export const PASSWORD_LIMITS = { min: 8, max: 128 } as const

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_LIMITS.min, `Use at least ${PASSWORD_LIMITS.min} characters.`)
  .max(PASSWORD_LIMITS.max, `Use at most ${PASSWORD_LIMITS.max} characters.`)

/**
 * Sign-in fields. Only what can be told before asking the server: the email's shape and a password
 * typed at all (its length rule is the server's, so an older account is never locked out here).
 */
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email.")
    .max(254, "This email is too long.")
    .pipe(z.email("Enter a valid email, like name@example.com.")),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(PASSWORD_LIMITS.max, `Passwords are at most ${PASSWORD_LIMITS.max} characters.`),
})

export type SignInInput = z.infer<typeof signInSchema>

/** New password typed twice, on the change and reset password pages. */
export const passwordPairSchema = z
  .object({ newPassword: newPasswordSchema, confirmPassword: z.string() })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  })

/** Name and email of a new HR account, from the users page. */
export const hrUserSchema = z.object({
  name: z.string().trim().min(2, "Enter the full name.").max(80, "Use at most 80 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter the email.")
    .max(254, "Enter a valid email.")
    .pipe(z.email("Enter a valid email.")),
})

export type HrUserInput = z.infer<typeof hrUserSchema>

/** First message of each field, for the forms. */
export function fieldErrors<T extends string>(error: z.ZodError) {
  const errors: Partial<Record<T, string>> = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as T
    errors[field] ??= issue.message
  }
  return errors
}
