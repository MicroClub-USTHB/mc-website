import { z } from "zod"

/** Same bounds as the Better Auth config (`minPasswordLength`, default max length). */
export const PASSWORD_LIMITS = { min: 12, max: 128 } as const

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_LIMITS.min, `Use at least ${PASSWORD_LIMITS.min} characters.`)
  .max(PASSWORD_LIMITS.max, `Use at most ${PASSWORD_LIMITS.max} characters.`)

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
