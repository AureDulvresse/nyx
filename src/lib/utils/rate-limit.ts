import { cacheService, CACHE_KEYS } from '@/infrastructure/cache'

// Fixed-window counter: the TTL is set on the first hit of each window, so the key always expires.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const cacheKey = CACHE_KEYS.rateLimit(key)
  const count = await cacheService.incr(cacheKey)
  if (count === 1) await cacheService.expire(cacheKey, windowSeconds)
  return count <= limit
}
