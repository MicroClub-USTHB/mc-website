import "server-only"

import { MongoServerError } from "mongodb"

import { getMongoClient } from "@/lib/mongodb"

/** Counters of the Server Actions' limits, one document per key and window, removed once expired. */
const COLLECTION = "rate_limits"
/** Better Auth's own counters (`rateLimit.storage: "database"` in `src/lib/auth/auth.ts`). */
const AUTH_COLLECTION = "rateLimit"

type Counter = { key: string; windowStart: number; count: number; expiresAt: Date }

let indexes: Promise<unknown> | null = null

/**
 * Indexes of both rate limit collections, created once per server instance (a no-op when they
 * exist): a unique key per window, so concurrent hits share one counter, and a TTL that drops
 * expired windows. Better Auth's collection gets a unique key for the same reason.
 */
export function ensureRateLimitIndexes() {
  const db = getMongoClient().db()
  indexes ??= Promise.all([
    db.collection<Counter>(COLLECTION).createIndex({ key: 1, windowStart: 1 }, { unique: true }),
    db.collection<Counter>(COLLECTION).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection(AUTH_COLLECTION).createIndex({ key: 1 }, { unique: true }),
  ]).catch((error) => {
    indexes = null
    throw error
  })
  return indexes
}

/**
 * Client IP of a request, read like Better Auth reads it (`advanced.ipAddress` in
 * `src/lib/auth/auth.ts`): the proxy's `x-real-ip`, else the first `x-forwarded-for` hop.
 */
export function clientIp(requestHeaders: Headers) {
  return (
    requestHeaders.get("x-real-ip")?.trim() ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

/**
 * Fixed-window rate limit shared by every server instance (MongoDB): at most `limit` hits per
 * `windowMs` for each key. When the database cannot be reached the request is let through and
 * the error logged, so the contact form and Micro Bot keep working without it.
 */
export async function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const windowStart = now - (now % windowMs)

  try {
    await ensureRateLimitIndexes()
    const counters = getMongoClient().db().collection<Counter>(COLLECTION)
    const hit = () =>
      counters.findOneAndUpdate(
        { key, windowStart },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs) } },
        { upsert: true, returnDocument: "after" },
      )

    // Two first hits of a window can race on the insert: the loser counts on the winner's document.
    const counter = await hit().catch((error) => {
      if (error instanceof MongoServerError && error.code === 11000) return hit()
      throw error
    })
    return (counter?.count ?? 1) > limit
  } catch (error) {
    console.error("Rate limit unavailable", error)
    return false
  }
}
