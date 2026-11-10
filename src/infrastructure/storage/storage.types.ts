export const STORAGE_BUCKETS = {
  courses: 'courses',
  labs: 'labs',
  uploads: 'uploads',
  tts: 'tts',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

// Root directory for uploaded files (mounted as a volume in Docker).
export const STORAGE_ROOT = process.env.STORAGE_DIR ?? './storage'

// Public URL prefix served by src/app/uploads/[...path]/route.ts
export const STORAGE_PUBLIC_PREFIX = '/uploads'
