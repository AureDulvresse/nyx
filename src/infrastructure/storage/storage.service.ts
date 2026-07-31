import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getMinioClient } from './minio.client'

export interface IStorageService {
  upload(bucket: string, key: string, body: Buffer | Uint8Array, contentType: string): Promise<string>
  getPublicUrl(bucket: string, key: string): string
  getPresignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>
  delete(bucket: string, key: string): Promise<void>
  list(bucket: string, prefix?: string): Promise<string[]>
}

export class MinioStorageService implements IStorageService {
  private client = getMinioClient()

  async upload(bucket: string, key: string, body: Buffer | Uint8Array, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }))
    return this.getPublicUrl(bucket, key)
  }

  getPublicUrl(bucket: string, key: string): string {
    return `${process.env.MINIO_PUBLIC_URL}/${bucket}/${key}`
  }

  async getPresignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    return getSignedUrl(this.client, command, { expiresIn })
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  }

  async list(bucket: string, prefix?: string): Promise<string[]> {
    const result = await this.client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }))
    return (result.Contents ?? []).map((o) => o.Key!).filter(Boolean)
  }
}

export const storageService: IStorageService = new MinioStorageService()
