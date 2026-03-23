import { Router } from "express";
import { runBacktest, getSavedBacktestResults } from "../lib/backtest";
import {
  RunBacktestBody,
  RunBacktestResponse,
  GetBacktestResultsResponse,
} from "@workspace/api-zod";

const router = Router();

router.post("/backtest/run", (req, res) => {
  try {
    const body = RunBacktestBody.parse(req.body);
    const result = runBacktest(body as any);
    const response = RunBacktestResponse.parse(result);
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to run backtest");
    res.status(400).json({ error: "Invalid backtest request" });
  }
});

router.get("/backtest/results", (req, res) => {
  try {
    const results = getSavedBacktestResults();
    const response = GetBacktestResultsResponse.parse({ results, total: results.length });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to get backtest results");
    res.status(500).json({ error: "Failed to get backtest results" });
  }
});

export default router;
