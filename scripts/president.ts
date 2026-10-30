/**
 * Shared by the president scripts (`pnpm auth:create-president`, `pnpm auth:deactivate-president`).
 * They import the app's server modules, so they run with the `react-server` condition (see the
 * `package.json` scripts) and read `.env.local`: point `MONGODB_URI` at production to act there.
 */
import { parseArgs } from "node:util"

import { auth } from "@/lib/auth/auth"
import { getMongoClient } from "@/lib/mongodb"

export type PresidentUser = { id: string; name: string; email: string; banned?: boolean | null }

/** Reads `--name` / `--email`-style options, exiting with the usage when one is missing. */
export function readOptions<const Name extends string>(names: Name[], usage: string) {
  const { values } = parseArgs({
    options: Object.fromEntries(names.map((name) => [name, { type: "string" as const }])),
  })
  const missing = names.filter((name) => !values[name])
  if (missing.length > 0) {
    console.error(`Missing --${missing.join(", --")}\nUsage: ${usage}`)
    process.exit(1)
  }
  return values as Record<Name, string>
}

/** Every president account, active or deactivated. */
export async function findPresidents() {
  const context = await auth.$context
  return context.adapter.findMany<PresidentUser>({
    model: "user",
    where: [{ field: "role", value: "president" }],
  })
}

/** Runs a script, then closes the MongoDB client so the process exits. */
export async function run(script: () => Promise<void>) {
  try {
    await script()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  } finally {
    await getMongoClient().close()
  }
}
