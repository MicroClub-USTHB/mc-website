import "server-only"

import { MongoClient } from "mongodb"
import mongoose from "mongoose"

/** Client and Mongoose link kept on `globalThis`, so dev hot reloads reuse them instead of opening new ones. */
const cache = globalThis as typeof globalThis & {
  mongoClient?: MongoClient
  mongoose?: { connection: Promise<typeof mongoose> | null }
}
cache.mongoose ??= { connection: null }

/**
 * The one MongoDB client of the app (`MONGODB_URI`, see `.env.example`), shared by Better Auth and
 * Mongoose. Created without connecting: the driver connects on the first operation, so importing
 * it (e.g. during `next build`) opens nothing.
 */
export function getMongoClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is missing")

  cache.mongoClient ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
  return cache.mongoClient
}

/**
 * Connects the shared client and attaches Mongoose to it, once per server instance.
 * A failed attempt is not cached, so the next request retries.
 */
export async function connectToDatabase() {
  const client = getMongoClient()
  const store = cache.mongoose!
  store.connection ??= client.connect().then(() => {
    if (mongoose.connection.readyState === mongoose.ConnectionStates.disconnected) {
      mongoose.connection.setClient(client)
    }
    return mongoose
  })

  try {
    return await store.connection
  } catch (error) {
    store.connection = null
    throw error
  }
}
