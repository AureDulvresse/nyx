import { S3Client } from '@aws-sdk/client-s3'

declare global {
  var minioGlobal: S3Client | undefined
}

export function getMinioClient(): S3Client {
  if (!globalThis.minioGlobal) {
    globalThis.minioGlobal = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT!,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  }
  return globalThis.minioGlobal
}
