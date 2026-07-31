export interface IStatsRepository {
  getActivityDates(): Promise<Date[]>
  getWeeklyChapterCompletions(): Promise<{ day: string; chapters: number }[]>
  getProgressionCounts(): Promise<{
    chaptersCompleted: number
    quizzesPassed: number
    tpsCompleted: number
    labsCompleted: number
    projectsCompleted: number
  }>
  getEarnedCredits(): Promise<{ earned: number; total: number }>
}
