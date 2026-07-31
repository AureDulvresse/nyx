export interface SessionData {
  kaliId: string
}

declare global {
  var labSessionsGlobal: Map<string, SessionData> | undefined
}

export const sessions: Map<string, SessionData> = globalThis.labSessionsGlobal ?? new Map()

if (process.env.NODE_ENV !== 'production') globalThis.labSessionsGlobal = sessions
