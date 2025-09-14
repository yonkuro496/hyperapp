import type { HLTrade } from "@/types/hl"
import { WS_CONFIG, AVAILABLE_COINS } from "@/config/buckets"

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isManualClose = false

  public onTrade: ((trade: HLTrade) => void) | null = null
  public onStatusChange: ((status: string) => void) | null = null

  constructor(url: string) {
    this.url = url
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.isManualClose = false
    this.onStatusChange?.("RECONNECTING")

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
        this.onStatusChange?.("CONNECTED")

        this.subscribeToCoins(AVAILABLE_COINS)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle trade data
          if (data.channel === "trades" && data.data) {
            const trades = Array.isArray(data.data) ? data.data : [data.data]
            trades.forEach((tradeData: any) => {
              const trade: HLTrade = {
                coin: tradeData.coin,
                px: Number.parseFloat(tradeData.px),
                sz: Number.parseFloat(tradeData.sz),
                side: tradeData.side,
                ts: Number.parseInt(tradeData.time) || Date.now(),
              }
              console.log("Received trade for coin:", trade.coin);
              this.onTrade?.(trade)
            })
          }
        } catch (error) {
          console.error("[v0] Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log("[v0] WebSocket closed:", event.code, event.reason)
        this.ws = null

        if (!this.isManualClose) {
          this.onStatusChange?.("RECONNECTING")
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
        this.onStatusChange?.("ERROR")
      }
    } catch (error) {
      console.error("[v0] Failed to create WebSocket:", error)
      this.onStatusChange?.("ERROR")
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.isManualClose) return

    const delay = Math.min(
      WS_CONFIG.RECONNECT.INITIAL_DELAY * Math.pow(WS_CONFIG.RECONNECT.MULTIPLIER, this.reconnectAttempts),
      WS_CONFIG.RECONNECT.MAX_DELAY,
    )

    // Increase delay if tab is hidden
    const actualDelay = document.hidden ? delay * 3 : delay

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, actualDelay)
  }

  close() {
    this.isManualClose = true

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.onStatusChange?.("DISCONNECTED")
  }

  subscribeToCoins(coins: string[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      coins.forEach(coin => {
        const subscribeMessage = {
          method: "subscribe",
          subscription: {
            type: "trades",
            coin: coin,
          },
        }
        console.log("Sending subscription message:", JSON.stringify(subscribeMessage));
        this.ws.send(JSON.stringify(subscribeMessage))
      })
    }
  }
}
