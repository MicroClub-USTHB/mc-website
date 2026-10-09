const hits = new Map<string, number[]>()

/**
 * Sliding-window rate limit kept in memory: at most `limit` hits per `windowMs` for each key.
 * Memory is per server instance, so on serverless hosting it only slows down simple floods;
 * use a shared store (Redis, Upstash) for a strict limit across instances.
 */
export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)

  if (recent.length >= limit) {
    hits.set(key, recent)
    return true
  }

  recent.push(now)
  hits.set(key, recent)

  // Drop idle keys so the map cannot grow forever.
  if (hits.size > 1000) {
    for (const [storedKey, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(storedKey)
    }
  }
  return false
}
