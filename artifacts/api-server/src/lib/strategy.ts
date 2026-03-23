import { Signal } from "./signals";

export type TradeStatus = "open" | "closed" | "cancelled";

export interface Trade {
  id: string;
  marketId: string;
  marketQuestion: string;
  outcomeName: string;
  direction: "buy" | "sell";
  entryPrice: number;
  exitPrice?: number;
  size: number;
  pnl?: number;
  pnlPercent?: number;
  status: TradeStatus;
  signalType: string;
  openedAt: string;
  closedAt?: string;
}

export interface StrategyConfig {
  bankroll: number;
  maxKellyFraction: number;
  minEdge: number;
  minConfidence: number;
  maxPositionSize: number;
  enabledSignalTypes: string[];
  autoTrade: boolean;
}

export interface PerformanceMetrics {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  openTrades: number;
  avgEdge: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bankroll: number;
  startingBankroll: number;
  equityCurve: Array<{ date: string; equity: number; drawdown: number }>;
}

let strategyConfig: StrategyConfig = {
  bankroll: 10000,
  maxKellyFraction: 0.25,
  minEdge: 5,
  minConfidence: 0.55,
  maxPositionSize: 500,
  enabledSignalTypes: ["probability_drift", "volume_spike", "mispricing", "momentum"],
  autoTrade: false,
};

const trades: Trade[] = generateInitialTrades();

function generateInitialTrades(): Trade[] {
  const markets = [
    { id: "m1", q: "Will Bitcoin exceed $150,000 by end of 2025?", outcome: "Yes", signal: "probability_drift" },
    { id: "m2", q: "Will the Fed cut rates in March 2026?", outcome: "Yes", signal: "momentum" },
    { id: "m3", q: "Will S&P 500 hit 6000 by June 2026?", outcome: "Yes", signal: "volume_spike" },
    { id: "m4", q: "Will OpenAI release GPT-5 before mid-2026?", outcome: "Yes", signal: "momentum" },
    { id: "m5", q: "Will there be a US recession declared by end of 2026?", outcome: "No", signal: "mispricing" },
    { id: "m6", q: "Will ETH ETF net inflows exceed $1B in Q2 2026?", outcome: "Yes", signal: "probability_drift" },
    { id: "m7", q: "Will gold exceed $3500/oz in 2026?", outcome: "Yes", signal: "volume_spike" },
    { id: "m8", q: "Will Trump approval exceed 50%?", outcome: "No", signal: "mispricing" },
  ];

  const now = Date.now();
  return markets.map((m, i) => {
    const entryPrice = 0.35 + Math.random() * 0.4;
    const isClosed = i < 5;
    const isWin = Math.random() > 0.35;
    const size = 50 + Math.floor(Math.random() * 200);
    const openedAt = new Date(now - (20 - i) * 24 * 60 * 60 * 1000).toISOString();

    if (isClosed) {
      const exitPrice = isWin
        ? Math.min(0.98, entryPrice + 0.08 + Math.random() * 0.15)
        : Math.max(0.02, entryPrice - 0.05 - Math.random() * 0.1);
      const pnl = (exitPrice - entryPrice) * size;
      const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
      return {
        id: `trade_${i}`,
        marketId: m.id,
        marketQuestion: m.q,
        outcomeName: m.outcome,
        direction: "buy" as const,
        entryPrice: parseFloat(entryPrice.toFixed(4)),
        exitPrice: parseFloat(exitPrice.toFixed(4)),
        size,
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPercent: parseFloat(pnlPercent.toFixed(2)),
        status: "closed" as const,
        signalType: m.signal,
        openedAt,
        closedAt: new Date(now - (14 - i) * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return {
      id: `trade_${i}`,
      marketId: m.id,
      marketQuestion: m.q,
      outcomeName: m.outcome,
      direction: "buy" as const,
      entryPrice: parseFloat(entryPrice.toFixed(4)),
      size,
      status: "open" as const,
      signalType: m.signal,
      openedAt,
    };
  });
}

export function getStrategyConfig(): StrategyConfig {
  return { ...strategyConfig };
}

export function updateStrategyConfig(update: Partial<StrategyConfig>): StrategyConfig {
  strategyConfig = { ...strategyConfig, ...update };
  return { ...strategyConfig };
}

export function getTrades(): Trade[] {
  return [...trades];
}

export function addTrade(signal: Signal, config: StrategyConfig): Trade {
  const size = Math.min(config.maxPositionSize, signal.suggestedBet);
  const trade: Trade = {
    id: `trade_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    marketId: signal.marketId,
    marketQuestion: signal.marketQuestion,
    outcomeName: signal.outcomeName,
    direction: signal.direction,
    entryPrice: signal.currentPrice,
    size,
    status: "open",
    signalType: signal.signalType,
    openedAt: new Date().toISOString(),
  };
  trades.unshift(trade);
  return trade;
}

function buildEquityCurve(
  startBankroll: number,
  closedTrades: Trade[]
): Array<{ date: string; equity: number; drawdown: number }> {
  const sorted = [...closedTrades].sort(
    (a, b) => new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime()
  );

  const curve: Array<{ date: string; equity: number; drawdown: number }> = [];
  let equity = startBankroll;
  let peak = startBankroll;

  curve.push({
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    equity: startBankroll,
    drawdown: 0,
  });

  for (const t of sorted) {
    equity += t.pnl ?? 0;
    peak = Math.max(peak, equity);
    const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    curve.push({
      date: t.closedAt!.split("T")[0],
      equity: parseFloat(equity.toFixed(2)),
      drawdown: parseFloat(drawdown.toFixed(2)),
    });
  }

  return curve;
}

export function getPerformance(): PerformanceMetrics {
  const startingBankroll = 10000;
  const closed = trades.filter(t => t.status === "closed");
  const open = trades.filter(t => t.status === "open");

  const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const winRate = closed.length > 0 ? wins.length / closed.length : 0;
  const currentBankroll = startingBankroll + totalPnl;
  const totalPnlPercent = (totalPnl / startingBankroll) * 100;

  const returns = closed.map(t => ((t.exitPrice! - t.entryPrice) / t.entryPrice));
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
    : 0;
  const sharpeRatio = variance > 0 ? (avgReturn / Math.sqrt(variance)) * Math.sqrt(252) : 0;

  const avgEdge = closed.length > 0
    ? closed.reduce((sum, t) => sum + Math.abs((t.exitPrice ?? t.entryPrice) - t.entryPrice) / t.entryPrice * 100, 0) / closed.length
    : 0;

  const equityCurve = buildEquityCurve(startingBankroll, closed);
  let maxDrawdown = 0;
  if (equityCurve.length > 0) {
    maxDrawdown = Math.max(...equityCurve.map(p => p.drawdown));
  }

  return {
    totalPnl: parseFloat(totalPnl.toFixed(2)),
    totalPnlPercent: parseFloat(totalPnlPercent.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(4)),
    totalTrades: closed.length,
    openTrades: open.length,
    avgEdge: parseFloat(avgEdge.toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    bankroll: parseFloat(currentBankroll.toFixed(2)),
    startingBankroll,
    equityCurve,
  };
}
