"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TimeSeriesData {
  timestamp: number
  buyNotional: number
  sellNotional: number
}

interface StackedChartProps {
  timeSeries: TimeSeriesData[]
}

const defaultTimeSeries = Array.from({ length: 12 }, (_, i) => ({
  timestamp: Date.now() - (11 - i) * 5000,
  buyNotional: Math.random() * 100000 + 50000,
  sellNotional: Math.random() * 80000 + 40000,
}))

export function StackedChart({ timeSeries = defaultTimeSeries }: StackedChartProps) {
  const data = timeSeries.map((item) => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      minute: "2-digit",
      second: "2-digit",
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Area type="monotone" dataKey="buyNotional" stackId="1" stroke="#22c55e" fill="#22c55e" name="Buy Volume" />
        <Area type="monotone" dataKey="sellNotional" stackId="1" stroke="#ef4444" fill="#ef4444" name="Sell Volume" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
