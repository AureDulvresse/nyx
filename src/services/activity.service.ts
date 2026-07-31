export interface ActivityDay {
  date: string
  count: number
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function buildActivityHeatmap(activityDates: Date[], weeks = 20): ActivityDay[] {
  const counts = new Map<string, number>()
  for (const date of activityDates) {
    const key = toDayKey(date)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const totalDays = weeks * 7
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: ActivityDay[] = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const day = new Date(today.getTime() - i * 86_400_000)
    const key = toDayKey(day)
    days.push({ date: key, count: counts.get(key) ?? 0 })
  }
  return days
}
