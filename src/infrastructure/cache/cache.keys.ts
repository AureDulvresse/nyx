export const CACHE_KEYS = {
  courses: 'courses:all',
  course: (slug: string) => `course:${slug}`,
  courseProgress: (courseId: string) => `progress:course:${courseId}`,
  globalProgress: 'progress:global',
  flashcardsDue: (deck: string) => `flashcards:due:${deck}`,
  cheatsheet: (category: string) => `cheat:${category}`,
  labSession: (sessionId: string) => `lab:session:${sessionId}`,
  labActiveSessions: 'lab:sessions:active:count',
  tpSession: (sessionId: string) => `tp:session:${sessionId}`,
  tpActiveSessions: 'tp:sessions:active:count',
  streak: 'streak:current',
} as const

export const CACHE_TTL = {
  courses: 3600,
  progress: 300,
  flashcards: 60,
  cheatsheet: 1800,
  labSession: 7200,
  tpSession: 7200,
} as const
