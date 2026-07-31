'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { submitQuiz } from '@/actions'
import type { Quiz, QuizAttemptResult } from '@/domain'

export function useQuizSession(quiz: Quiz) {
  const [startedAt] = useState(() => Date.now())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; chosen: number }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState<QuizAttemptResult | null>(null)
  const [isSubmitting, startTransition] = useTransition()

  const total = quiz.questions.length
  const currentQuestion = quiz.questions[currentIndex]

  const select = useCallback((choice: number) => {
    if (!revealed) setSelected(choice)
  }, [revealed])

  const reveal = useCallback(() => {
    if (selected === null) return
    setRevealed(true)
  }, [selected])

  const next = useCallback(() => {
    const updatedAnswers = [...answers, { questionId: currentQuestion.id, chosen: selected ?? -1 }]
    setAnswers(updatedAnswers)

    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
      setRevealed(false)
      return
    }

    startTransition(async () => {
      const duration = Math.round((Date.now() - startedAt) / 1000)
      const res = await submitQuiz({ quizId: quiz.id, answers: updatedAnswers, duration })
      if (res.success) setResult(res.data)
    })
  }, [answers, currentQuestion, currentIndex, quiz.id, selected, startedAt, total])

  const restart = useCallback(() => {
    setCurrentIndex(0)
    setAnswers([])
    setSelected(null)
    setRevealed(false)
    setResult(null)
  }, [])

  return useMemo(
    () => ({ currentIndex, currentQuestion, total, selected, revealed, result, isSubmitting, select, reveal, next, restart }),
    [currentIndex, currentQuestion, total, selected, revealed, result, isSubmitting, select, reveal, next, restart]
  )
}
