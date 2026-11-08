import { format, formatDistanceToNow, isToday, isPast, addDays, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export const DateUtils = {
  format: (date: Date | string, pattern = 'dd MMM yyyy'): string =>
    format(new Date(date), pattern, { locale: fr }),

  relative: (date: Date | string): string =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr }),

  isToday: (date: Date | string): boolean => isToday(new Date(date)),

  isPast: (date: Date | string): boolean => isPast(new Date(date)),

  addDays,

  daysUntil: (date: Date | string): number => differenceInDays(new Date(date), new Date()),
}

// Elapsed/remaining seconds as m:ss, for exam countdowns and lab timers.
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
