"use client"

import { useState, useEffect, useRef } from "react"
import type { HLTrade } from "@/types/hl"
import { WebSocketClient } from "@/lib/ws"
import { AVAILABLE_COINS } from "@/config/buckets"
import { aggregateBuckets, filterRecentTrades, generateTimeSeries } from "@/lib/agg"
import { JapanesePieChart } from "@/components/charts/JapanesePie"
import { BarChart } from "@/components/charts/Bar"
import { StackedChart } from "@/components/charts/Stacked"
import { StatusBadge } from "@/components/StatusBadge"
import { Card } from "@/components/Card"
import featuredTradersData from "@/data/featuredTraders.json"

type ConnectionStatus = "CONNECTED" | "RECONNECTING" | "ERROR" | "DISCONNECTED"

export default function Dashboard() {
  const [trades, setTrades] = useState<HLTrade[]>([])
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
      setTrades((prev) => {
        const updated = [...prev, trade]
        return filterRecentTrades(updated)
      })
    }

    ws.connect()

    const cleanupInterval = setInterval(() => {
      setTrades((prev) => filterRecentTrades(prev))
    }, 10000)

    return () => {
      clearInterval(cleanupInterval)
      ws.close()
    }
  }, [])

  const filteredTrades = trades.filter(trade => trade.coin === selectedCoin)
  const aggregatedData = aggregateBuckets(filteredTrades)
  const timeSeries = generateTimeSeries(filteredTrades)
  const lastPrice = filteredTrades.length > 0 ? filteredTrades[0].px : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
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
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={connectionStatus} />
            <button className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="p-2">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 text-sm">Exchange Fee Free Notice</span>
            <button className="text-blue-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </button>
          </div>
          <button className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button className="px-4 py-3 text-orange-500 border-b-2 border-orange-500 font-medium">Charts</button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900 relative">
            Bulletin Board
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900 relative">
            News
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900">Overview</button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow-sm w-full">
            

            <div className="p-4">
              <JapanesePieChart
                buyNotional={aggregatedData.totalBuyNotional}
                sellNotional={aggregatedData.totalSellNotional}
                buckets={aggregatedData.buckets}
              />
            </div>
          </div>

          {/* Volume by Size Chart */}
          <Card title="Volume by Size" subtitle="Size-based Volume Distribution">
            <div className="h-80">
              <BarChart buckets={aggregatedData.buckets} />
            </div>
          </Card>

          {/* Time Series Chart */}
          <Card title="Time Series Analysis" subtitle="Time Series Analysis">
            <div className="h-80">
              <StackedChart timeSeries={timeSeries} />
            </div>
          </Card>

          {/* Recent Trades */} 
          <Card title="Recent Trades" className="h-96">
            <div className="overflow-auto h-full">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-4 py-2 text-nowrap">Side</th>
                    <th className="text-left px-4 py-2 text-nowrap">Price</th>
                    <th className="text-left px-4 py-2 text-nowrap">Size</th>
                    <th className="text-left px-4 py-2 text-nowrap">Notional</th>
                    <th className="text-left px-4 py-2 text-nowrap">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.slice(-9).reverse().map((trade, i) => (
                    <tr key={i} className="border-b">
                      <td className={`px-4 py-2 font-semibold ${trade.side === "B" ? "text-green-600" : "text-red-600"} break-all`}>
                        {trade.side === "B" ? "BUY" : "SELL"}
                      </td>
                      <td className="px-4 py-2 break-all">${trade.px.toLocaleString()}</td>
                      <td className="px-4 py-2 break-all">{trade.sz.toFixed(4)}</td>
                      <td className="px-4 py-2 break-all">${(trade.px * trade.sz).toLocaleString()}</td>
                      <td className="px-4 py-2 break-all">{new Date(trade.ts).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          

          {/* Connection Status */}
          <div className="text-center py-4">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
              <span>Connection Status:</span>
              <StatusBadge status={connectionStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
