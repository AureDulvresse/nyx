import { Sidebar } from "@/components/features/layout/Sidebar";
import { Header } from "@/components/features/layout/Header";
import { AskNyxWidget } from "@/components/features/assistant/AskNyxWidget";
import { statsRepo } from "@/repositories";
import { calculateStreak, calculateScore } from "@/services";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [activityDates, credits, progressionCounts] = await Promise.all([
    statsRepo.getActivityDates(),
    statsRepo.getEarnedCredits(),
    statsRepo.getProgressionCounts(),
  ]);
  const streak = calculateStreak(activityDates);
  const points = calculateScore(progressionCounts);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-y-auto">
        <Header streak={streak} credits={credits} points={points} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
      <AskNyxWidget />
    </div>
  );
}
