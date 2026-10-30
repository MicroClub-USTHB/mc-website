/**
 * Deactivates a president account (the previous one, after the yearly handover): it can no longer
 * sign in and is signed out everywhere. The account stays in the database.
 *
 *   pnpm auth:deactivate-president --email president@example.com
 */
import { auth } from "@/lib/auth/auth"

import { findPresidents, readOptions } from "./president"
import { run } from "./run"

run(async () => {
  const { email } = readOptions(
    ["email"],
    "pnpm auth:deactivate-president --email president@example.com",
  )

  const president = (await findPresidents()).find(
    (candidate) => candidate.email === email.trim().toLowerCase(),
  )
  if (!president) throw new Error(`No president account uses ${email}.`)
  if (president.banned) {
    console.info(`${president.name} <${president.email}> is already deactivated.`)
    return
  }

  const context = await auth.$context
  await context.internalAdapter.updateUser(president.id, {
    banned: true,
    banReason: "Handed over to the next president",
    banExpires: null,
  })
  await context.internalAdapter.deleteUserSessions(president.id)
  console.info(`Deactivated ${president.name} <${president.email}> and ended their sessions.`)

  const active = (await findPresidents()).filter((candidate) => !candidate.banned)
  if (active.length === 0) {
    console.warn("No active president is left: create one with pnpm auth:create-president.")
  }
})
