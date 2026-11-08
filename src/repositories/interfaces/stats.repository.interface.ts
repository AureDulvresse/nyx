export interface ProgressionCounts {
  chaptersCompleted: number
  quizzesPassed: number
  tpsCompleted: number
  labsCompleted: number
  projectsCompleted: number
}

export interface IStatsRepository {
  getActivityDates(): Promise<Date[]>
  getWeeklyChapterCompletions(): Promise<{ day: string; chapters: number }[]>
  getProgressionCounts(): Promise<ProgressionCounts>
  getEarnedCredits(): Promise<{ earned: number; total: number }>
}
