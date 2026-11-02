import "server-only"

import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins/admin"
import { after } from "next/server"

import { passwordChangedEmail, resetPasswordEmail, sendAuthEmail } from "@/lib/auth/emails"
import { ac, roles } from "@/lib/auth/permissions"
import { getMongoClient } from "@/lib/mongodb"

const DAY = 60 * 60 * 24

/** Admin endpoints acting on an existing account: a signed-in president can only target HR accounts. */
const HR_TARGET_PATHS = new Set([
  "/admin/ban-user",
  "/admin/unban-user",
  "/admin/set-user-password",
  "/admin/remove-user",
  "/admin/revoke-user-sessions",
])

/**
 * Sends an auth email after the response, so it neither delays the request nor reveals through
 * timing whether an account exists. Failures are only logged.
 */
function sendLater(to: string, email: Parameters<typeof sendAuthEmail>[1]) {
  after(() => sendAuthEmail(to, email).catch((error) => console.error("Auth email failed", error)))
}

const client = getMongoClient()

/**
 * Better Auth (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, see `.env.example`), mounted on
 * `/api/auth` by `src/app/api/auth/[...all]/route.ts`. Staff accounts only: email and password,
 * no sign-up. HR accounts are created by the president, presidents by `pnpm auth:create-president`.
 */
export const auth = betterAuth({
  appName: "Micro Club",
  database: mongodbAdapter(client.db(), { client }),
  user: {
    additionalFields: {
      /** Set on every generated password: the admin area stays locked until the user picks one. */
      mustChangePassword: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      sendLater(user.email, resetPasswordEmail({ name: user.name, url }))
    },
    onPasswordReset: async ({ user }) => {
      await setMustChangePassword(user.id, false)
      sendLater(user.email, passwordChangedEmail({ name: user.name }))
    },
  },
  session: {
    expiresIn: 7 * DAY,
    updateAge: DAY,
  },
  rateLimit: {
    // In memory, per server instance: moving it to MongoDB is tracked in issue #37.
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 10 * 60, max: 3 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!HR_TARGET_PATHS.has(ctx.path)) return
      const userId: unknown = ctx.body?.userId
      if (typeof userId !== "string") return
      const target = (await ctx.context.internalAdapter.findUserById(userId)) as {
        role?: string | null
      } | null
      if (target && target.role !== "hr") {
        throw new APIError("FORBIDDEN", { message: "Only HR accounts can be managed." })
      }
    }),
  },
  plugins: [
    admin({
      ac,
      roles,
      // Accounts created from the users page are HR: setting a role needs `user:set-role`, which
      // no role has, so only the scripts (server calls without a session) can create a president.
      defaultRole: "hr",
      adminRoles: ["president"],
      bannedUserMessage: "This account is deactivated. Contact the club president.",
    }),
    // Last: sets the cookies of `auth.api` calls made from Server Actions.
    nextCookies(),
  ],
})

export type AuthSession = typeof auth.$Infer.Session

/** Sets or clears the forced password change. `input: false` keeps it out of the user's own updates. */
export async function setMustChangePassword(userId: string, value: boolean) {
  const context = await auth.$context
  await context.internalAdapter.updateUser(userId, { mustChangePassword: value })
}
