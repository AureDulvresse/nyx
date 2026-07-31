'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function WeeklyChart({ data }: { data: { day: string; chapters: number }[] }) {
  const isEmpty = data.every((d) => d.chapters === 0)
  const maxValue = Math.max(1, ...data.map((d) => d.chapters))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité de la semaine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, maxValue]}
              />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => [`${value} chapitre${Number(value) > 1 ? 's' : ''} terminé${Number(value) > 1 ? 's' : ''}`, '']}
              />
              <Bar dataKey="chapters" fill="var(--violet-nyx)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>

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
