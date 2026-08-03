export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export type AskNyxContextKind = 'chapter' | 'lab' | 'tp'

export interface AskNyxContext {
  kind: AskNyxContextKind
  title: string
  excerpt: string
  // Lab coaching only: hints the user has already unlocked (and paid the point cost for) this
  // session — Ask Nyx may build on these, but must never reveal a hint that isn't in this list.
  unlockedHints?: string[]
  totalHints?: number
}
