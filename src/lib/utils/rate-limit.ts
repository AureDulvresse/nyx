import { cacheService } from '@/infrastructure/cache'

export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const count = await cacheService.incr(`ratelimit:${key}`)
  if (count === 1) await cacheService.expire(`ratelimit:${key}`, windowSeconds)
  return count <= limit
}
