# Setup Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) v10 or higher

Install pnpm if you don't have it:
```bash
npm install -g pnpm@10
```

---

## Clone the repository

```bash
git clone https://github.com/mrbrightsides/orderflow.git
cd orderflow
```

---

## Install dependencies

```bash
pnpm install
```

---

## Run locally

The project has two development servers that need to run simultaneously — the API backend and the React frontend.

**Terminal 1 — API server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/orderflow run dev
```

The frontend will be available at `http://localhost:<PORT>` (the port is printed in the terminal output).

The API will be available at `http://localhost:<API_PORT>/api`.

---

## Environment variables

No environment variables are required for local development. The app connects to the Polymarket public APIs directly and falls back to realistic simulation data if the API is unreachable.

For production, Railway sets `PORT` and `NODE_ENV=production` automatically.

---

## Build for production

```bash
# Build frontend
pnpm --filter @workspace/orderflow run build

# Build API server
pnpm --filter @workspace/api-server run build

# Start production server (serves both API and frontend)
NODE_ENV=production node artifacts/api-server/dist/index.mjs
```

In production, the Express server serves the built React frontend as static files from `artifacts/orderflow/dist/public` and handles all API routes under `/api/...`.

---

## Deploy to Railway

1. Fork or clone the repo and push to your GitHub account
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repository
4. Railway auto-detects `railway.toml` — no manual configuration needed
5. Only deploy the `@workspace/api-server` service; delete any other services Railway generates from the monorepo

The `railway.toml` at the project root defines the full build and start pipeline.

---

## Project structure

```
orderflow/
├── artifacts/
│   ├── api-server/          # Express 5 backend
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── polymarket.ts   # Polymarket API client
│   │       │   ├── signals.ts      # Signal detectors + Kelly sizing
│   │       │   ├── strategy.ts     # Trade management + metrics
│   │       │   └── backtest.ts     # Simulation engine
│   │       └── routes/             # API route handlers
│   └── orderflow/           # React + Vite frontend
│       └── src/
│           └── pages/
│               ├── landing.tsx     # Landing page
│               ├── markets.tsx     # Live markets dashboard
│               ├── signals.tsx     # Signal scanner
│               ├── strategy.tsx    # Strategy & risk config
│               └── backtester.tsx  # Backtest runner
├── lib/
│   └── api-spec/
│       └── openapi.yaml     # OpenAPI 3.1 spec (source of truth)
├── nixpacks.toml            # Railway Nixpacks Node version config
├── railway.toml             # Railway build + deploy config
└── pnpm-workspace.yaml      # pnpm monorepo config
```

---

## Contact

- Email: [support@elpeef.com](mailto:support@elpeef.com)
- Telegram: [@khudriakhmad](https://t.me/khudriakhmad)
- Discord: [@khudri_61362](https://discord.com/channels/@khudri_61362)
