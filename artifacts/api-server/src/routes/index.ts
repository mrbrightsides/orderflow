import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketsRouter from "./markets";
import signalsRouter from "./signals";
import strategyRouter from "./strategy";
import backtestRouter from "./backtest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketsRouter);
router.use(signalsRouter);
router.use(strategyRouter);
router.use(backtestRouter);

export default router;
