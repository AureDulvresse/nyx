export function getWhisperUrl(): string {
  return process.env.WHISPER_URL ?? 'http://localhost:9002'
}
