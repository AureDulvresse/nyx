// Pure: turns dashboard data into a short, ordered "Aujourd'hui" to-do list.
import type { ResumePoint, WeakChapter } from '@/domain'

export type TodayTaskKind = 'flashcards' | 'resume' | 'weak' | 'explore'

export interface TodayTask {
  kind: TodayTaskKind
  title: string
  description: string
  href: string
}

export interface TodayPlan {
  tasks: TodayTask[]
  studiedToday: boolean
  streak: number
}

const plural = (n: number, word: string): string => `${n} ${word}${n > 1 ? 's' : ''}`

export function buildTodayPlan({
  flashcardsDue,
  resume,
  weakChapters,
  activityDates,
  streak,
  now = new Date(),
}: {
  flashcardsDue: number
  resume: ResumePoint | null
  weakChapters: WeakChapter[]
  activityDates: Date[]
  streak: number
  now?: Date
}): TodayPlan {
  const tasks: TodayTask[] = []

  // Spaced repetition first: due cards lose value the longer they wait.
  if (flashcardsDue > 0) {
    tasks.push({
      kind: 'flashcards',
      title: `Réviser ${plural(flashcardsDue, 'flashcard')}`,
      description: `≈ ${Math.max(1, Math.round(flashcardsDue * 0.25))} min de répétition espacée`,
      href: '/flashcards',
    })
  }

  if (resume) {
    tasks.push({
      kind: 'resume',
      title: `${resume.kind === 'in_progress' ? 'Terminer' : 'Commencer'} le chapitre ${resume.chapterNumber}`,
      description: `${resume.chapterTitle} · ${resume.courseTitle}`,
      href: `/courses/${resume.courseSlug}/${resume.chapterNumber}`,
    })
  }

  const weakest = weakChapters[0]
  if (weakest) {
    tasks.push({
      kind: 'weak',
      title: `Consolider « ${weakest.chapterTitle} »`,
      description: `Dernier quiz à ${weakest.lastPercentage}% — relis puis refais le quiz`,
      href: `/quiz/${weakest.chapterId}`,
    })
  }

  if (tasks.length === 0) {
    tasks.push({
      kind: 'explore',
      title: 'Choisir un cours',
      description: 'Rien en attente — lance-toi sur un nouveau sujet',
      href: '/courses',
    })
  }

  const today = now.toISOString().slice(0, 10)
  const studiedToday = activityDates.some((d) => new Date(d).toISOString().slice(0, 10) === today)

  return { tasks, studiedToday, streak }
}
