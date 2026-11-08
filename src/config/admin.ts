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
  recommendations: "/admin/recommendations",
  team: "/admin/team",
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

/** Pages linked in the header; a role with a single page has no links. */
export const roleNav: Record<StaffRole, { href: string; label: string }[]> = {
  president: [],
  hr: [
    { href: adminRoutes.registrations, label: "Registrations" },
    { href: adminRoutes.recommendations, label: "Recommendations" },
    { href: adminRoutes.team, label: "Team" },
  ],
}

/** Page each role lands on after signing in. */
export const roleHome: Record<StaffRole, string> = {
  president: adminRoutes.users,
  hr: adminRoutes.registrations,
}

/** Themes of the admin area (the public site has only the light one). */
export const ADMIN_THEMES = ["light", "dark"] as const
export type AdminTheme = (typeof ADMIN_THEMES)[number]

/** Cookie keeping each browser's admin theme, read by the admin layout for the first paint. */
export const ADMIN_THEME_COOKIE = "mc-admin-theme"
