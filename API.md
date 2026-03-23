# API Reference

Base URL (production): `https://orderflowbuddy.up.railway.app/api`  
Base URL (local): `http://localhost:<PORT>/api`

All responses are JSON. All endpoints are read-only except where noted.

---

## Health

### `GET /api/healthz`

Returns server health status.

**Response**
```json
{ "status": "ok" }
```

---

## Markets

### `GET /api/markets`

Returns active Polymarket markets ordered by 24h volume, with per-outcome probabilities.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 20 | Number of markets to return (max 100) |
| `category` | string | — | Filter by category (e.g. `crypto`, `politics`, `sports`) |
| `search` | string | — | Filter by market question text |

**Response**
```json
[
  {
    "id": "string",
    "question": "Will Bitcoin exceed $150,000 by end of 2025?",
    "category": "crypto",
    "status": "active",
    "volume24h": 5180770,
    "liquidity": 777116,
    "outcomes": [
      { "name": "Yes", "probability": 0.44, "price": 0.44 },
      { "name": "No",  "probability": 0.56, "price": 0.56 }
    ]
  }
]
```

### `GET /api/markets/:id`

Returns a single market by ID with full orderbook depth.

**Response**
```json
{
  "id": "string",
  "question": "string",
  "category": "string",
  "status": "active",
  "volume24h": 0,
  "liquidity": 0,
  "outcomes": [],
  "orderbook": {
    "yes": { "bids": [[price, size]], "asks": [[price, size]] },
    "no":  { "bids": [[price, size]], "asks": [[price, size]] }
  }
}
```

---

## Signals

### `GET /api/signals`

Runs all four signal detectors across active markets and returns detected opportunities.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `minEdge` | number | 5 | Minimum edge percentage to include (e.g. `5` = 5%) |
| `minConfidence` | number | 0.6 | Minimum confidence score (0–1) |
| `limit` | number | 20 | Max signals to return |

**Response**
```json
[
  {
    "id": "string",
    "marketId": "string",
    "marketQuestion": "string",
    "signalType": "probability_drift" | "volume_spike" | "mispricing" | "momentum",
    "direction": "BUY" | "SELL",
    "outcome": "Yes" | "No",
    "currentPrice": 0.44,
    "fairValue": 0.52,
    "edge": 0.08,
    "confidence": 0.71,
    "kellyFraction": 0.018,
    "recommendedBet": 18.00,
    "timestamp": "ISO8601"
  }
]
```

**Signal types**

| Type | Logic |
|---|---|
| `probability_drift` | Market price deviates >4% from estimated fair value |
| `volume_spike` | 24h volume exceeds 12% of all-time volume |
| `mispricing` | Outcome probabilities do not sum to 100% |
| `momentum` | Leading outcome priced 60–92% with high volume and liquidity |

---

## Strategy

### `GET /api/strategy/config`

Returns current strategy configuration.

**Response**
```json
{
  "bankroll": 1000,
  "maxKellyFraction": 0.25,
  "minEdge": 5,
  "minConfidence": 0.6,
  "maxPositions": 10
}
```

### `PUT /api/strategy/config`

Updates strategy configuration.

**Request body**
```json
{
  "bankroll": 1000,
  "maxKellyFraction": 0.25,
  "minEdge": 5,
  "minConfidence": 0.6,
  "maxPositions": 10
}
```

### `GET /api/strategy/trades`

Returns the trade log with P&L for each closed position.

**Response**
```json
{
  "trades": [
    {
      "id": "string",
      "marketId": "string",
      "marketQuestion": "string",
      "signalType": "string",
      "direction": "BUY",
      "outcome": "Yes",
      "entryPrice": 0.44,
      "size": 18.00,
      "kellyFraction": 0.018,
      "edge": 0.08,
      "confidence": 0.71,
      "status": "open" | "won" | "lost",
      "pnl": 0,
      "timestamp": "ISO8601"
    }
  ],
  "metrics": {
    "totalPnl": 0,
    "winRate": 0,
    "sharpeRatio": 0,
    "maxDrawdown": 0,
    "avgEdge": 0,
    "totalTrades": 0,
    "openPositions": 0
  },
  "equityCurve": [
    { "date": "YYYY-MM-DD", "value": 1000 }
  ]
}
```

### `POST /api/strategy/execute`

Executes a signal — adds it to the trade log.

**Request body**
```json
{
  "signalId": "string"
}
```

---

## Backtest

### `POST /api/backtest/run`

Runs a backtest simulation over a specified period.

**Request body**
```json
{
  "strategy": "kelly" | "fixed_fractional" | "probability_drift",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "initialBankroll": 1000,
  "parameters": {
    "kellyFraction": 0.25,
    "fixedFraction": 0.05,
    "minEdge": 0.05
  }
}
```

**Response**
```json
{
  "id": "string",
  "strategy": "kelly",
  "totalReturn": 0.42,
  "annualizedReturn": 0.18,
  "sharpeRatio": 3.73,
  "maxDrawdown": 0.062,
  "winRate": 0.80,
  "totalTrades": 48,
  "finalBankroll": 1420,
  "equityCurve": [
    { "date": "YYYY-MM-DD", "value": 1000 }
  ],
  "trades": []
}
```

### `GET /api/backtest/results`

Returns all previously run backtest results.
