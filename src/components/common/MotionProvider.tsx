'use client'

import { LazyMotion, domAnimation } from 'framer-motion'

/**
 * Loads framer-motion's DOM animation features once for the whole app so cards can use the
 * lightweight `m` components instead of the full `motion` bundle.
 * Not `strict`: legacy `motion.*` components still work inside it.
 */
export function MotionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}
