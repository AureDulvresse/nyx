'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { submitExam } from '@/actions'
import { useToast } from '@/hooks/useToast'
import type { CourseExam, ExamAttemptResult, QuizQuestion } from '@/domain'

// Certification-style pacing (CEH/Security+ ballpark) rather than the untimed, reveal-as-you-go
// chapter quiz — the whole point of a final exam is to simulate real exam conditions.
const SECONDS_PER_QUESTION = 90

export function isMultiSelect(question: QuizQuestion): boolean {
  return Array.isArray(question.correct) && question.correct.length > 1
}

function correctIndices(question: QuizQuestion): number[] {
  return Array.isArray(question.correct) ? question.correct : [question.correct]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Reorders one question's 4 options and remaps `correct` to match — so memorizing "the 2nd
// option" from a previous attempt is useless, the content itself hasn't moved, only its position.
function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const correctSet = new Set(correctIndices(question))
  const order = shuffle([0, 1, 2, 3])
  const options = order.map((i) => question.options[i]) as [string, string, string, string]
  const remapped = order.reduce<number[]>((acc, originalIndex, newIndex) => {
    if (correctSet.has(originalIndex)) acc.push(newIndex)
    return acc
  }, [])
  return { ...question, options, correct: (remapped.length === 1 ? remapped[0] : remapped) as QuizQuestion['correct'] }
}

// Draws a random ~60% slice of the question bank per attempt (once banks are large enough — see
// content authoring) so two attempts rarely see the exact same set, on top of the per-attempt
// question/option shuffle above. Falls back to the full bank untouched if it's already small.
const SUBSET_RATIO = 0.6
const MIN_SUBSET_SIZE = 20

function buildShuffledQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const targetSize = Math.max(MIN_SUBSET_SIZE, Math.round(questions.length * SUBSET_RATIO))
  const pool = questions.length > targetSize ? shuffle(questions).slice(0, targetSize) : shuffle(questions)
  return pool.map(shuffleQuestionOptions)
}

export function useExamSession(exam: CourseExam) {
  const [shuffledQuestions, setShuffledQuestions] = useState(() => buildShuffledQuestions(exam.questions))
  // Based on the drawn subset actually presented this attempt, not the full question bank — a
  // 60-question bank sliced down to 30 for this attempt should still get ~30 questions' worth of
  // time, not time for all 60.
  const totalSeconds = shuffledQuestions.length * SECONDS_PER_QUESTION
  const [startedAt] = useState(() => Date.now())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, number[]>>({})
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [result, setResult] = useState<ExamAttemptResult | null>(null)
  const [isSubmitting, startTransition] = useTransition()
  // A functional setState updater must stay pure — starting a transition inside one (as this used
  // to do, to guard against double-submit) trips React's "cannot call startTransition while
  // rendering" the moment two triggers race (e.g. the timer hitting 0 right as the user clicks
  // "Terminer"). A ref gives the same synchronous double-submit guard without that side effect.
  const hasSubmittedRef = useRef(false)
  const toast = useToast()

  const total = shuffledQuestions.length
  const currentQuestion = shuffledQuestions[currentIndex]

  const submit = useCallback(() => {
    if (hasSubmittedRef.current) return
    hasSubmittedRef.current = true

    const answers = shuffledQuestions.map((q) => ({ questionId: q.id, chosen: answersByQuestion[q.id] ?? [] }))
    startTransition(async () => {
      const duration = Math.round((Date.now() - startedAt) / 1000)
      const res = await submitExam({ examId: exam.id, answers, duration })
      if (res.success) {
        setResult(res.data)
        toast[res.data.passed ? 'success' : 'error'](
          res.data.passed
            ? `Examen réussi — ${res.data.percentage}% (seuil ${exam.passingPercentage}%).`
            : `Examen échoué — ${res.data.percentage}% (seuil ${exam.passingPercentage}% requis). Tu peux le repasser.`
        )
      }
    })
  }, [exam.id, exam.passingPercentage, shuffledQuestions, answersByQuestion, startedAt, toast])

  useEffect(() => {
    if (result) return
    const interval = setInterval(() => setRemainingSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(interval)
  }, [result])

  useEffect(() => {
    if (remainingSeconds === 0 && !result) submit()
  }, [remainingSeconds, result, submit])

  const select = useCallback(
    (choice: number) => {
      setAnswersByQuestion((prev) => {
        const current = prev[currentQuestion.id] ?? []
        if (!isMultiSelect(currentQuestion)) return { ...prev, [currentQuestion.id]: [choice] }

        const next = current.includes(choice) ? current.filter((c) => c !== choice) : [...current, choice]
        return { ...prev, [currentQuestion.id]: next }
      })
    },
    [currentQuestion]
  )

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < total) setCurrentIndex(index)
    },
    [total]
  )

  const restart = useCallback(() => {
    hasSubmittedRef.current = false
    setShuffledQuestions(buildShuffledQuestions(exam.questions))
    setCurrentIndex(0)
    setAnswersByQuestion({})
    setRemainingSeconds(totalSeconds)
    setResult(null)
  }, [exam.questions, totalSeconds])

  const answeredCount = Object.keys(answersByQuestion).length

  return useMemo(
    () => ({
      shuffledQuestions,
      currentIndex,
      currentQuestion,
      total,
      answersByQuestion,
      answeredCount,
      remainingSeconds,
      result,
      isSubmitting,
      select,
      goTo,
      submit,
      restart,
    }),
    [
      shuffledQuestions,
      currentIndex,
      currentQuestion,
      total,
      answersByQuestion,
      answeredCount,
      remainingSeconds,
      result,
      isSubmitting,
      select,
      goTo,
      submit,
      restart,
    ]
  )
}

export function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
