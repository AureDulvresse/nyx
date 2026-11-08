'use server'

import { revalidatePath } from 'next/cache'
import { courseRepo, resourceRepo } from '@/repositories'
import { storageService, STORAGE_BUCKETS } from '@/infrastructure/storage'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { ok, err, ActionResult } from '@/lib/utils/result'
import { runAction } from '@/lib/utils/action.utils'
import type { Course, Resource, ResourceType } from '@/domain'

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function uploadCourseCover(formData: FormData): Promise<ActionResult<Course>> {
  const courseId = formData.get('courseId')
  const file = formData.get('file')

  if (typeof courseId !== 'string' || !courseId) return err('Cours invalide.', 'VALIDATION')
  if (!(file instanceof File) || file.size === 0) return err('Aucun fichier reçu.', 'VALIDATION')
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return err('Format d’image non supporté.', 'VALIDATION')
  if (file.size > MAX_UPLOAD_BYTES) return err('Fichier trop volumineux (max 25 Mo).', 'VALIDATION')

  const allowed = await checkRateLimit(`upload:cover:${courseId}`, 10, 60)
  if (!allowed) return err('Trop de tentatives, réessaie dans un instant.', 'RATE_LIMIT')

  return runAction(
    async () => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const key = `covers/${courseId}-${Date.now()}-${slugifyFilename(file.name)}`
      const url = await storageService.upload(STORAGE_BUCKETS.courses, key, buffer)
      const course = await courseRepo.updateCoverImage(courseId, url)
      revalidatePath('/courses')
      return ok(course)
    },
    { message: 'Échec de l’upload de la couverture.', code: 'UPLOAD_ERROR' }
  )
}

export async function uploadChapterMedia(formData: FormData): Promise<ActionResult<Resource>> {
  const chapterId = formData.get('chapterId')
  const title = formData.get('title')
  const file = formData.get('file')

  if (typeof chapterId !== 'string' || !chapterId) return err('Chapitre invalide.', 'VALIDATION')
  if (typeof title !== 'string' || title.trim().length === 0) return err('Titre requis.', 'VALIDATION')
  if (!(file instanceof File) || file.size === 0) return err('Aucun fichier reçu.', 'VALIDATION')
  if (file.size > MAX_UPLOAD_BYTES) return err('Fichier trop volumineux (max 25 Mo).', 'VALIDATION')

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
  if (!isImage && !isVideo) return err('Format de fichier non supporté (image ou vidéo uniquement).', 'VALIDATION')

  const allowed = await checkRateLimit(`upload:media:${chapterId}`, 10, 60)
  if (!allowed) return err('Trop de tentatives, réessaie dans un instant.', 'RATE_LIMIT')

  return runAction(
    async () => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const key = `chapters/${chapterId}/${Date.now()}-${slugifyFilename(file.name)}`
      const url = await storageService.upload(STORAGE_BUCKETS.uploads, key, buffer)
      const type: ResourceType = isImage ? 'image' : 'video'
      const resource = await resourceRepo.create({ chapterId, title: title.trim(), url, type })
      revalidatePath('/courses')
      return ok(resource)
    },
    { message: 'Échec de l’upload du média.', code: 'UPLOAD_ERROR' }
  )
}
