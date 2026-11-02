/**
 * Creates the club president's account with a generated password, emailed to them (changed at
 * first sign-in). The yearly handover: create the new president, then deactivate the old one with
 * `pnpm auth:deactivate-president`.
 *
 *   pnpm auth:create-president --name "Full Name" --email president@example.com
 */
import { auth } from "@/lib/auth/auth"
import { credentialsEmail, sendAuthEmail } from "@/lib/auth/emails"
import { generatePassword } from "@/lib/auth/password"
import { hrUserSchema } from "@/lib/auth/schema"

import { findPresidents, readOptions } from "./president"
import { run } from "./run"

run(async () => {
  const options = readOptions(
    ["name", "email"],
    'pnpm auth:create-president --name "Full Name" --email president@example.com',
  )
  const parsed = hrUserSchema.safeParse(options)
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join("\n"))
  const { name, email } = parsed.data

  const password = generatePassword()
  // A server call without a session: the only way to set the `president` role.
  const { user } = await auth.api.createUser({
    body: { name, email, password, role: "president", data: { mustChangePassword: true } },
  })
  console.info(`Created the president account of ${user.name} <${user.email}>.`)

  try {
    await sendAuthEmail(email, credentialsEmail({ name, email, password, reset: false }))
    console.info("Their sign-in details were sent by email.")
  } catch (error) {
    console.warn(
      `The email could not be sent (${error instanceof Error ? error.message : error}).\nGive them this password privately, they will change it at first sign-in: ${password}`,
    )
  }

  const others = (await findPresidents()).filter(
    (president) => president.id !== user.id && !president.banned,
  )
  if (others.length > 0) {
    console.warn(
      `\nOther active presidents:\n${others.map((president) => `  - ${president.name} <${president.email}>`).join("\n")}\nDeactivate the previous one: pnpm auth:deactivate-president --email <email>`,
    )
  }
})
