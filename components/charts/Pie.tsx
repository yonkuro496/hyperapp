"use client"

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface PieChartProps {
  buyNotional: number
  sellNotional: number
  buyPressureIndex: number
}

const COLORS = {
  buy: "#22c55e",
  sell: "#ef4444",
}

export function PieChart({ buyNotional, sellNotional, buyPressureIndex }: PieChartProps) {
  const data = [
    { name: "Buy", value: buyNotional, color: COLORS.buy },
    { name: "Sell", value: sellNotional, color: COLORS.sell },
  ]

  const total = buyNotional + sellNotional

  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" startAngle={270}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Center BPI Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{buyPressureIndex.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">BPI</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: COLORS.buy }} className="w-3 h-3 rounded-full"></div>
          <span className="text-sm">Buy ${(buyNotional / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: COLORS.sell }} className="w-3 h-3 rounded-full"></div>
          <span className="text-sm">Sell ${(sellNotional / 1000000).toFixed(1)}M</span>
        </div>
      </div>
    </div>
  )
}
