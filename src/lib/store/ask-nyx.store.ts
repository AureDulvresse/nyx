import { create } from 'zustand'
import type { AskNyxContext } from '@/domain'

interface AskNyxStore {
  context: AskNyxContext | null
  setContext: (context: AskNyxContext) => void
  clearContext: () => void
  setLabHints: (unlockedHints: string[], totalHints: number) => void
}

// Populated by whichever chapter/lab/TP page is currently mounted (see AskNyxContextSetter),
// so the floating widget can ground its answers in what the user is actually looking at.
export const useAskNyxStore = create<AskNyxStore>((set) => ({
  context: null,
  setContext: (context) => set({ context }),
  clearContext: () => set({ context: null }),
  // Merged into the existing lab context as hints get unlocked in LabMission — a no-op if the
  // user has since navigated away and the base context (kind/title/excerpt) was cleared.
  setLabHints: (unlockedHints, totalHints) =>
    set((s) => (s.context ? { context: { ...s.context, unlockedHints, totalHints } } : s)),
}))
