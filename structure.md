# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── orderflow/          # Polymarket Intelligence React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application: Orderflow - Polymarket Intelligence

A real-time Polymarket trading intelligence system built for the Orderflow 001 48-hour hackathon.

### Features
1. **Markets Dashboard** - Live Polymarket markets with outcome probability bars and orderbook visualization
2. **Signal Scanner** - 4 signal types: probability_drift, volume_spike, mispricing, momentum. Kelly Criterion bet sizing
3. **Strategy & Trades** - Risk configuration (bankroll, Kelly fraction, min edge, confidence), trade log, live P&L
4. **Backtester** - Historical simulation engine with 3 strategies (Kelly Criterion, Fixed Fractional, Probability Drift), equity curve chart, Sharpe ratio, max drawdown

### Backend Modules (artifacts/api-server/src/lib/)
- `polymarket.ts` - Polymarket API integration with mock fallback
- `signals.ts` - Signal detection engine (4 signal types + Kelly sizing)
- `strategy.ts` - Trade management, portfolio performance metrics
- `backtest.ts` - Backtesting engine with historical simulation

### API Routes
- `GET /api/markets` - Polymarket markets with optional category/limit filters
- `GET /api/markets/:id` - Single market detail
- `GET /api/markets/:id/orderbook` - Bid/ask orderbook
- `GET /api/signals` - Current signals
- `POST /api/signals/scan` - Trigger fresh signal scan
- `GET/PUT /api/strategy/config` - Strategy configuration
- `GET /api/strategy/trades` - Trade log
- `GET /api/strategy/performance` - Portfolio metrics
- `POST /api/backtest/run` - Run backtest simulation
- `GET /api/backtest/results` - Saved backtest history

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas from OpenAPI spec
