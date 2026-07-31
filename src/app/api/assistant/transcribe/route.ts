import { NextResponse } from 'next/server'
import { sttService } from '@/infrastructure/voice'
import { checkRateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: Request): Promise<Response> {
  const allowed = await checkRateLimit('ask-nyx:transcribe', 20, 60)
  if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, patiente un instant.' }, { status: 429 })

  const form = await request.formData().catch(() => null)
  const audio = form?.get('audio')
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Fichier audio manquant.' }, { status: 400 })
  }

  try {
    const text = await sttService.transcribe(audio, 'recording.webm')
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Whisper est indisponible pour le moment.' }, { status: 502 })
  }
}
