export const CACHE_KEYS = {
  courses: 'courses:all',
  course: (slug: string) => `course:${slug}`,
  courseProgress: (courseId: string) => `progress:course:${courseId}`,
  globalProgress: 'progress:global',
  resumePoint: 'progress:resume',
  flashcardsDue: (deck: string) => `flashcards:due:${deck}`,
  labSession: (sessionId: string) => `lab:session:${sessionId}`,
  tpSession: (sessionId: string) => `tp:session:${sessionId}`,
  tpActiveSessions: 'tp:sessions:active:count',
  rateLimit: (key: string) => `ratelimit:${key}`,
  statsActivityDates: 'stats:activity-dates',
  statsEarnedCredits: 'stats:earned-credits',
  statsProgressionCounts: 'stats:progression-counts',
} as const

/**
 * Header stats (streak, credits, points) computed on every navigation by the app layout.
 * Any repository mutation that changes chapter completion, quiz attempts, lab sessions, flag
 * captures, TP completion or project status must `cacheService.del(...STATS_CACHE_KEYS)`.
 */
export const STATS_CACHE_KEYS = [
  CACHE_KEYS.statsActivityDates,
  CACHE_KEYS.statsEarnedCredits,
  CACHE_KEYS.statsProgressionCounts,
] as const

// Seconds.
export const CACHE_TTL = {
  courses: 3600,
  progress: 300,
  flashcards: 60,
  labSession: 7200,
  tpSession: 7200,
} as const
