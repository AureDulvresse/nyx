'use client'

import { useEffect, useRef } from 'react'

/** Thin bar fixed to the top of the viewport showing how far the chapter has been scrolled. */
export function ReadingProgressBar(): React.JSX.Element {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = (): void => {
      frame = 0
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, el.scrollTop / scrollable)) : 0
      // Direct style write (no React state) — keeps scrolling free of re-renders.
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`
    }
    const onScroll = (): void => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 print:hidden">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-violet-nyx" />
    </div>
  )
}
