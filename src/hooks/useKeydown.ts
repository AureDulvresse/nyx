'use client'

import { useEffect, useRef } from 'react'
import { hasModifier, isTypingTarget } from '@/lib/utils/keyboard.utils'

/**
 * Global keydown listener for page-level shortcuts. Skips events from text fields and
 * modifier combos; the latest handler is always used without re-subscribing.
 */
export function useKeydown(handler: (e: KeyboardEvent) => void, enabled = true): void {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.defaultPrevented || e.repeat || hasModifier(e) || isTypingTarget(e.target)) return
      handlerRef.current(e)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
