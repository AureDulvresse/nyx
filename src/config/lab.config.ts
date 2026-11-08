function intFromEnv(name: string, fallback: number): number {
  const parsed = parseInt(process.env[name] ?? '', 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

// Getters (not plain values) on purpose: server.ts imports this module before Next has loaded
// .env files, so reading process.env eagerly at module-evaluation time would freeze the defaults.
export const labConfig = {
  get maxConcurrentSessions(): number {
    return intFromEnv('LAB_MAX_CONCURRENT_SESSIONS', 3)
  },
  get sessionTimeoutHours(): number {
    return intFromEnv('LAB_SESSION_TIMEOUT_HOURS', 2)
  },
}
