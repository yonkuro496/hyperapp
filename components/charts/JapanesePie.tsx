"use client"

"use client"

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { BucketData } from "@/lib/agg"

interface JapanesePieChartProps {
  buyNotional: number
  sellNotional: number
  buckets: BucketData[]
}

const BUCKET_COLORS = {
  Small: { buy: "#22c55e", sell: "#ef4444" },
  Medium: { buy: "#16a34a", sell: "#dc2626" },
  Large: { buy: "#15803d", sell: "#b91c1c" },
  Super: { buy: "#166534", sell: "#991b1b" },
}

const BUCKET_NAMES_JP = {
  Small: "Small",
  Medium: "Medium",
  Large: "Large",
  Super: "Super",
} as const

export function JapanesePieChart({ buyNotional = 0, sellNotional = 0, buckets }: JapanesePieChartProps) {
  const buyData: any[] = []
  const sellData: any[] = []

  buckets.forEach((bucket) => {
    if (bucket.buyNotional > 0) {
      buyData.push({
        name: `${bucket.name}_buy`,
        value: bucket.buyNotional,
        color: BUCKET_COLORS[bucket.name as keyof typeof BUCKET_COLORS]?.buy,
        side: "buy",
        bucket: bucket.name,
      })
    }
    if (bucket.sellNotional > 0) {
      sellData.push({
        name: `${bucket.name}_sell`,
        value: bucket.sellNotional,
        color: BUCKET_COLORS[bucket.name as keyof typeof BUCKET_COLORS]?.sell,
        side: "sell",
        bucket: bucket.name,
      })
    }
  })

  const netValue = sellNotional - buyNotional
  const reversedBuyData = [...buyData].reverse()
  const reversedSellData = [...sellData].reverse()

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">Order and Execution Analysis</h3>
        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-600">i</span>
        </div>
        <div className="w-4 h-4 border border-gray-300 rounded"></div>
      </div>

      <div className="text-sm text-gray-600 mb-6">Unit: 10,000</div>

      {/* Pie Chart */}
      <div className="relative h-80 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={reversedBuyData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              startAngle={270}
              endAngle={90}
              paddingAngle={1}
            >
              {reversedBuyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Pie
              data={reversedSellData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              startAngle={270}
              endAngle={450}
              paddingAngle={1}
            >
              {reversedSellData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Sell Dominant</div>
            <div className="text-2xl font-bold text-gray-900">{Math.abs(netValue / 10000).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          <span className="text-gray-600">Aggressive Buy:</span>
          <span className="text-green-600 font-bold text-lg ml-2">{(buyNotional / 10000).toFixed(2)}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-600">Aggressive Sell:</span>
          <span className="text-red-500 font-bold text-lg ml-2">{(sellNotional / 10000).toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {buckets
          .slice()
          .reverse()
          .map((bucket, index) => (
            <div key={index} className="flex items-center justify-start gap-4">
              <span className="text-sm text-gray-700 w-20 text-left">
                {BUCKET_NAMES_JP[bucket.name as keyof typeof BUCKET_NAMES_JP]}
              </span>
              <div className="flex items-center gap-3">
                <div
                  className="h-4 rounded"
                  style={{
                    backgroundColor: BUCKET_COLORS[bucket.name as keyof typeof BUCKET_COLORS]?.buy,
                    width: `${Math.max((bucket.buyNotional / Math.max(buyNotional, sellNotional)) * 80, 8)}px`,
                  }}
                />
                <div className="text-left text-sm font-medium w-16">{(bucket.buyNotional / 10000).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-gray-700">
                  {BUCKET_NAMES_JP[bucket.name as keyof typeof BUCKET_NAMES_JP]}
                </span>
                <div
                  className="h-4 rounded"
                  style={{
                    backgroundColor: BUCKET_COLORS[bucket.name as keyof typeof BUCKET_COLORS]?.sell,
                    width: `${Math.max((bucket.sellNotional / Math.max(buyNotional, sellNotional)) * 80, 8)}px`,
                  }}
                />
                <div className="text-right text-sm font-medium w-16">{(bucket.sellNotional / 10000).toFixed(2)}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
