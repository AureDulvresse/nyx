import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { STORAGE_PUBLIC_PREFIX, STORAGE_ROOT, type StorageBucket } from './storage.types'

export interface IStorageService {
  /** Writes the file and returns its public URL. */
  upload(bucket: StorageBucket, key: string, body: Buffer | Uint8Array): Promise<string>
  getPublicUrl(bucket: string, key: string): string
  read(bucket: string, key: string): Promise<Buffer | null>
  delete(bucket: string, key: string): Promise<void>
}

// Local-disk storage (STORAGE_DIR, mounted as a volume in Docker), served by src/app/uploads.
export class LocalStorageService implements IStorageService {
  private readonly root = path.resolve(STORAGE_ROOT)

  async upload(bucket: StorageBucket, key: string, body: Buffer | Uint8Array): Promise<string> {
    const file = this.resolve(bucket, key)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, body)
    return this.getPublicUrl(bucket, key)
  }

  getPublicUrl(bucket: string, key: string): string {
    return `${STORAGE_PUBLIC_PREFIX}/${bucket}/${key}`
  }

  async read(bucket: string, key: string): Promise<Buffer | null> {
    try {
      return await readFile(this.resolve(bucket, key))
    } catch {
      return null
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    await rm(this.resolve(bucket, key), { force: true })
  }

  // Resolves bucket/key under the storage root and rejects any path-traversal attempt.
  private resolve(bucket: string, key: string): string {
    const full = path.resolve(this.root, bucket, key)
    if (!full.startsWith(this.root + path.sep)) throw new Error('Invalid storage path')
    return full
  }
}

export const storageService: IStorageService = new LocalStorageService()
