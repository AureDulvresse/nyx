import { getPiperUrl } from './tts.client'

export interface ITTSService {
  synthesize(text: string): Promise<ArrayBuffer>
}

export class PiperTTSService implements ITTSService {
  async synthesize(text: string): Promise<ArrayBuffer> {
    const response = await fetch(`${getPiperUrl()}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) throw new Error(`Piper a répondu avec le statut ${response.status}`)

    return response.arrayBuffer()
  }
}

export const ttsService: ITTSService = new PiperTTSService()
