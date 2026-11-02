/**
 * Runs a script of `scripts/` that uses the database, then closes the MongoDB client so the
 * process exits. Errors print their message and set a failing exit code.
 */
import { getMongoClient } from "@/lib/mongodb"

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
