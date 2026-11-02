import type { StaffRole } from "@/lib/auth/permissions"

/** Pages of the staff admin area (`src/app/(admin)/admin/`). */
export const adminRoutes = {
  home: "/admin",
  signIn: "/admin/sign-in",
  forgotPassword: "/admin/forgot-password",
  resetPassword: "/admin/reset-password",
  changePassword: "/admin/change-password",
  users: "/admin/users",
  registrations: "/admin/registrations",
} as const

/** Page of one registration, with the list state (`?q=...`) to return to. */
export function registrationRoute(id: string, listQuery = "") {
  return `${adminRoutes.registrations}/${id}${listQuery}`
}

/** Admin pages a signed-out visitor can open; `src/proxy.ts` sends every other one to sign in. */
export const signedOutAdminRoutes: readonly string[] = [
  adminRoutes.signIn,
  adminRoutes.forgotPassword,
  adminRoutes.resetPassword,
]

/** Page each role lands on after signing in. */
export const roleHome: Record<StaffRole, string> = {
  president: adminRoutes.users,
  hr: adminRoutes.registrations,
}
