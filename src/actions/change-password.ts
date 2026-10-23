"use server"

import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { auth, setMustChangePassword } from "@/lib/auth/auth"
import { passwordChangedEmail, sendAuthEmail } from "@/lib/auth/emails"
import { fieldErrors, passwordPairSchema } from "@/lib/auth/schema"
import { homeFor, requireStaff } from "@/lib/auth/session"

type Field = "currentPassword" | "newPassword" | "confirmPassword"

export type ChangePasswordState = {
  message?: string
  errors?: Partial<Record<Field, string>>
}

/**
 * Changes the signed-in user's password (also the forced change after a generated one), signs out
 * their other devices, emails a notice, then opens their home page. Needs the current password, so
 * a stolen session alone cannot change it.
 */
export async function changePassword(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const { user } = await requireStaff({ allowPendingPasswordChange: true })

  const currentPassword = String(formData.get("currentPassword") ?? "")
  const parsed = passwordPairSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  const errors: ChangePasswordState["errors"] = parsed.success ? {} : fieldErrors(parsed.error)
  if (!currentPassword) errors.currentPassword = "Enter your current password."
  else if (parsed.success && parsed.data.newPassword === currentPassword) {
    errors.newPassword = "Choose a password different from the current one."
  }
  if (!parsed.success || Object.keys(errors).length > 0) return { errors }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true },
    })
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_PASSWORD") {
      return { errors: { currentPassword: "The current password is incorrect." } }
    }
    console.error("Change password failed", error)
    return { message: "Your password could not be changed. Please try again." }
  }

  await setMustChangePassword(user.id, false)
  after(() =>
    sendAuthEmail(user.email, passwordChangedEmail({ name: user.name })).catch((error) =>
      console.error("Auth email failed", error),
    ),
  )
  redirect(homeFor({ role: user.role, mustChangePassword: false }))
}
