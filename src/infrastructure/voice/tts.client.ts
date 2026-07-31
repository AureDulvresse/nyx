export function getPiperUrl(): string {
  return process.env.PIPER_URL ?? 'http://localhost:8082'
}
