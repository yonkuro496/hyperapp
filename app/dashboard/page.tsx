"use client"

import { useState, useEffect, useRef } from "react"
import type { HLTrade } from "@/types/hl"
import { WebSocketClient } from "@/lib/ws"
import { aggregateBuckets, filterRecentTrades } from "@/lib/agg"
import { PieChart } from "@/components/charts/Pie"
import { BarChart } from "@/components/charts/Bar"
import { StackedChart } from "@/components/charts/Stacked"
import { StatusBadge } from "@/components/StatusBadge"
import { Card } from "@/components/Card"
import featuredTraders from "@/data/featuredTraders.json"

type ConnectionStatus = "CONNECTED" | "RECONNECTING" | "ERROR" | "DISCONNECTED"

export default function Dashboard() {
  const [allTrades, setAllTrades] = useState<HLTrade[]>([])
  const [selectedCoin, setSelectedCoin] = useState<string>("ETH") // Default to ETH
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("DISCONNECTED")
  const wsRef = useRef<WebSocketClient | null>(null)

  useEffect(() => {
    const ws = new WebSocketClient("wss://api.hyperliquid.xyz/ws")
    wsRef.current = ws

    ws.onStatusChange = (status) => {
      setConnectionStatus(status as ConnectionStatus)
    }

    ws.onTrade = (trade: HLTrade) => {
      setAllTrades((prev) => {
        const updated = [...prev, trade]
        return filterRecentTrades(updated)
      })
    }

    ws.connect()

    // Cleanup old trades every 10 seconds
    const cleanupInterval = setInterval(() => {
      setAllTrades((prev) => filterRecentTrades(prev))
    }, 10000)

    return () => {
      clearInterval(cleanupInterval)
      ws.close()
    }
  }, [])

  // Filter trades based on selectedCoin for display
  const filteredTrades = allTrades.filter(trade => trade.coin === selectedCoin)
  const aggregatedData = aggregateBuckets(filteredTrades)
  const recentTrades = filteredTrades.slice(-10).reverse()
  const lastPrice = recentTrades.length > 0 ? recentTrades[0].px : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">TraderScope Hyperliquid</h1>
          <div className="flex items-center gap-4">
            {["BTC", "ETH", "SOL", "HYPE"].map((coin) => (
              <button
                key={coin}
                className={`text-lg font-semibold px-3 py-1 rounded ${
                  selectedCoin === coin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setSelectedCoin(coin)}
              >
                {coin}
              </button>
            ))}
            <span className="text-lg font-semibold ml-4">
              {selectedCoin}: ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <StatusBadge status={connectionStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Charts Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Row - Pie and Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Buy/Sell Distribution" className="h-80">
                <PieChart
                  buyNotional={aggregatedData.totalBuyNotional}
                  sellNotional={aggregatedData.totalSellNotional}
                  buyPressureIndex={aggregatedData.buyPressureIndex}
                />
              </Card>
              <Card title="Volume by Size" className="h-80">
                <BarChart buckets={aggregatedData.buckets} />
              </Card>
            </div>

            {/* Time Series Chart */}
            <Card title="Real-time Activity" className="h-64">
              <StackedChart timeSeries={aggregatedData.timeSeries} />
            </Card>

            {/* Recent Trades Debug */}
            <Card title="Recent Trades" className="h-48">
              <div className="overflow-auto h-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Side</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Notional</th>
                      <th className="text-left p-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((trade, i) => (
                      <tr key={i} className="border-b">
                        <td className={`p-2 font-semibold ${trade.side === "B" ? "text-green-600" : "text-red-600"}`}>
                          {trade.side === "B" ? "BUY" : "SELL"}
                        </td>
                        <td className="p-2">${trade.px.toLocaleString()}</td>
                        <td className="p-2">{trade.sz.toFixed(4)}</td>
                        <td className="p-2">${(trade.px * trade.sz).toLocaleString()}</td>
                        <td className="p-2">{new Date(trade.ts).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column - Featured Traders */}
          <div className="lg:col-span-1">
            <Card title="Featured Traders" className="h-full">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Trader</th>
                      <th className="text-left p-2">Side</th>
                      <th className="text-left p-2">Notional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredTraders.map((trader, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 font-medium">{trader.trader}</td>
                        <td className={`p-2 font-semibold ${trader.side === "B" ? "text-green-600" : "text-red-600"}`}>
                          {trader.side === "B" ? "BUY" : "SELL"}
                        </td>
                        <td className="p-2">${trader.notional.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}