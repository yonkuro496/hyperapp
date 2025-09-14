import type { HLTrade } from "@/types/hl"
import { BUCKET_THRESHOLDS, BUCKET_NAMES } from "@/config/buckets"

export interface BucketData {
  name: string
  buyNotional: number
  sellNotional: number
}

export interface TimeSeriesData {
  timestamp: number
  buyNotional: number
  sellNotional: number
}

export interface AggregatedData {
  totalBuyNotional: number
  totalSellNotional: number
  buyPressureIndex: number
  buckets: BucketData[]
  timeSeries: TimeSeriesData[]
}

export function filterRecentTrades(trades: HLTrade[], windowMs = 60000): HLTrade[] {
  const cutoff = Date.now() - windowMs
  return trades.filter((trade) => trade.ts >= cutoff)
}

export function getBucketName(notional: number): string {
  if (notional < BUCKET_THRESHOLDS.SMALL) return BUCKET_NAMES.SMALL
  if (notional < BUCKET_THRESHOLDS.MEDIUM) return BUCKET_NAMES.MEDIUM
  if (notional < BUCKET_THRESHOLDS.LARGE) return BUCKET_NAMES.LARGE
  return BUCKET_NAMES.SUPER
}

export function aggregateBuckets(trades: HLTrade[]): AggregatedData {
  const recentTrades = filterRecentTrades(trades)

  // Initialize buckets
  const buckets: Record<string, BucketData> = {
    [BUCKET_NAMES.SMALL]: { name: BUCKET_NAMES.SMALL, buyNotional: 0, sellNotional: 0 },
    [BUCKET_NAMES.MEDIUM]: { name: BUCKET_NAMES.MEDIUM, buyNotional: 0, sellNotional: 0 },
    [BUCKET_NAMES.LARGE]: { name: BUCKET_NAMES.LARGE, buyNotional: 0, sellNotional: 0 },
    [BUCKET_NAMES.SUPER]: { name: BUCKET_NAMES.SUPER, buyNotional: 0, sellNotional: 0 },
  }

  let totalBuyNotional = 0
  let totalSellNotional = 0

  // Aggregate by buckets
  recentTrades.forEach((trade) => {
    const notional = trade.px * trade.sz
    const bucketName = getBucketName(notional)

    if (trade.side === "B") {
      buckets[bucketName].buyNotional += notional
      totalBuyNotional += notional
    } else {
      buckets[bucketName].sellNotional += notional
      totalSellNotional += notional
    }
  })

  // Calculate BPI
  const total = totalBuyNotional + totalSellNotional
  const buyPressureIndex = total > 0 ? (totalBuyNotional / total) * 100 : 50

  // Generate time series (last 12 5-second windows)
  const timeSeries = generateTimeSeries(recentTrades)

  return {
    totalBuyNotional,
    totalSellNotional,
    buyPressureIndex,
    buckets: Object.values(buckets),
    timeSeries,
  }
}

export function generateTimeSeries(trades: HLTrade[]): TimeSeriesData[] {
  const timeSeries: TimeSeriesData[] = []
  const now = Date.now()

  for (let i = 11; i >= 0; i--) {
    const windowStart = now - (i + 1) * 5000
    const windowEnd = now - i * 5000

    const windowTrades = trades.filter((trade) => trade.ts >= windowStart && trade.ts < windowEnd)

    let buyNotional = 0
    let sellNotional = 0

    windowTrades.forEach((trade) => {
      const notional = trade.px * trade.sz
      if (trade.side === "B") {
        buyNotional += notional
      } else {
        sellNotional += notional
      }
    })

    timeSeries.push({
      timestamp: windowEnd,
      buyNotional,
      sellNotional,
    })
  }

  return timeSeries
}
