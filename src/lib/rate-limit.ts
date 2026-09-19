/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Pros: zero setup, zero cost, zero external services.
 * Cons: resets when Vercel cold-starts a new serverless instance,
 *       and each region gets its own counter.
 *
 * For MVP this is fine — it stops casual spam and form abuse.
 * Swap for Upstash Redis when you launch publicly and need
 * a shared counter across all instances/regions.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Periodic cleanup so the Map doesn't grow unbounded.
// `.unref()` keeps Node from holding the process open just for this timer.
const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}, 10 * 60 * 1000) // every 10 minutes

if (typeof cleanup.unref === 'function') cleanup.unref()

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterMs: number
}

/**
 * Check and consume one unit from a rate-limit bucket.
 *
 * @param key       Unique identifier for the actor (e.g. `apply:1.2.3.4`)
 * @param limit     Max requests allowed within the window
 * @param windowMs  Window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  // No bucket yet, or window expired → start fresh
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  // Bucket exists and is still in-window
  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now,
    }
  }

  bucket.count += 1
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterMs: 0,
  }
}

/**
 * Human-friendly "try again in N minutes" string.
 */
export function formatRetryAfter(ms: number): string {
  const mins = Math.ceil(ms / 60_000)
  if (mins <= 1) return '1 minute'
  if (mins < 60) return `${mins} minutes`
  const hours = Math.ceil(mins / 60)
  return hours === 1 ? '1 hour' : `${hours} hours`
}