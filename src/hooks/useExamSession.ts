'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { startExam, submitExam } from '@/actions'
import { useToast } from '@/hooks/useToast'
import type { CourseExamSummary, ExamPaper, ExamQuestionPublic, ExamSubmission } from '@/domain'

export type ExamPhase = 'intro' | 'running' | 'done'

export interface ExamSessionState {
  phase: ExamPhase
  questions: ExamQuestionPublic[]
  currentIndex: number
  currentQuestion: ExamQuestionPublic | null
  total: number
  answersByQuestion: Record<string, number[]>
  answeredCount: number
  remainingSeconds: number
  result: ExamSubmission | null
  error: string | null
  isPending: boolean
  start: () => void
  select: (choice: number) => void
  goTo: (index: number) => void
  submit: () => void
  restart: () => void
}

export function useExamSession(exam: CourseExamSummary): ExamSessionState {
  const [paper, setPaper] = useState<ExamPaper | null>(null)
  const [deadline, setDeadline] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, number[]>>({})
  const [result, setResult] = useState<ExamSubmission | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  // Synchronous double-submit guard (timer reaching 0 while the user clicks "Terminer").
  const hasSubmittedRef = useRef(false)
  const toast = useToast()

  const questions = useMemo(() => paper?.questions ?? [], [paper])
  const total = questions.length
  const currentQuestion = questions[currentIndex] ?? null
  const phase: ExamPhase = result ? 'done' : paper ? 'running' : 'intro'
  const remainingSeconds = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : exam.durationSeconds

  const start = useCallback((): void => {
    setError(null)
    startTransition(async () => {
      const res = await startExam({ examId: exam.id })
      if (!res.success) {
        setError(res.error)
        return
      }
      hasSubmittedRef.current = false
      setPaper(res.data)
      setCurrentIndex(0)
      setAnswersByQuestion({})
      setNow(Date.now())
      setDeadline(Date.now() + res.data.durationSeconds * 1000)
    })
  }, [exam.id])

  const submit = useCallback((): void => {
    if (!paper || hasSubmittedRef.current) return
    hasSubmittedRef.current = true

    const answers = paper.questions.map((q) => ({ questionId: q.id, chosen: answersByQuestion[q.id] ?? [] }))
    startTransition(async () => {
      const res = await submitExam({ token: paper.token, answers })
      if (!res.success) {
        setError(res.error)
        hasSubmittedRef.current = false
        return
      }
      setResult(res.data)
      setDeadline(null)
      toast[res.data.passed ? 'success' : 'error'](
        res.data.passed
          ? `Examen réussi — ${res.data.percentage}% (seuil ${exam.passingPercentage}%).`
          : `Examen échoué — ${res.data.percentage}% (seuil ${exam.passingPercentage}% requis). Tu peux le repasser.`
      )
    })
  }, [paper, answersByQuestion, exam.passingPercentage, toast])

  // Clock tick while the attempt is running.
  useEffect(() => {
    if (!deadline) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [deadline])

  // Auto-submit when time is up (the server rejects late submissions anyway).
  useEffect(() => {
    if (phase === 'running' && remainingSeconds === 0) submit()
  }, [phase, remainingSeconds, submit])

  const select = useCallback(
    (choice: number): void => {
      if (!currentQuestion) return
      setAnswersByQuestion((prev) => {
        if (!currentQuestion.multiSelect) return { ...prev, [currentQuestion.id]: [choice] }
        const current = prev[currentQuestion.id] ?? []
        const next = current.includes(choice) ? current.filter((c) => c !== choice) : [...current, choice]
        return { ...prev, [currentQuestion.id]: next }
      })
    },
    [currentQuestion]
  )

  const goTo = useCallback(
    (index: number): void => {
      if (index >= 0 && index < total) setCurrentIndex(index)
    },
    [total]
  )

  const restart = useCallback((): void => {
    setPaper(null)
    setResult(null)
    setDeadline(null)
    setError(null)
  }, [])

  const answeredCount = Object.values(answersByQuestion).filter((c) => c.length > 0).length

  return {
    phase,
    questions,
    currentIndex,
    currentQuestion,
    total,
    answersByQuestion,
    answeredCount,
    remainingSeconds,
    result,
    error,
    isPending,
    start,
    select,
    goTo,
    submit,
    restart,
  }
}
