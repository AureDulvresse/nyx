'use client'

import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/common/Skeleton'

// recharts is heavy: load the chart itself only on the client, after hydration.
const WeeklyChartInner = dynamic(() => import('./WeeklyChartInner'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

export function WeeklyChart({ data }: { data: { day: string; chapters: number }[] }): React.JSX.Element {
  const isEmpty = data.every((d) => d.chapters === 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité de la semaine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          <WeeklyChartInner data={data} />

          {isEmpty && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="rounded-md bg-background/80 px-3 py-1.5 text-sm text-text-secondary">
                Termine un chapitre pour voir ton activité apparaître ici.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
