'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { submitExam } from '@/actions'
import type { CourseExam, ExamAttemptResult } from '@/domain'

// Certification-style pacing (CEH/Security+ ballpark) rather than the untimed, reveal-as-you-go
// chapter quiz — the whole point of a final exam is to simulate real exam conditions.
const SECONDS_PER_QUESTION = 90

export function useExamSession(exam: CourseExam) {
  const totalSeconds = exam.questions.length * SECONDS_PER_QUESTION
  const [startedAt] = useState(() => Date.now())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, number>>({})
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [result, setResult] = useState<ExamAttemptResult | null>(null)
  const [isSubmitting, startTransition] = useTransition()

  const total = exam.questions.length
  const currentQuestion = exam.questions[currentIndex]

  const submit = useCallback(() => {
    setResult((prev) => {
      if (prev) return prev
      const answers = exam.questions.map((q) => ({ questionId: q.id, chosen: answersByQuestion[q.id] ?? -1 }))
      startTransition(async () => {
        const duration = Math.round((Date.now() - startedAt) / 1000)
        const res = await submitExam({ examId: exam.id, answers, duration })
        if (res.success) setResult(res.data)
      })
      return prev
    })
  }, [exam.id, exam.questions, answersByQuestion, startedAt])

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
      setAnswersByQuestion((prev) => ({ ...prev, [currentQuestion.id]: choice }))
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
    setCurrentIndex(0)
    setAnswersByQuestion({})
    setRemainingSeconds(totalSeconds)
    setResult(null)
  }, [totalSeconds])

  const answeredCount = Object.keys(answersByQuestion).length

  return useMemo(
    () => ({
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
