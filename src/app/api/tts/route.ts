import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ttsService } from '@/infrastructure/tts'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { SpeakSchema } from '@/lib/schemas'

// Les routes /api échappent au proxy d'authentification : on vérifie la session ici.
export async function POST(request: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const allowed = await checkRateLimit(`tts:${session.user.email ?? 'user'}`, 120, 60)
  if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, patiente un instant.' }, { status: 429 })

  const v = SpeakSchema.safeParse(await request.json().catch(() => null))
  if (!v.success) return NextResponse.json({ error: 'Texte invalide.' }, { status: 400 })

  try {
    const audio = await ttsService.synthesize(v.data.text)
    return new Response(new Uint8Array(audio), {
      headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'private, max-age=86400' },
    })
  } catch {
    return NextResponse.json({ error: 'La synthèse vocale (Piper) est indisponible.' }, { status: 502 })
  }
}
