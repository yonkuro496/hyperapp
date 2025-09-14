import { describe, it, expect } from "vitest"
import { aggregateBuckets, getBucketName, filterRecentTrades } from "@/lib/agg"
import type { HLTrade } from "@/types/hl"

describe("Aggregation Functions", () => {
  const mockTrades: HLTrade[] = [
    { coin: "BTC", px: 45000, sz: 0.1, side: "B", ts: Date.now() - 5000 }, // $4,500 - Small Buy
    { coin: "BTC", px: 45000, sz: 0.5, side: "S", ts: Date.now() - 10000 }, // $22,500 - Medium Sell
    { coin: "BTC", px: 45000, sz: 3, side: "B", ts: Date.now() - 15000 }, // $135,000 - Large Buy
    { coin: "BTC", px: 45000, sz: 25, side: "S", ts: Date.now() - 20000 }, // $1,125,000 - Super Sell
  ]

  it("should calculate total notional correctly", () => {
    const result = aggregateBuckets(mockTrades)

    const expectedBuyTotal = 4500 + 135000 // Small + Large buys
    const expectedSellTotal = 22500 + 1125000 // Medium + Super sells

    expect(result.totalBuyNotional).toBe(expectedBuyTotal)
    expect(result.totalSellNotional).toBe(expectedSellTotal)
  })

  it("should categorize trades into correct buckets", () => {
    expect(getBucketName(5000)).toBe("Small")
    expect(getBucketName(50000)).toBe("Medium")
    expect(getBucketName(500000)).toBe("Large")
    expect(getBucketName(2000000)).toBe("Super")
  })

  it("should calculate Buy Pressure Index correctly", () => {
    const result = aggregateBuckets(mockTrades)

    const totalBuy = 4500 + 135000
    const totalSell = 22500 + 1125000
    const expectedBPI = (totalBuy / (totalBuy + totalSell)) * 100

    expect(result.buyPressureIndex).toBeCloseTo(expectedBPI, 1)
  })

  it("should filter trades by time window", () => {
    const oldTrade: HLTrade = {
      coin: "BTC",
      px: 45000,
      sz: 1,
      side: "B",
      ts: Date.now() - 120000,
    }
    const recentTrade: HLTrade = {
      coin: "BTC",
      px: 45000,
      sz: 1,
      side: "B",
      ts: Date.now() - 30000,
    }

    const trades = [oldTrade, recentTrade]
    const filtered = filterRecentTrades(trades, 60000)

    expect(filtered).toHaveLength(1)
    expect(filtered[0]).toBe(recentTrade)
  })
})
