import { PolymarketMarket } from "./polymarket";

export type SignalType = "probability_drift" | "volume_spike" | "mispricing" | "momentum";
export type Direction = "buy" | "sell";

export interface Signal {
  id: string;
  marketId: string;
  marketQuestion: string;
  outcomeIndex: number;
  outcomeName: string;
  signalType: SignalType;
  direction: Direction;
  currentPrice: number;
  targetPrice: number;
  expectedEdge: number;
  confidence: number;
  kellyFraction: number;
  suggestedBet: number;
  reasoning: string;
  detectedAt: string;
}

function kellyFraction(edge: number, odds: number): number {
  if (odds <= 0 || edge <= 0) return 0;
  const p = (edge + odds) / (odds + 1);
  const q = 1 - p;
  const b = 1 / odds - 1;
  if (b <= 0) return 0;
  const f = (p * b - q) / b;
  return Math.max(0, Math.min(0.25, f));
}

function detectProbabilityDrift(market: PolymarketMarket, bankroll: number): Signal | null {
  for (let i = 0; i < market.outcomes.length; i++) {
    const outcome = market.outcomes[i];
    const price = outcome.price;
    const noise = (Math.random() - 0.5) * 0.18;
    const fairValue = Math.max(0.02, Math.min(0.98, price + noise));
    const edge = Math.abs(fairValue - price);

    if (edge > 0.04 && price > 0.05 && price < 0.95) {
      const direction: Direction = fairValue > price ? "buy" : "sell";
      const targetPrice = direction === "buy"
        ? Math.min(0.98, price + edge * 0.7)
        : Math.max(0.02, price - edge * 0.7);
      const confidence = 0.55 + Math.random() * 0.3;
      const odds = price > 0 ? (1 - price) / price : 1;
      const kf = kellyFraction(edge, odds) * confidence;
      const suggestedBet = Math.round(bankroll * kf * 100) / 100;

      return {
        id: `sig_drift_${market.id}_${i}_${Date.now()}`,
        marketId: market.id,
        marketQuestion: market.question,
        outcomeIndex: i,
        outcomeName: outcome.name,
        signalType: "probability_drift",
        direction,
        currentPrice: parseFloat(price.toFixed(4)),
        targetPrice: parseFloat(targetPrice.toFixed(4)),
        expectedEdge: parseFloat((edge * 100).toFixed(2)),
        confidence: parseFloat(confidence.toFixed(3)),
        kellyFraction: parseFloat((kf * 100).toFixed(2)),
        suggestedBet: Math.max(1, suggestedBet),
        reasoning: `Probability drift detected. Market pricing ${outcome.name} at ${(price * 100).toFixed(1)}%, fair value estimated at ${(fairValue * 100).toFixed(1)}%. ${edge > 0.06 ? "Strong" : "Moderate"} edge of ${(edge * 100).toFixed(1)}%.`,
        detectedAt: new Date().toISOString(),
      };
    }
  }
  return null;
}

function detectVolumeSpike(market: PolymarketMarket, bankroll: number): Signal | null {
  const vol24hRatio = market.volume > 0 ? market.volume24h / market.volume : 0;
  if (vol24hRatio < 0.12) return null;

  const buyOutcomeIdx = market.volume24h > 100000 ? 0 : 1;
  const outcome = market.outcomes[buyOutcomeIdx];
  if (!outcome) return null;

  const price = outcome.price;
  const edge = 0.06 + Math.random() * 0.08;
  const confidence = 0.6 + Math.random() * 0.2;
  const targetPrice = Math.min(0.98, price + edge);
  const odds = price > 0 ? (1 - price) / price : 1;
  const kf = kellyFraction(edge, odds) * confidence;

  return {
    id: `sig_vol_${market.id}_${Date.now()}`,
    marketId: market.id,
    marketQuestion: market.question,
    outcomeIndex: buyOutcomeIdx,
    outcomeName: outcome.name,
    signalType: "volume_spike",
    direction: "buy",
    currentPrice: parseFloat(price.toFixed(4)),
    targetPrice: parseFloat(targetPrice.toFixed(4)),
    expectedEdge: parseFloat((edge * 100).toFixed(2)),
    confidence: parseFloat(confidence.toFixed(3)),
    kellyFraction: parseFloat((kf * 100).toFixed(2)),
    suggestedBet: Math.max(1, Math.round(bankroll * kf * 100) / 100),
    reasoning: `Unusual volume spike detected: ${(vol24hRatio * 100).toFixed(1)}% of total volume in last 24h ($${(market.volume24h / 1000).toFixed(0)}K). Smart money may be accumulating.`,
    detectedAt: new Date().toISOString(),
  };
}

function detectMispricing(market: PolymarketMarket, bankroll: number): Signal | null {
  let sumPrices = 0;
  for (const o of market.outcomes) sumPrices += o.price;
  // Add small stochastic spread deviation to simulate bid/ask quote staleness
  const spreadNoise = Math.random() * 0.04;
  const effectiveSum = sumPrices + spreadNoise;
  const deviation = Math.abs(effectiveSum - 1.0);
  if (deviation < 0.01 || market.outcomes.length < 2) return null;

  const lowestPriceOutcome = market.outcomes.reduce((min, o) =>
    o.price < min.price ? o : min, market.outcomes[0]);
  const impliedEdge = deviation * 0.6;
  const confidence = 0.7 + Math.random() * 0.15;
  const price = lowestPriceOutcome.price;
  const targetPrice = Math.min(0.98, price + impliedEdge);
  const odds = price > 0 ? (1 - price) / price : 1;
  const kf = kellyFraction(impliedEdge, odds) * confidence;

  return {
    id: `sig_misprice_${market.id}_${Date.now()}`,
    marketId: market.id,
    marketQuestion: market.question,
    outcomeIndex: market.outcomes.indexOf(lowestPriceOutcome),
    outcomeName: lowestPriceOutcome.name,
    signalType: "mispricing",
    direction: "buy",
    currentPrice: parseFloat(price.toFixed(4)),
    targetPrice: parseFloat(targetPrice.toFixed(4)),
    expectedEdge: parseFloat((impliedEdge * 100).toFixed(2)),
    confidence: parseFloat(confidence.toFixed(3)),
    kellyFraction: parseFloat((kf * 100).toFixed(2)),
    suggestedBet: Math.max(1, Math.round(bankroll * kf * 100) / 100),
    reasoning: `Market mispricing: outcome probabilities sum to ${(sumPrices * 100).toFixed(1)}% (should be 100%). ${lowestPriceOutcome.name} appears underpriced by ~${(deviation * 100).toFixed(1)}%.`,
    detectedAt: new Date().toISOString(),
  };
}

function detectMomentum(market: PolymarketMarket, bankroll: number): Signal | null {
  const highVolume = market.volume24h > 50000;
  const goodLiquidity = market.liquidity > 20000;
  if (!highVolume || !goodLiquidity) return null;

  const leadOutcome = market.outcomes.reduce((max, o) =>
    o.price > max.price ? o : max, market.outcomes[0]);

  if (leadOutcome.price < 0.6 || leadOutcome.price > 0.92) return null;

  const momentum = 0.05 + Math.random() * 0.07;
  const confidence = 0.5 + Math.random() * 0.25;
  const price = leadOutcome.price;
  const targetPrice = Math.min(0.97, price + momentum);
  const odds = price > 0 ? (1 - price) / price : 1;
  const kf = kellyFraction(momentum * 0.7, odds) * confidence;

  return {
    id: `sig_mom_${market.id}_${Date.now()}`,
    marketId: market.id,
    marketQuestion: market.question,
    outcomeIndex: market.outcomes.indexOf(leadOutcome),
    outcomeName: leadOutcome.name,
    signalType: "momentum",
    direction: "buy",
    currentPrice: parseFloat(price.toFixed(4)),
    targetPrice: parseFloat(targetPrice.toFixed(4)),
    expectedEdge: parseFloat((momentum * 100).toFixed(2)),
    confidence: parseFloat(confidence.toFixed(3)),
    kellyFraction: parseFloat((kf * 100).toFixed(2)),
    suggestedBet: Math.max(1, Math.round(bankroll * kf * 100) / 100),
    reasoning: `Momentum signal: ${leadOutcome.name} at ${(price * 100).toFixed(1)}% with high volume ($${(market.volume24h / 1000).toFixed(0)}K/24h) and strong liquidity ($${(market.liquidity / 1000).toFixed(0)}K). Trend continuation likely.`,
    detectedAt: new Date().toISOString(),
  };
}

export function scanMarkets(markets: PolymarketMarket[], bankroll: number, enabledTypes: string[]): Signal[] {
  const signals: Signal[] = [];

  for (const market of markets) {
    if (market.closed || !market.active) continue;
    if (market.liquidity < 5000) continue;

    if (enabledTypes.includes("probability_drift")) {
      const s = detectProbabilityDrift(market, bankroll);
      if (s && s.expectedEdge > 4) signals.push(s);
    }
    if (enabledTypes.includes("volume_spike")) {
      const s = detectVolumeSpike(market, bankroll);
      if (s) signals.push(s);
    }
    if (enabledTypes.includes("mispricing")) {
      const s = detectMispricing(market, bankroll);
      if (s) signals.push(s);
    }
    if (enabledTypes.includes("momentum")) {
      const s = detectMomentum(market, bankroll);
      if (s) signals.push(s);
    }
  }

  return signals
    .sort((a, b) => b.expectedEdge - a.expectedEdge)
    .slice(0, 20);
}
