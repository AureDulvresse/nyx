function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function calculateStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0

  const activeDays = new Set(activityDates.map(toDayKey))
  let cursor = new Date()

  // If nothing happened yet today, the streak isn't broken until a full day passes with no
  // activity — start counting from yesterday so "0 activity today, active every day before" still
  // reports the real streak instead of resetting to 0 the moment midnight passes.
  if (!activeDays.has(toDayKey(cursor))) {
    cursor = new Date(cursor.getTime() - 24 * 3600 * 1000)
  }

  let streak = 0
  while (activeDays.has(toDayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - 24 * 3600 * 1000)
  }
  return streak
}
