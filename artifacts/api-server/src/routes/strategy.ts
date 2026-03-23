import { Router } from "express";
import {
  getStrategyConfig,
  updateStrategyConfig,
  getTrades,
  getPerformance,
} from "../lib/strategy";
import {
  GetStrategyConfigResponse,
  UpdateStrategyConfigBody,
  UpdateStrategyConfigResponse,
  GetTradesResponse,
  GetPerformanceResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/strategy/config", (req, res) => {
  try {
    const config = getStrategyConfig();
    const response = GetStrategyConfigResponse.parse(config);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get strategy config");
    res.status(500).json({ error: "Failed to get strategy config" });
  }
});

router.put("/strategy/config", (req, res) => {
  try {
    const body = UpdateStrategyConfigBody.parse(req.body);
    const updated = updateStrategyConfig(body);
    const response = UpdateStrategyConfigResponse.parse(updated);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to update strategy config");
    res.status(400).json({ error: "Invalid strategy config" });
  }
});

router.get("/strategy/trades", (req, res) => {
  try {
    const trades = getTrades();
    const response = GetTradesResponse.parse({ trades, total: trades.length });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get trades");
    res.status(500).json({ error: "Failed to get trades" });
  }
});

router.get("/strategy/performance", (req, res) => {
  try {
    const perf = getPerformance();
    const response = GetPerformanceResponse.parse(perf);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get performance");
    res.status(500).json({ error: "Failed to get performance" });
  }
});

export default router;
