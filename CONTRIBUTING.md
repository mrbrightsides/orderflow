# Contributing to OrderFlow Buddy

Thanks for your interest in contributing. This document covers how to get started, what we're looking for, and how to submit changes.

---

## Getting started

1. Fork the repository: [github.com/mrbrightsides/orderflow](https://github.com/mrbrightsides/orderflow)
2. Clone your fork locally
3. Follow the [SETUP.md](./SETUP.md) guide to get the project running
4. Create a branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## What we're looking for

### Signal models
New signal detectors are the highest-value contribution. Each signal should:
- Use a distinct market dimension (price, volume, orderbook, time-series, etc.)
- Return a computable edge estimate, not a qualitative label
- Include a confidence score between 0 and 1
- Be implementable in `artifacts/api-server/src/lib/signals.ts`

### Backtesting
Improvements to the simulation engine:
- Walk-forward optimization
- Monte Carlo stress testing
- New strategy models

### Data sources
The app currently uses the Polymarket Gamma and CLOB APIs. Contributions that add additional data sources (e.g. resolution criteria text, news sentiment, related market correlation) are welcome.

### Frontend
UI improvements, new chart types, mobile responsiveness, or accessibility improvements.

---

## Code standards

- **TypeScript** throughout — no `any` types without justification
- **No mock data** in signal or backtest logic — all output must be computed
- Follow the existing file structure (see [SETUP.md](./SETUP.md))
- API changes must be reflected in `lib/api-spec/openapi.yaml` first (contract-first)
- Keep components focused — extract shared logic into `lib/` utilities

---

## Submitting a pull request

1. Make sure the project builds cleanly:
   ```bash
   pnpm --filter @workspace/orderflow run build
   pnpm --filter @workspace/api-server run build
   ```
2. Test your changes locally with both dev servers running
3. Push your branch and open a pull request against `main`
4. Describe what the change does, why it's needed, and how you tested it

---

## Reporting bugs

Open a GitHub issue at [github.com/mrbrightsides/orderflow/issues](https://github.com/mrbrightsides/orderflow/issues) with:
- What you expected to happen
- What actually happened
- Steps to reproduce

---

## Contact

For questions before opening a PR or issue:

- Email: [support@elpeef.com](mailto:support@elpeef.com)
- Telegram: [@khudriakhmad](https://t.me/khudriakhmad)
- Discord: [@khudri_61362](https://discord.com/channels/@khudri_61362)
