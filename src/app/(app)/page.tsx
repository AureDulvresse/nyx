import { chapterRepo, courseRepo, quizRepo, flashcardRepo, statsRepo, labRepo } from '@/repositories'
import { calculateSkillLevel, buildActivityHeatmap, findWeakChapters } from '@/services'
import { DashboardPage } from '@/components/features/dashboard/DashboardPage'

export default async function Page() {
  const [
    globalProgress,
    courses,
    recentAttempts,
    flashcardsDue,
    weeklyActivity,
    labsCompleted,
    progressionCounts,
    activityDates,
    quizAttemptsWithContext,
  ] = await Promise.all([
    chapterRepo.getGlobalProgress(),
    courseRepo.findAll(),
    quizRepo.getRecentAttempts(5),
    flashcardRepo.countDueToday(),
    statsRepo.getWeeklyChapterCompletions(),
    labRepo.countCompletedSessions(),
    statsRepo.getProgressionCounts(),
    statsRepo.getActivityDates(),
    quizRepo.getAttemptsWithChapterContext(),
  ])

  const skill = calculateSkillLevel(progressionCounts)
  const activityHeatmap = buildActivityHeatmap(activityDates)
  const weakChapters = findWeakChapters(quizAttemptsWithContext)

  return (
    <DashboardPage
      globalProgress={globalProgress}
      courses={courses}
      recentAttempts={recentAttempts}
      flashcardsDue={flashcardsDue}
      weeklyActivity={weeklyActivity}
      labsCompleted={labsCompleted}
      skill={skill}
      activityHeatmap={activityHeatmap}
      weakChapters={weakChapters}
    />
  )
}
