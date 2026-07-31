import { NextResponse } from 'next/server'
import { ttsService } from '@/infrastructure/voice'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { SpeakSchema } from '@/lib/schemas'

export async function POST(request: Request): Promise<Response> {
  const allowed = await checkRateLimit('ask-nyx:speak', 20, 60)
  if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, patiente un instant.' }, { status: 429 })

  const body = await request.json().catch(() => null)
  const v = SpeakSchema.safeParse(body)
  if (!v.success) return NextResponse.json({ error: v.error.message }, { status: 400 })

  try {
    const audio = await ttsService.synthesize(v.data.text)
    return new Response(audio, { headers: { 'Content-Type': 'audio/wav' } })
  } catch {
    return NextResponse.json({ error: 'Piper est indisponible pour le moment.' }, { status: 502 })
  }
}
