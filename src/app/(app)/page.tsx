import { chapterRepo, courseRepo, quizRepo, flashcardRepo, statsRepo, labRepo } from '@/repositories'
import { calculateSkillLevel, buildActivityHeatmap, findWeakChapters, calculateStreak } from '@/services'
import { buildTodayPlan } from '@/services/today.service'
import { DashboardPage } from '@/components/features/dashboard/DashboardPage'

export default async function Page(): Promise<React.JSX.Element> {
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
    resume,
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
    chapterRepo.findResumePoint(),
  ])

  const skill = calculateSkillLevel(progressionCounts)
  const activityHeatmap = buildActivityHeatmap(activityDates)
  const weakChapters = findWeakChapters(quizAttemptsWithContext)
  const today = buildTodayPlan({
    flashcardsDue,
    resume,
    weakChapters,
    activityDates,
    streak: calculateStreak(activityDates),
  })

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
      resume={resume}
      today={today}
    />
  )
}
