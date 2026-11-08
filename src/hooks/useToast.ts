'use client'

import { useMemo } from 'react'
import { useToastStore } from '@/lib/store/toast.store'

export interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

// Memoized so consumers can safely list `toast` in hook dependency arrays.
export function useToast(): ToastApi {
  const push = useToastStore((s) => s.push)

  return useMemo(
    () => ({
      success: (message: string) => push(message, 'success'),
      error: (message: string) => push(message, 'error'),
      info: (message: string) => push(message, 'info'),
    }),
    [push]
  )
}
