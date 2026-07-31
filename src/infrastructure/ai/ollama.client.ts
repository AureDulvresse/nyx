export function getOllamaUrl(): string {
  return process.env.OLLAMA_URL ?? 'http://localhost:11434'
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL ?? 'llama3.2:3b'
}
