/**
 * Creates test staff accounts in the LOCAL database, to sign in to the admin area: one president
 * and two HR members (two HR reviews settle an application). Refuses any database that is not on
 * localhost. Running it again recreates them (their emails end with `@seed.test`, their sessions
 * end); real accounts are never touched.
 *
 *   pnpm db:seed-staff
 *
 * Every account has the password below and no forced password change.
 */
import { auth } from "@/lib/auth/auth"

import { assertLocalDatabase } from "./local-database"
import { run } from "./run"

const PASSWORD = "microclub-dev"

const STAFF = [
  { name: "Test President", email: "president@seed.test", role: "president" },
  { name: "Test HR One", email: "hr1@seed.test", role: "hr" },
  { name: "Test HR Two", email: "hr2@seed.test", role: "hr" },
] as const

run(async () => {
  assertLocalDatabase()
  const context = await auth.$context

  for (const { name, email, role } of STAFF) {
    const existing = await context.internalAdapter.findUserByEmail(email)
    if (existing) await context.internalAdapter.deleteUser(existing.user.id)
    // A server call without a session: the only way to set the `president` role.
    await auth.api.createUser({ body: { name, email, password: PASSWORD, role } })
  }

  console.info(
    `Seeded ${STAFF.length} staff accounts, password "${PASSWORD}":\n${STAFF.map(
      ({ email, role }) => `  - ${email} (${role})`,
    ).join("\n")}`,
  )
})
