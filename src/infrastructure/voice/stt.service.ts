import { getWhisperUrl } from './stt.client'

export interface ISTTService {
  transcribe(audio: Blob, filename: string): Promise<string>
}

export class WhisperSTTService implements ISTTService {
  async transcribe(audio: Blob, filename: string): Promise<string> {
    const form = new FormData()
    form.append('audio_file', audio, filename)

    const response = await fetch(`${getWhisperUrl()}/asr?output=json&language=fr&task=transcribe`, {
      method: 'POST',
      body: form,
    })

    if (!response.ok) throw new Error(`Whisper a répondu avec le statut ${response.status}`)

    const data = (await response.json()) as { text?: string }
    return (data.text ?? '').trim()
  }
}

export const sttService: ISTTService = new WhisperSTTService()
