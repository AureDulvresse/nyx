export const STORAGE_BUCKETS = {
  courses: process.env.MINIO_BUCKET_COURSES ?? 'nyx-courses',
  labs: process.env.MINIO_BUCKET_LABS ?? 'nyx-labs',
  uploads: process.env.MINIO_BUCKET_UPLOADS ?? 'nyx-uploads',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]
