export const BUCKET_THRESHOLDS = {
  SMALL: 10000, // < $10,000
  MEDIUM: 100000, // $10,000 - $100,000
  LARGE: 1000000, // $100,000 - $1,000,000
  // SUPER: >= $1,000,000
} as const

export const BUCKET_NAMES = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  SUPER: "Super",
} as const

export const WS_CONFIG = {
  URL: "wss://api.hyperliquid.xyz/ws",
  SUBSCRIPTION: {
    method: "subscribe",
    subscription: {
      type: "trades",
    },
  },
  RECONNECT: {
    INITIAL_DELAY: 500,
    MAX_DELAY: 8000,
    MULTIPLIER: 2,
  },
} as const

export const AVAILABLE_COINS = ["BTC", "ETH", "SOL", "HYPE"] as const;
