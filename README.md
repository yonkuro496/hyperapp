# TraderScope Hyperliquid v0

Real-time cryptocurrency trading analytics dashboard for Hyperliquid exchange data.

## Features

- **Real-time WebSocket Integration**: Live BTC trade data from Hyperliquid
- **Multi-Chart Visualization**: Donut charts, bar charts, and time series
- **Trade Size Analysis**: Categorizes trades into Small/Medium/Large/Super buckets
- **Buy Pressure Index**: Real-time sentiment indicator
- **Auto-Reconnection**: Robust WebSocket handling with exponential backoff
- **Featured Traders**: Mock high-volume trader activity display

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
\`\`\`

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard.

## Architecture

### Data Flow
1. WebSocket connects to `wss://api.hyperliquid.xyz/ws`
2. Subscribes to BTC trade data
3. Aggregates trades in 1-minute rolling windows
4. Categorizes by notional value into size buckets
5. Updates charts in real-time

### Trade Size Buckets
- **Small**: < $10,000
- **Medium**: $10,000 - $100,000  
- **Large**: $100,000 - $1,000,000
- **Super**: >= $1,000,000

### Key Metrics
- **Buy Pressure Index (BPI)**: `buyNotional / (buyNotional + sellNotional) * 100`
- **Time Series**: 5-second sub-windows within 1-minute rolling window
- **Volume Distribution**: Real-time buy/sell ratio by trade size

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Testing**: Vitest
- **WebSocket**: Native browser WebSocket API

## Configuration

### WebSocket Settings
Edit `config/buckets.ts` to modify:
- Reconnection delays and limits
- Bucket thresholds
- Subscription parameters

### Environment
No environment variables required for MVP. All data comes from public WebSocket feeds.

## Deployment

### Vercel (Recommended)
\`\`\`bash
# Connect to Vercel
npx vercel

# Deploy
npx vercel --prod
\`\`\`

### Other Platforms
Standard Next.js deployment. Ensure WebSocket connections are supported.

## Known Limitations (MVP)

- **Client-side only**: No server-side data persistence
- **BTC only**: Single asset support (extensible)
- **1-minute window**: Limited historical data retention
- **Mock traders**: Featured traders table uses dummy data
- **No authentication**: Public dashboard only

## Development

### File Structure
\`\`\`
app/                 # Next.js app router pages
components/          # Reusable UI components
  charts/           # Chart components (Pie, Bar, Stacked)
config/             # Configuration constants
data/               # Static data files
lib/                # Core business logic
  agg.ts           # Trade aggregation functions
  ws.ts            # WebSocket client
types/              # TypeScript definitions
tests/              # Unit tests
\`\`\`

### Testing
\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test tests/agg.test.ts
\`\`\`

### Extending

**Add New Assets**:
1. Update `WS_CONFIG.SUBSCRIPTION.coin` in `config/buckets.ts`
2. Add asset selector UI component
3. Modify aggregation logic for multi-asset support

**Add Persistence**:
1. Integrate database (SQLite/Neon recommended)
2. Create API routes for historical data
3. Update aggregation to use server-side data

**Add Authentication**:
1. Implement user accounts
2. Add personalized watchlists
3. Create private dashboard features

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review WebSocket connection in browser dev tools
3. Verify Hyperliquid API status
4. Test with `npm run test` to ensure core logic works

## License

MIT License - see LICENSE file for details.
