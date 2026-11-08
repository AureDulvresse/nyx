export function toPercentage(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}
