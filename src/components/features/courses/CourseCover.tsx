'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'hugeicons-react'
import { ImageUpload01Icon } from 'hugeicons-react'
import { uploadCourseCover } from '@/actions'
import type { Course } from '@/domain'

export function CourseCover({ course }: { course: Course }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const Icon =
    (Icons as unknown as Record<
      string,
      React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
    >)[course.icon] ?? Icons.BookOpen01Icon

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    const formData = new FormData()
    formData.set('courseId', course.id)
    formData.set('file', file)

    startTransition(async () => {
      const res = await uploadCourseCover(formData)
      if (res.success) {
        router.refresh()
      } else {
        setError(res.error)
      }
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div className="group relative h-40 overflow-hidden rounded-xl border border-border sm:h-56">
      {course.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${course.color}33, ${course.color}0d)` }}
        >
          <Icon size={48} className="opacity-40" style={{ color: course.color }} />
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/80 disabled:opacity-100 group-hover:opacity-100"
      >
        <ImageUpload01Icon size={14} />
        {isPending ? 'Envoi...' : course.coverImage ? 'Changer la couverture' : 'Ajouter une couverture'}
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileChange} />

      {error && (
        <p className="absolute inset-x-0 bottom-0 bg-red/90 px-3 py-1.5 text-center text-xs text-white">{error}</p>
      )}
    </div>
  )
}
