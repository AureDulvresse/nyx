'use client'

import { useCallback } from 'react'
import { useToastStore } from '@/lib/store/toast.store'

export function useToast() {
  const push = useToastStore((s) => s.push)

  return {
    success: useCallback((message: string) => push(message, 'success'), [push]),
    error: useCallback((message: string) => push(message, 'error'), [push]),
    info: useCallback((message: string) => push(message, 'info'), [push]),
  }
}
