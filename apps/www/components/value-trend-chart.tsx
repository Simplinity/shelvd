'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = {
  date: string
  value: number
  label: string
  currency: string
}

type Props = {
  data: DataPoint[]
  formatCurrency: (amount: number, currency: string) => string
}

export default function ValueTrendChart({ data, formatCurrency }: Props) {
  if (data.length < 2) return null

  const currency = data[0]?.currency || 'EUR'

  return (
    <div className="mb-6 p-4 border border-border bg-muted/20">
      <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Value Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
              return String(v)
            }}
            width={45}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value), currency), 'Value']}
            labelFormatter={(label) => label}
            contentStyle={{
              fontSize: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))',
              borderRadius: 0,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(var(--background))', stroke: 'hsl(var(--foreground))', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'hsl(var(--foreground))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
