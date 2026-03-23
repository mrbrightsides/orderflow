# OrderFlow Buddy

**Prediction market trading intelligence system for Polymarket.**

Live app: [orderflowbuddy.up.railway.app](https://orderflowbuddy.up.railway.app)  
GitHub: [github.com/mrbrightsides/orderflow](https://github.com/mrbrightsides/orderflow)

---

## What it does

OrderFlow Buddy scans Polymarket prediction markets in real time, detects trading signals, sizes positions using the Kelly Criterion, and provides a full backtesting engine for strategy validation.

### Modules

| Module | Description |
|---|---|
| **Markets Dashboard** | Live feed of active markets with probability bars, volume, liquidity, and orderbook depth |
| **Signal Scanner** | 4 independent signal detectors (Probability Drift, Volume Spike, Mispricing, Momentum) with Kelly-sized recommendations |
| **Strategy & Risk Engine** | Configurable risk management — min edge, max Kelly fraction, confidence threshold — with live trade log and equity curve |
| **Backtester** | 90-day historical simulation across 3 strategies: Kelly Criterion, Fixed Fractional, Probability Drift |

### Performance metrics

- Win Rate · Total P&L · Avg Edge
- Sharpe Ratio · Max Drawdown · Annualized Return
- Per-trade equity curve

---

## Strategy Logic
The system runs four independent signal detectors on each market simultaneously:

1. Probability Drift
Estimates a fair value for each outcome using statistical noise modeling. When the market price deviates more than 4% from estimated fair value, it flags a directional trade. Edge = |fair value − current price|.

2. Volume Spike
Monitors the ratio of 24-hour volume to total volume. When recent volume exceeds 12% of all-time volume, it signals that informed money is moving — and takes the same direction. Logic: unusual short-term activity implies price discovery in progress.

3. Mispricing
Checks that all outcome probabilities sum to 100%. When they don't (e.g., Yes=55%, No=50% = 105%), the market is offering positive-EV on the cheapest outcome. Captures liquidity provider errors and stale quotes.

4. Momentum
Identifies markets where the leading outcome is priced between 60–92% with high volume and strong liquidity — a regime where probability tends to continue moving toward resolution. Avoids both coin-flip markets and near-certain outcomes.

### Bet Sizing — Kelly Criterion
All signals compute a Kelly fraction: f* = (p·b − q) / b where p = win probability, q = 1−p, b = net odds. Bet size is capped at maxKellyFraction × bankroll to avoid overbetting on noisy edge estimates. Confidence score further scales the fraction down.

## Architecture

```text
GitHub Repo (monorepo / pnpm workspaces)
│
├── artifacts/api-server/        ← Express 5 backend
│   └── src/lib/
│       ├── polymarket.ts        ← Polymarket API client + fallback
│       ├── signals.ts           ← Signal detectors + Kelly sizing
│       ├── strategy.ts          ← Portfolio & trade management
│       └── backtest.ts          ← Simulation engine
│
├── artifacts/orderflow/         ← React + Vite frontend
│   └── src/pages/
│       ├── markets.tsx          ← Live market feed
│       ├── signals.tsx          ← Signal execution UI
│       ├── strategy.tsx         ← Risk config dashboard
│       └── backtester.tsx       ← Simulation UI
│
└── lib/api-spec/openapi.yaml    ← Contract-first API spec
```

## Data Sources

- Live market data: Polymarket Gamma API (gamma-api.polymarket.com/markets) — fetches active markets ordered by 24h volume, cached for 60 seconds
- Orderbook data: Polymarket CLOB API (clob.polymarket.com/book) — real-time bid/ask depth per outcome token
- Fallback: If the live API is unreachable (rate limits, network), the system generates structurally realistic market data using the same schemas — the signal engine and backtester continue running without interruption

## Performance Metrics
The system tracks and displays:

| Metric              | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| Total P&L          | Sum of closed trade profits/losses in USD                                   |
| Win Rate           | % of closed trades that were profitable                                     |
| Sharpe Ratio       | Risk-adjusted return: (avg return / std dev) × √252                         |
| Max Drawdown       | Largest peak-to-trough equity decline (%)                                   |
| Avg Edge           | Mean expected edge across all executed signals                              |
| Equity Curve       | Daily portfolio value plotted over time                                     |
| Backtest Return    | Total % return over simulation period                                       |
| Annualized Return  | Return normalized to a 365-day window                                       |

The backtester runs three strategies (Kelly Criterion, Fixed Fractional at 5%, Probability Drift) against 90 days of historical scenario data, producing all metrics above for comparison.

---

## Tech stack

- **Frontend**: React + Vite, Wouter, TanStack Query, Recharts, Framer Motion, Tailwind CSS, shadcn/ui
- **Backend**: Express 5, TypeScript, Pino logging
- **Data**: Polymarket Gamma API (markets), Polymarket CLOB API (orderbook)
- **Monorepo**: pnpm workspaces
- **Deployment**: Railway (Nixpacks, Node 20)

---

## Getting started

See [SETUP.md](./SETUP.md) for local development instructions.

See [API.md](./API.md) for the full API reference.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Contact

- Email: [support@elpeef.com](mailto:support@elpeef.com)
- Telegram: [@khudriakhmad](https://t.me/khudriakhmad)
- Discord: [@khudri_61362](https://discord.com/channels/@khudri_61362)

---

Built for the **Orderflow 001 Hackathon** — 48-hour build sprint.
