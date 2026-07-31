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
}
