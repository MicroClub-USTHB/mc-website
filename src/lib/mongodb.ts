import "server-only"

import mongoose from "mongoose"

/** Connection kept on `globalThis`, so dev hot reloads reuse it instead of opening a new one. */
const cache = globalThis as typeof globalThis & {
  mongoose?: { connection: Promise<typeof mongoose> | null }
}
cache.mongoose ??= { connection: null }

/**
 * Connects to MongoDB (`MONGODB_URI`, see `.env.example`), once per server instance.
 * A failed attempt is not cached, so the next request retries.
 */
export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is missing")

  const store = cache.mongoose!
  store.connection ??= mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })

  try {
    return await store.connection
  } catch (error) {
    store.connection = null
    throw error
  }
}
