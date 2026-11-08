import type Redis from 'ioredis'
import { getRedisClient } from './redis.client'

export interface ICacheService {
  get<T>(key: string): Promise<T | null>
  /** Every key gets a TTL — no permanent keys. */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
  /** Read-through cache: returns the cached value, or loads, caches (unless null) and returns it. */
  getOrSet<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T>
  del(...keys: string[]): Promise<void>
  exists(key: string): Promise<boolean>
  incr(key: string): Promise<number>
  /** Decrements, never going below 0 (a counter that would go negative is removed instead). */
  decr(key: string): Promise<number>
  expire(key: string, ttlSeconds: number): Promise<void>
}

export class RedisCacheService implements ICacheService {
  // Resolved lazily, not at construction: server.ts imports this module before Next has loaded
  // .env files, so creating the client eagerly would connect with an undefined REDIS_URL.
  private get redis(): Redis {
    return getRedisClient()
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
  }

  async getOrSet<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await loader()
    if (value !== null && value !== undefined) await this.set(key, value, ttlSeconds)
    return value
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.redis.del(...keys)
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key)
  }

  async decr(key: string): Promise<number> {
    const value = await this.redis.decr(key)
    if (value < 0) {
      // Deleting (rather than SET 0) keeps the "no key without a TTL" rule: a missing counter
      // already reads as 0 and INCR recreates it from 0.
      await this.redis.del(key)
      return 0
    }
    return value
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds)
  }
}

export const cacheService: ICacheService = new RedisCacheService()
