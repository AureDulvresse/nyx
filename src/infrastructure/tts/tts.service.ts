import { createHash } from 'node:crypto'
import { storageService, STORAGE_BUCKETS } from '@/infrastructure/storage'

export interface ITTSService {
  synthesize(text: string): Promise<Buffer>
}

function getPiperUrl(): string {
  return process.env.PIPER_URL ?? 'http://localhost:8082'
}

// Piper local, avec cache disque : un même passage (relecture d'un chapitre) n'est synthétisé qu'une fois.
export class PiperTTSService implements ITTSService {
  async synthesize(text: string): Promise<Buffer> {
    const key = `${createHash('sha256').update(text).digest('hex')}.wav`
    const cached = await storageService.read(STORAGE_BUCKETS.tts, key)
    if (cached) return cached

    const response = await fetch(`${getPiperUrl()}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error(`Piper a répondu avec le statut ${response.status}`)

    const audio = Buffer.from(await response.arrayBuffer())
    await storageService.upload(STORAGE_BUCKETS.tts, key, audio).catch(() => undefined)
    return audio
  }
}

export const ttsService: ITTSService = new PiperTTSService()
