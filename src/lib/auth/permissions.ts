import { createAccessControl } from "better-auth/plugins/access"

/**
 * Every permission of the admin area, shared by the server and the browser. `user` and `session`
 * actions are the names the Better Auth admin plugin checks on its endpoints; a permission missing
 * here (`set-role`, `update`, `impersonate`...) is granted to no one.
 */
const statement = {
  user: ["create", "list", "get", "ban", "set-password", "delete"],
  session: ["revoke"],
  registration: ["review"],
} as const

export const ac = createAccessControl(statement)

/** One role per account. The president manages HR accounts only; HR reviews the registrations. */
export const roles = {
  president: ac.newRole({
    user: ["create", "list", "get", "ban", "set-password", "delete"],
    session: ["revoke"],
  }),
  hr: ac.newRole({ registration: ["review"] }),
}

export type StaffRole = keyof typeof roles

export type Permissions = {
  [Resource in keyof typeof statement]?: (typeof statement)[Resource][number][]
}

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "president" || role === "hr"
}

/** Whether `role` grants every permission in `permissions`. */
export function hasPermission(role: string | null | undefined, permissions: Permissions) {
  return isStaffRole(role) && roles[role].authorize(permissions).success
}
