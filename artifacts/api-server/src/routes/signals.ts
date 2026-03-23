import { Router } from "express";
import { fetchMarkets } from "../lib/polymarket";
import { scanMarkets, Signal } from "../lib/signals";
import { getStrategyConfig } from "../lib/strategy";
import { GetSignalsResponse, ScanSignalsResponse } from "@workspace/api-zod";

const router = Router();

let cachedSignals: Signal[] = [];
let lastScanAt: string = new Date().toISOString();
let lastMarketsScanned = 0;

router.get("/signals", async (req, res) => {
  try {
    if (cachedSignals.length === 0) {
      const markets = await fetchMarkets(undefined, 30);
      const config = getStrategyConfig();
      cachedSignals = scanMarkets(markets, config.bankroll, config.enabledSignalTypes);
      lastScanAt = new Date().toISOString();
      lastMarketsScanned = markets.length;
    }
    const response = GetSignalsResponse.parse({
      signals: cachedSignals,
      scannedAt: lastScanAt,
      marketsScanned: lastMarketsScanned,
    });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get signals");
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

router.post("/signals/scan", async (req, res) => {
  try {
    const markets = await fetchMarkets(undefined, 30);
    const config = getStrategyConfig();
    cachedSignals = scanMarkets(markets, config.bankroll, config.enabledSignalTypes);
    lastScanAt = new Date().toISOString();
    lastMarketsScanned = markets.length;
    const response = ScanSignalsResponse.parse({
      signals: cachedSignals,
      scannedAt: lastScanAt,
      marketsScanned: lastMarketsScanned,
    });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to scan signals");
    res.status(500).json({ error: "Failed to scan signals" });
  }
});

export default router;
