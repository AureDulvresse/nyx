import path from 'node:path'
import { storageService } from '@/infrastructure/storage'

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const [bucket, ...rest] = (await params).path
  if (!bucket || rest.length === 0) return new Response('Not found', { status: 404 })

  // read() renvoie null pour un fichier absent comme pour une clé hors racine (path traversal).
  const body = await storageService.read(bucket, rest.join('/'))
  if (!body) return new Response('Not found', { status: 404 })

  const type = CONTENT_TYPES[path.extname(rest[rest.length - 1]).toLowerCase()] ?? 'application/octet-stream'
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
