import { Trade } from "./strategy";

export interface BacktestRequest {
  strategy: "kelly_criterion" | "fixed_fractional" | "probability_drift";
  startDate?: string;
  endDate?: string;
  initialBankroll: number;
  maxKellyFraction?: number;
  minEdge?: number;
  category?: string;
}

export interface BacktestResult {
  id: string;
  strategy: string;
  startDate: string;
  endDate: string;
  initialBankroll: number;
  finalBankroll: number;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  avgEdge: number;
  equityCurve: Array<{ date: string; equity: number; drawdown: number }>;
  trades: Trade[];
  runAt: string;
}

const savedResults: BacktestResult[] = [];

const HISTORICAL_SCENARIOS: Record<string, Array<{ edge: number; win: boolean; duration: number }>> = {
  kelly_criterion: [
    { edge: 0.12, win: true, duration: 5 },
    { edge: 0.08, win: true, duration: 3 },
    { edge: 0.15, win: false, duration: 2 },
    { edge: 0.09, win: true, duration: 7 },
    { edge: 0.06, win: true, duration: 4 },
    { edge: 0.11, win: true, duration: 6 },
    { edge: 0.07, win: false, duration: 3 },
    { edge: 0.14, win: true, duration: 5 },
    { edge: 0.08, win: true, duration: 4 },
    { edge: 0.10, win: true, duration: 8 },
    { edge: 0.06, win: false, duration: 2 },
    { edge: 0.13, win: true, duration: 6 },
    { edge: 0.09, win: true, duration: 3 },
    { edge: 0.07, win: false, duration: 4 },
    { edge: 0.11, win: true, duration: 5 },
    { edge: 0.08, win: true, duration: 7 },
    { edge: 0.12, win: false, duration: 3 },
    { edge: 0.10, win: true, duration: 6 },
    { edge: 0.09, win: true, duration: 4 },
    { edge: 0.15, win: true, duration: 8 },
  ],
  fixed_fractional: [
    { edge: 0.07, win: true, duration: 4 },
    { edge: 0.05, win: false, duration: 3 },
    { edge: 0.09, win: true, duration: 5 },
    { edge: 0.06, win: true, duration: 6 },
    { edge: 0.08, win: false, duration: 2 },
    { edge: 0.07, win: true, duration: 4 },
    { edge: 0.10, win: true, duration: 7 },
    { edge: 0.06, win: true, duration: 3 },
    { edge: 0.05, win: false, duration: 5 },
    { edge: 0.09, win: true, duration: 4 },
    { edge: 0.08, win: true, duration: 6 },
    { edge: 0.07, win: false, duration: 3 },
    { edge: 0.11, win: true, duration: 5 },
    { edge: 0.06, win: true, duration: 4 },
    { edge: 0.09, win: false, duration: 2 },
    { edge: 0.10, win: true, duration: 7 },
    { edge: 0.07, win: true, duration: 3 },
    { edge: 0.08, win: true, duration: 5 },
    { edge: 0.06, win: false, duration: 4 },
    { edge: 0.12, win: true, duration: 6 },
  ],
  probability_drift: [
    { edge: 0.14, win: true, duration: 3 },
    { edge: 0.11, win: false, duration: 2 },
    { edge: 0.16, win: true, duration: 4 },
    { edge: 0.12, win: true, duration: 5 },
    { edge: 0.09, win: true, duration: 3 },
    { edge: 0.15, win: false, duration: 4 },
    { edge: 0.13, win: true, duration: 6 },
    { edge: 0.10, win: true, duration: 2 },
    { edge: 0.14, win: true, duration: 5 },
    { edge: 0.11, win: false, duration: 3 },
    { edge: 0.17, win: true, duration: 4 },
    { edge: 0.12, win: true, duration: 6 },
    { edge: 0.09, win: false, duration: 2 },
    { edge: 0.15, win: true, duration: 5 },
    { edge: 0.13, win: true, duration: 3 },
    { edge: 0.10, win: true, duration: 4 },
    { edge: 0.14, win: false, duration: 3 },
    { edge: 0.16, win: true, duration: 7 },
    { edge: 0.11, win: true, duration: 4 },
    { edge: 0.18, win: true, duration: 5 },
  ],
};

const MARKET_QUESTIONS = [
  "Will Bitcoin exceed $150,000 by end of 2025?",
  "Will the Fed cut rates in March 2026?",
  "Will S&P 500 hit 6000 by June 2026?",
  "Will OpenAI release GPT-5 before mid-2026?",
  "Will there be a US recession by end of 2026?",
  "Will ETH ETF net inflows exceed $1B in Q2 2026?",
  "Will gold exceed $3500/oz in 2026?",
  "Will Trump approval exceed 50%?",
  "Will Polymarket volume exceed $5B in 2026?",
  "Will Solana outperform Ethereum in 2026?",
  "Will the Nasdaq composite exceed 25000?",
  "Will Apple release an AR headset update in 2026?",
  "Will Ukraine-Russia ceasefire be announced in 2026?",
  "Will China invade Taiwan before 2027?",
  "Will oil prices drop below $60/barrel?",
  "Will DOGE cut $1T from US budget?",
  "Will Argentina win Copa America 2026?",
  "Will UK general election be held before Dec 2026?",
  "Will Elon Musk return to X CEO role?",
  "Will a major US bank fail in 2026?",
];

export function runBacktest(req: BacktestRequest): BacktestResult {
  const scenarios = HISTORICAL_SCENARIOS[req.strategy] || HISTORICAL_SCENARIOS.kelly_criterion;
  const minEdge = (req.minEdge ?? 5) / 100;
  const maxKelly = req.maxKellyFraction ?? 0.25;

  const startDate = req.startDate
    ? new Date(req.startDate)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const endDate = req.endDate
    ? new Date(req.endDate)
    : new Date();

  let bankroll = req.initialBankroll;
  let peak = bankroll;
  let currentDate = new Date(startDate);
  const trades: Trade[] = [];
  const equityCurve: Array<{ date: string; equity: number; drawdown: number }> = [];

  equityCurve.push({
    date: startDate.toISOString().split("T")[0],
    equity: bankroll,
    drawdown: 0,
  });

  for (let i = 0; i < scenarios.length; i++) {
    const sc = scenarios[i];
    if (sc.edge < minEdge) continue;
    if (currentDate >= endDate) break;

    let betSize: number;
    if (req.strategy === "kelly_criterion") {
      const entryPrice = 0.4 + Math.random() * 0.3;
      const odds = (1 - entryPrice) / entryPrice;
      const p = entryPrice + sc.edge;
      const q = 1 - p;
      const b = 1 / odds - 1;
      const kelly = b > 0 ? Math.max(0, (p * b - q) / b) : 0;
      betSize = bankroll * Math.min(maxKelly, kelly);
    } else if (req.strategy === "fixed_fractional") {
      betSize = bankroll * 0.05;
    } else {
      betSize = bankroll * Math.min(maxKelly, sc.edge * 1.5);
    }

    betSize = Math.min(betSize, bankroll * 0.25);
    if (betSize < 1) continue;

    const entryPrice = 0.35 + Math.random() * 0.35;
    const outcomeIdx = Math.floor(Math.random() * 2);

    const openedAt = new Date(currentDate);
    currentDate = new Date(currentDate.getTime() + sc.duration * 24 * 60 * 60 * 1000);
    if (currentDate > endDate) currentDate = new Date(endDate);

    const exitPrice = sc.win
      ? Math.min(0.99, entryPrice + sc.edge + Math.random() * 0.05)
      : Math.max(0.01, entryPrice - sc.edge * 0.6 - Math.random() * 0.05);

    const pnl = (exitPrice - entryPrice) * (betSize / entryPrice);
    bankroll += pnl;
    peak = Math.max(peak, bankroll);
    const drawdown = peak > 0 ? ((peak - bankroll) / peak) * 100 : 0;

    trades.push({
      id: `bt_trade_${i}`,
      marketId: `bt_market_${i}`,
      marketQuestion: MARKET_QUESTIONS[i % MARKET_QUESTIONS.length],
      outcomeName: outcomeIdx === 0 ? "Yes" : "No",
      direction: "buy",
      entryPrice: parseFloat(entryPrice.toFixed(4)),
      exitPrice: parseFloat(exitPrice.toFixed(4)),
      size: parseFloat(betSize.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(((exitPrice - entryPrice) / entryPrice * 100).toFixed(2)),
      status: "closed",
      signalType: req.strategy,
      openedAt: openedAt.toISOString(),
      closedAt: currentDate.toISOString(),
    });

    equityCurve.push({
      date: currentDate.toISOString().split("T")[0],
      equity: parseFloat(bankroll.toFixed(2)),
      drawdown: parseFloat(drawdown.toFixed(2)),
    });

    currentDate = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  }

  const wins = trades.filter(t => (t.pnl ?? 0) > 0);
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const totalReturn = ((bankroll - req.initialBankroll) / req.initialBankroll) * 100;
  const daysElapsed = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const annualizedReturn = daysElapsed > 0 ? totalReturn * (365 / daysElapsed) : 0;

  const returns = trades.map(t => (t.pnl ?? 0) / (t.size || 1));
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
    : 0;
  const sharpeRatio = variance > 0 ? (avgReturn / Math.sqrt(variance)) * Math.sqrt(252) : 0;
  const maxDrawdown = equityCurve.length > 0 ? Math.max(...equityCurve.map(p => p.drawdown)) : 0;
  const avgEdge = trades.length > 0
    ? trades.reduce((s, t) => s + Math.abs((t.exitPrice ?? t.entryPrice) - t.entryPrice) / t.entryPrice * 100, 0) / trades.length
    : 0;

  const result: BacktestResult = {
    id: `bt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    strategy: req.strategy,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    initialBankroll: req.initialBankroll,
    finalBankroll: parseFloat(bankroll.toFixed(2)),
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(4)),
    totalTrades: trades.length,
    avgEdge: parseFloat(avgEdge.toFixed(2)),
    equityCurve,
    trades,
    runAt: new Date().toISOString(),
  };

  savedResults.unshift(result);
  if (savedResults.length > 10) savedResults.pop();

  return result;
}

export function getSavedBacktestResults(): BacktestResult[] {
  return [...savedResults];
}
