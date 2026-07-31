import Redis from 'ioredis'

declare global {
  var redisGlobal: Redis | undefined
}

export function getRedisClient(): Redis {
  if (!globalThis.redisGlobal) {
    const client = new Redis(process.env.REDIS_URL!, {
      keyPrefix: process.env.REDIS_PREFIX ?? 'nyx:',
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      keepAlive: 10_000,
    })

    client.on('error', (err) => console.error('[Redis] Error:', err))
    client.on('connect', () => console.log('[Redis] Connected'))

    globalThis.redisGlobal = client
  }
  return globalThis.redisGlobal
}
