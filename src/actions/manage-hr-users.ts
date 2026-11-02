"use server"

import { APIError } from "better-auth/api"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"

import { adminRoutes } from "@/config/admin"
import { auth, setMustChangePassword } from "@/lib/auth/auth"
import { credentialsEmail, sendAuthEmail } from "@/lib/auth/emails"
import { generatePassword } from "@/lib/auth/password"
import { fieldErrors, hrUserSchema, type HrUserInput } from "@/lib/auth/schema"
import { requireStaff } from "@/lib/auth/session"

/** `warning`: the change was saved, but the email with the new password could not be sent. */
export type HrUserActionResult = {
  status: "success" | "warning" | "error"
  message: string
  errors?: Partial<Record<keyof HrUserInput, string>>
}

const userIdSchema = z.string().min(1)

const EMAIL_FAILED =
  "but the email with the new password could not be sent. Use Reset password to send it again."

/** Readable message of a Better Auth error (`FORBIDDEN`, user already exists...), logged otherwise. */
function failure(error: unknown, fallback: string): HrUserActionResult {
  if (error instanceof APIError && error.message) return { status: "error", message: error.message }
  console.error(fallback, error)
  return { status: "error", message: fallback }
}

async function emailCredentials(
  user: { name: string; email: string },
  password: string,
  reset: boolean,
) {
  try {
    await sendAuthEmail(user.email, credentialsEmail({ ...user, password, reset }))
    return true
  } catch (error) {
    console.error("Users page: sending the credentials failed", error)
    return false
  }
}

/**
 * Creates an HR account (the admin plugin's `defaultRole`) with a generated password, which the
 * user must change on first sign-in, and emails the sign-in details.
 */
export async function createHrUser(input: HrUserInput): Promise<HrUserActionResult> {
  await requireStaff({ permissions: { user: ["create"] } })
  const parsed = hrUserSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: fieldErrors(parsed.error),
    }
  }

  const password = generatePassword()
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: { ...parsed.data, password, data: { mustChangePassword: true } },
    })
  } catch (error) {
    return failure(error, "The account could not be created. Please try again.")
  }
  revalidatePath(adminRoutes.users)

  const sent = await emailCredentials(parsed.data, password, false)
  return sent
    ? { status: "success", message: `${parsed.data.name} received their sign-in details by email.` }
    : { status: "warning", message: `The account was created, ${EMAIL_FAILED}` }
}

/** Blocks sign-in and ends every session of the account, which stays listed. */
export async function deactivateHrUser(userId: string): Promise<HrUserActionResult> {
  await requireStaff({ permissions: { user: ["ban"] } })
  try {
    await auth.api.banUser({
      headers: await headers(),
      body: { userId: userIdSchema.parse(userId), banReason: "Deactivated by the president" },
    })
  } catch (error) {
    return failure(error, "The account could not be deactivated. Please try again.")
  }
  revalidatePath(adminRoutes.users)
  return { status: "success", message: "The account is deactivated: it can no longer sign in." }
}

export async function reactivateHrUser(userId: string): Promise<HrUserActionResult> {
  await requireStaff({ permissions: { user: ["ban"] } })
  try {
    await auth.api.unbanUser({
      headers: await headers(),
      body: { userId: userIdSchema.parse(userId) },
    })
  } catch (error) {
    return failure(error, "The account could not be reactivated. Please try again.")
  }
  revalidatePath(adminRoutes.users)
  return { status: "success", message: "The account is active again: it can sign in." }
}

/**
 * Replaces the password with a generated one, ends every session, emails the new password and
 * forces a change on the next sign-in.
 */
export async function resetHrUserPassword(userId: string): Promise<HrUserActionResult> {
  await requireStaff({ permissions: { user: ["set-password"], session: ["revoke"] } })
  const id = userIdSchema.parse(userId)
  const requestHeaders = await headers()
  const password = generatePassword()

  let user: { name: string; email: string }
  try {
    user = await auth.api.getUser({ headers: requestHeaders, query: { id } })
    await auth.api.setUserPassword({
      headers: requestHeaders,
      body: { userId: id, newPassword: password },
    })
    await setMustChangePassword(id, true)
    await auth.api.revokeUserSessions({ headers: requestHeaders, body: { userId: id } })
  } catch (error) {
    return failure(error, "The password could not be reset. Please try again.")
  }

  const sent = await emailCredentials(user, password, true)
  return sent
    ? { status: "success", message: `${user.name} received a new password by email.` }
    : { status: "warning", message: `The password was reset, ${EMAIL_FAILED}` }
}

/** Deletes the account, its sessions and its password. Cannot be undone. */
export async function deleteHrUser(userId: string): Promise<HrUserActionResult> {
  await requireStaff({ permissions: { user: ["delete"] } })
  try {
    await auth.api.removeUser({
      headers: await headers(),
      body: { userId: userIdSchema.parse(userId) },
    })
  } catch (error) {
    return failure(error, "The account could not be deleted. Please try again.")
  }
  revalidatePath(adminRoutes.users)
  return { status: "success", message: "The account was deleted." }
}
