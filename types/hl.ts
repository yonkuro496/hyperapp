export interface HLTrade {
  coin: string // "BTC" etc
  px: number // price
  sz: number // size/quantity
  side: "B" | "S" // 'B' = buy, 'S' = sell
  ts: number // timestamp in ms
}

export interface HLWebSocketMessage {
  channel: string
  data: any
}
