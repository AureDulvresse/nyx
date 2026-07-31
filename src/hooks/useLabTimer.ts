'use client'

import { useEffect, useState } from 'react'

// Ticks once per second only while `isActive` is true — the caller passes `state === 'active'`
// (post-provisioning, terminal connected), so the timer is naturally paused while Docker
// provisions the environment and resumes the instant the terminal is actually usable.
export function useLabTimer(isActive: boolean): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isActive])

  return elapsedSeconds
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
