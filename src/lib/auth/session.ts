import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { adminRoutes, roleHome } from "@/config/admin"
import { auth } from "@/lib/auth/auth"
import { hasPermission, isStaffRole, type Permissions } from "@/lib/auth/permissions"

/** Session of the current request, read once per render (`null` when signed out). */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }))

/** Page the signed-in user lands on: their role's home, or the forced password change. */
export function homeFor(user: { role?: string | null; mustChangePassword?: boolean | null }) {
  if (user.mustChangePassword) return adminRoutes.changePassword
  return isStaffRole(user.role) ? roleHome[user.role] : adminRoutes.signIn
}

/**
 * Guard of every admin page and Server Action: redirects when signed out, while a password change
 * is pending (unless `allowPendingPasswordChange`), or to the user's own home when their role lacks
 * `permissions`. `src/proxy.ts` only checks the cookie: this is the real check.
 */
export async function requireStaff({
  permissions,
  allowPendingPasswordChange = false,
}: { permissions?: Permissions; allowPendingPasswordChange?: boolean } = {}) {
  const session = await getSession()
  if (!session || !isStaffRole(session.user.role)) redirect(adminRoutes.signIn)
  if (session.user.mustChangePassword && !allowPendingPasswordChange) {
    redirect(adminRoutes.changePassword)
  }
  if (permissions && !hasPermission(session.user.role, permissions)) {
    redirect(homeFor(session.user))
  }
  return session
}
