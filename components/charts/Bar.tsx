"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface BucketData {
  name: string
  buyNotional: number
  sellNotional: number
}

interface BarChartProps {
  buckets: BucketData[]
}

const defaultBuckets = [
  { name: "Small", buyNotional: 50000, sellNotional: 45000 },
  { name: "Medium", buyNotional: 300000, sellNotional: 250000 },
  { name: "Large", buyNotional: 500000, sellNotional: 400000 },
  { name: "Super", buyNotional: 150000, sellNotional: 105000 },
]

export function BarChart({ buckets = defaultBuckets }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={buckets} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          labelFormatter={(label) => `${label} Orders`}
        />
        <Legend />
        <Bar dataKey="buyNotional" fill="#22c55e" name="Buy Volume" />
        <Bar dataKey="sellNotional" fill="#ef4444" name="Sell Volume" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
