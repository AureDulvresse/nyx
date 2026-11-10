import { isSameDay } from 'date-fns'
import type {
  CourseExam,
  CourseExamSummary,
  ExamAttempt,
  ExamAttemptResult,
  ExamQuestionPublic,
  ExamReviewItem,
  ExamSessionData,
  ExamSubmission,
  QuizQuestion,
} from '@/domain'
import { toPercentage } from '@/lib/utils/math.utils'
import { QuizService } from './quiz.service'

// Certification-style pacing (CEH/Security+ ballpark): the final exam simulates real exam conditions.
const SECONDS_PER_QUESTION = 90
// Each attempt draws ~60% of the bank, so two attempts rarely see the same set.
const SUBSET_RATIO = 0.6
const MIN_SUBSET_SIZE = 20
// Grace period on top of the exam duration for network latency / auto-submit at 0.
const SUBMIT_GRACE_SECONDS = 120

function correctIndices(question: QuizQuestion): number[] {
  return Array.isArray(question.correct) ? question.correct : [question.correct]
}

function sameSet(a: number[], b: number[]): boolean {
  return a.length === b.length && b.every((x) => a.includes(x))
}

function questionCount(bankSize: number): number {
  return Math.min(bankSize, Math.max(MIN_SUBSET_SIZE, Math.round(bankSize * SUBSET_RATIO)))
}

export const ExamService = {
  correctIndices,

  isMultiSelect(question: QuizQuestion): boolean {
    return correctIndices(question).length > 1
  },

  summarize(exam: CourseExam): CourseExamSummary {
    const count = questionCount(exam.questions.length)
    return {
      id: exam.id,
      title: exam.title,
      passingPercentage: exam.passingPercentage,
      bankSize: exam.questions.length,
      questionCount: count,
      durationSeconds: count * SECONDS_PER_QUESTION,
    }
  },

  /** Draws the questions of a new attempt and shuffles each question's options. */
  drawSession(exam: CourseExam, now = new Date()): ExamSessionData {
    const count = questionCount(exam.questions.length)
    const drawn = QuizService.shuffle(exam.questions).slice(0, count)
    return {
      examId: exam.id,
      questionIds: drawn.map((q) => q.id),
      optionOrders: Object.fromEntries(drawn.map((q) => [q.id, QuizService.shuffle([0, 1, 2, 3])])),
      startedAt: now.toISOString(),
      durationSeconds: count * SECONDS_PER_QUESTION,
    }
  },

  /** Session TTL: the attempt can no longer be submitted once it expires. */
  sessionTtlSeconds(session: ExamSessionData): number {
    return session.durationSeconds + SUBMIT_GRACE_SECONDS
  },

  /** The questions of a session as the browser sees them: shuffled options, no answers. */
  toPublicQuestions(exam: CourseExam, session: ExamSessionData): ExamQuestionPublic[] {
    const byId = new Map(exam.questions.map((q) => [q.id, q]))
    return session.questionIds.flatMap((id) => {
      const q = byId.get(id)
      if (!q) return []
      const order = session.optionOrders[id]
      return [
        {
          id: q.id,
          question: q.question,
          options: order.map((i) => q.options[i]) as ExamQuestionPublic['options'],
          multiSelect: correctIndices(q).length > 1,
          tags: q.tags,
        },
      ]
    })
  },

  /**
   * Grades exactly the questions drawn for this session. `answers` use the PRESENTED option
   * indices; they are mapped back to the bank's original order before comparison.
   */
  grade(
    exam: CourseExam,
    session: ExamSessionData,
    answers: { questionId: string; chosen: number[] }[],
    passingPercentage: number,
    now = new Date()
  ): { result: ExamAttemptResult; submission: ExamSubmission } {
    const byId = new Map(exam.questions.map((q) => [q.id, q]))
    const chosenById = new Map(answers.map((a) => [a.questionId, [...new Set(a.chosen)]]))

    const review: ExamReviewItem[] = []
    const graded: ExamAttemptResult['answers'] = []
    const wrongByTag = new Map<string, number>()

    for (const id of session.questionIds) {
      const q = byId.get(id)
      if (!q) continue
      const order = session.optionOrders[id]
      const chosenPresented = (chosenById.get(id) ?? []).filter((i) => i >= 0 && i < order.length)
      const chosenOriginal = chosenPresented.map((i) => order[i])
      const correctOriginal = correctIndices(q)
      const isCorrect = sameSet(chosenOriginal, correctOriginal)

      graded.push({ questionId: id, chosen: chosenOriginal, correct: isCorrect })
      review.push({
        questionId: id,
        chosen: chosenPresented,
        correctOptions: correctOriginal.map((c) => order.indexOf(c)),
        isCorrect,
        explanation: q.explanation,
      })
      if (!isCorrect) for (const tag of q.tags) wrongByTag.set(tag, (wrongByTag.get(tag) ?? 0) + 1)
    }

    const score = graded.filter((a) => a.correct).length
    const total = graded.length
    const percentage = toPercentage(score, total)
    const passed = percentage >= passingPercentage
    const duration = Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000))

    return {
      result: { score, total, percentage, passed, answers: graded, duration },
      submission: {
        score,
        total,
        percentage,
        passed,
        duration,
        weakTags: [...wrongByTag.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => ({ tag, count })),
        review: passed ? review : null,
      },
    }
  },

  // No same-day retake after a pass — enforced server-side so a direct action call can't bypass
  // the UI's own check.
  isRetakeBlocked(latestAttempt: Pick<ExamAttempt, 'passed' | 'createdAt'> | null, now = new Date()): boolean {
    return latestAttempt?.passed === true && isSameDay(latestAttempt.createdAt, now)
  },
}
