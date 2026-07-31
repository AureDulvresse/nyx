// Turns a chapter/lab's raw MDX source into something Piper can read naturally: code blocks and
// data-heavy self-closing components (Steps, CompareTable...) are dropped since reading their raw
// syntax aloud is unintelligible, while prose callouts (WarningCallout, TipCallout...) keep their
// inner text since it's often the most important safety/context note in the chapter.
export function stripMarkdownForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[A-Z]\w*[\s\S]*?\/>/g, '')
    .replace(/<([A-Z]\w*)[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{2,}/g, '\n\n')
    .trim()
}
