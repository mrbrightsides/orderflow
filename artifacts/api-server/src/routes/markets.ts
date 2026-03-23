import { Router } from "express";
import { fetchMarkets, fetchOrderbook } from "../lib/polymarket";
import {
  GetMarketsQueryParams,
  GetMarketsResponse,
  GetMarketResponse,
  GetOrderbookQueryParams,
  GetOrderbookResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/markets", async (req, res) => {
  try {
    const query = GetMarketsQueryParams.parse(req.query);
    const markets = await fetchMarkets(query.category, query.limit ?? 20);
    const response = GetMarketsResponse.parse({ markets, total: markets.length });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get markets");
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

router.get("/markets/:marketId", async (req, res) => {
  try {
    const markets = await fetchMarkets();
    const market = markets.find(m => m.id === req.params.marketId);
    if (!market) {
      res.status(404).json({ error: "Market not found" });
      return;
    }
    const response = GetMarketResponse.parse(market);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get market");
    res.status(500).json({ error: "Failed to fetch market" });
  }
});

router.get("/markets/:marketId/orderbook", async (req, res) => {
  try {
    const query = GetOrderbookQueryParams.parse(req.query);
    const orderbook = await fetchOrderbook(req.params.marketId, query.tokenId);
    const response = GetOrderbookResponse.parse(orderbook);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get orderbook");
    res.status(500).json({ error: "Failed to fetch orderbook" });
  }
});

export default router;
