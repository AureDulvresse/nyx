'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

/** Recharts bar chart — loaded lazily on the client by `WeeklyChart` to keep recharts out of the initial bundle. */
export default function WeeklyChartInner({ data }: { data: { day: string; chapters: number }[] }): React.JSX.Element {
  const maxValue = Math.max(1, ...data.map((d) => d.chapters))

  return (
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
  )
}
