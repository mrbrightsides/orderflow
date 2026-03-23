import { logger } from "./logger";

const POLYMARKET_CLOB_API = "https://clob.polymarket.com";
const POLYMARKET_GAMMA_API = "https://gamma-api.polymarket.com";

export interface PolymarketOutcome {
  name: string;
  price: number;
  tokenId: string;
}

export interface PolymarketMarket {
  id: string;
  conditionId: string;
  question: string;
  category: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  volume: number;
  volume24h: number;
  liquidity: number;
  outcomes: PolymarketOutcome[];
  createdAt: string;
}

export interface OrderbookLevel {
  price: number;
  size: number;
}

export interface Orderbook {
  marketId: string;
  tokenId: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  spread: number;
  midpoint: number;
}

function generateMockMarkets(limit = 20): PolymarketMarket[] {
  const categories = ["Politics", "Sports", "Crypto", "Finance", "Entertainment", "Science"];
  const marketTemplates = [
    { q: "Will Bitcoin exceed $150,000 by end of 2025?", cat: "Crypto", yesP: 0.42 },
    { q: "Will the Fed cut rates in March 2026?", cat: "Finance", yesP: 0.67 },
    { q: "Will Trump's approval rating exceed 50%?", cat: "Politics", yesP: 0.38 },
    { q: "Will Ethereum ETF net inflows exceed $1B in Q2 2026?", cat: "Crypto", yesP: 0.55 },
    { q: "Will the S&P 500 hit 6000 by June 2026?", cat: "Finance", yesP: 0.71 },
    { q: "Will there be a US recession declared by end of 2026?", cat: "Finance", yesP: 0.29 },
    { q: "Will Argentina win Copa America 2026?", cat: "Sports", yesP: 0.34 },
    { q: "Will OpenAI release GPT-5 before mid-2026?", cat: "Science", yesP: 0.82 },
    { q: "Will Solana outperform Ethereum in 2026?", cat: "Crypto", yesP: 0.44 },
    { q: "Will the UK general election be held before December 2026?", cat: "Politics", yesP: 0.91 },
    { q: "Will Elon Musk return to Twitter (X) CEO role?", cat: "Entertainment", yesP: 0.12 },
    { q: "Will gold exceed $3500/oz in 2026?", cat: "Finance", yesP: 0.48 },
    { q: "Will the Nasdaq composite exceed 25000?", cat: "Finance", yesP: 0.59 },
    { q: "Will a major US bank fail in 2026?", cat: "Finance", yesP: 0.08 },
    { q: "Will Ukraine-Russia ceasefire be announced in 2026?", cat: "Politics", yesP: 0.31 },
    { q: "Will Apple release an AR headset update in 2026?", cat: "Science", yesP: 0.73 },
    { q: "Will DOGE cut $1T from US budget?", cat: "Politics", yesP: 0.09 },
    { q: "Will oil prices drop below $60/barrel?", cat: "Finance", yesP: 0.22 },
    { q: "Will China invade Taiwan before 2027?", cat: "Politics", yesP: 0.07 },
    { q: "Will Polymarket volume exceed $5B in 2026?", cat: "Crypto", yesP: 0.61 },
  ];

  const now = new Date();
  return marketTemplates.slice(0, limit).map((t, i) => {
    const yesPrice = t.yesP + (Math.random() - 0.5) * 0.05;
    const clampedYes = Math.min(0.98, Math.max(0.02, yesPrice));
    const volume = Math.round(500000 + Math.random() * 5000000);
    const vol24h = Math.round(volume * (0.05 + Math.random() * 0.2));
    const liquidity = Math.round(volume * 0.15);
    const endDate = new Date(now.getTime() + (30 + i * 15) * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date(now.getTime() - (10 + i * 5) * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `market_${i + 1}_${Date.now()}`,
      conditionId: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
      question: t.q,
      category: t.cat,
      endDate,
      active: true,
      closed: false,
      volume,
      volume24h: vol24h,
      liquidity,
      outcomes: [
        { name: "Yes", price: clampedYes, tokenId: `yes_token_${i}` },
        { name: "No", price: 1 - clampedYes, tokenId: `no_token_${i}` },
      ],
      createdAt,
    };
  });
}

let cachedMarkets: PolymarketMarket[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000;

export async function fetchMarkets(category?: string, limit = 20): Promise<PolymarketMarket[]> {
  try {
    const now = Date.now();
    if (!cachedMarkets || now - cacheTime > CACHE_TTL) {
      const url = `${POLYMARKET_GAMMA_API}/markets?active=true&closed=false&limit=50&order=volume24Hour&ascending=false`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);
      const data = await res.json() as any[];
      
      cachedMarkets = data.slice(0, 50).map((m: any, i: number) => {
        const outcomes: PolymarketOutcome[] = [];
        if (m.tokens) {
          for (const t of m.tokens) {
            outcomes.push({
              name: t.outcome || "Unknown",
              price: parseFloat(t.price || "0.5"),
              tokenId: t.token_id || `token_${i}`,
            });
          }
        }
        if (outcomes.length === 0) {
          outcomes.push(
            { name: "Yes", price: 0.5, tokenId: `yes_${i}` },
            { name: "No", price: 0.5, tokenId: `no_${i}` }
          );
        }
        return {
          id: m.condition_id || `market_${i}`,
          conditionId: m.condition_id || "",
          question: m.question || "Unknown",
          category: m.category || "General",
          endDate: m.end_date_iso || new Date().toISOString(),
          active: m.active ?? true,
          closed: m.closed ?? false,
          volume: parseFloat(m.volume || "0"),
          volume24h: parseFloat(m.volume24Hour || "0"),
          liquidity: parseFloat(m.liquidity || "0"),
          outcomes,
          createdAt: m.created_at || new Date().toISOString(),
        };
      });
      cacheTime = now;
    }

    let markets = cachedMarkets!;
    if (category && category !== "All") {
      markets = markets.filter(m => m.category?.toLowerCase() === category.toLowerCase());
    }
    return markets.slice(0, limit);
  } catch (err) {
    logger.warn({ err }, "Failed to fetch live Polymarket data, using generated mock data");
    let markets = generateMockMarkets(50);
    if (category && category !== "All") {
      markets = markets.filter(m => m.category?.toLowerCase() === category.toLowerCase());
    }
    return markets.slice(0, limit);
  }
}

export async function fetchOrderbook(marketId: string, tokenId: string): Promise<Orderbook> {
  try {
    const url = `${POLYMARKET_CLOB_API}/book?token_id=${tokenId}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Orderbook API error: ${res.status}`);
    const data = await res.json() as any;

    const bids: OrderbookLevel[] = (data.bids || []).slice(0, 10).map((b: any) => ({
      price: parseFloat(b.price),
      size: parseFloat(b.size),
    }));
    const asks: OrderbookLevel[] = (data.asks || []).slice(0, 10).map((a: any) => ({
      price: parseFloat(a.price),
      size: parseFloat(a.size),
    }));
    const topBid = bids[0]?.price ?? 0;
    const topAsk = asks[0]?.price ?? 1;
    const spread = topAsk - topBid;
    const midpoint = (topBid + topAsk) / 2;
    return { marketId, tokenId, bids, asks, spread, midpoint };
  } catch {
    const midprice = 0.4 + Math.random() * 0.2;
    const spread = 0.01 + Math.random() * 0.02;
    const bids: OrderbookLevel[] = Array.from({ length: 8 }, (_, i) => ({
      price: parseFloat((midprice - spread / 2 - i * 0.01).toFixed(3)),
      size: parseFloat((1000 + Math.random() * 5000).toFixed(0)),
    }));
    const asks: OrderbookLevel[] = Array.from({ length: 8 }, (_, i) => ({
      price: parseFloat((midprice + spread / 2 + i * 0.01).toFixed(3)),
      size: parseFloat((1000 + Math.random() * 5000).toFixed(0)),
    }));
    return { marketId, tokenId, bids, asks, spread, midpoint: midprice };
  }
}
