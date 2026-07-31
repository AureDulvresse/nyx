import type { QuizAttemptWithContext, WeakChapter } from '@/domain'

const WEAK_THRESHOLD_PERCENTAGE = 70

export function findWeakChapters(attempts: QuizAttemptWithContext[], limit = 5): WeakChapter[] {
  const byChapter = new Map<string, QuizAttemptWithContext[]>()
  for (const attempt of attempts) {
    const existing = byChapter.get(attempt.chapterId) ?? []
    existing.push(attempt)
    byChapter.set(attempt.chapterId, existing)
  }

  const weak: WeakChapter[] = []
  for (const chapterAttempts of byChapter.values()) {
    const last = chapterAttempts[chapterAttempts.length - 1]
    const lastPercentage = last.total > 0 ? Math.round((last.score / last.total) * 100) : 0
    const averagePercentage = Math.round(
      chapterAttempts.reduce((sum, a) => sum + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / chapterAttempts.length
    )

    if (lastPercentage < WEAK_THRESHOLD_PERCENTAGE) {
      weak.push({
        chapterId: last.chapterId,
        chapterNumber: last.chapterNumber,
        chapterTitle: last.chapterTitle,
        courseSlug: last.courseSlug,
        courseTitle: last.courseTitle,
        lastPercentage,
        averagePercentage,
        attemptCount: chapterAttempts.length,
      })
    }
  }

  return weak.sort((a, b) => a.lastPercentage - b.lastPercentage).slice(0, limit)
}
