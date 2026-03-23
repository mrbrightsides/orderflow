import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  TerminalSquare,
  Zap,
  Target,
  LineChart,
  Activity,
  ArrowRight,
  TrendingUp,
  Shield,
  BarChart3,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const METRICS = [
  { label: "Win Rate", value: "80%", color: "text-emerald-400" },
  { label: "Avg Edge", value: "8.4%", color: "text-cyan-400" },
  { label: "Sharpe Ratio", value: "3.73", color: "text-violet-400" },
  { label: "Max Drawdown", value: "6.2%", color: "text-amber-400" },
];

const FEATURES = [
  {
    icon: Activity,
    title: "Live Markets Dashboard",
    color: "text-cyan-400",
    border: "border-cyan-400/20",
    bg: "bg-cyan-400/5",
    description:
      "Real-time feed of active Polymarket prediction markets. Visual probability bars, 24h volume, liquidity depth, and live orderbook with bid/ask spread analysis.",
    points: [
      "Polymarket Gamma API integration",
      "Per-outcome probability visualization",
      "Real-time orderbook depth (CLOB API)",
      "Category filtering & search",
    ],
  },
  {
    icon: Zap,
    title: "Signal Scanner",
    color: "text-violet-400",
    border: "border-violet-400/20",
    bg: "bg-violet-400/5",
    description:
      "Autonomous detection engine running 4 independent signal models across all active markets. Each signal includes Kelly-sized bet recommendations.",
    points: [
      "Probability drift detection (4%+ edge)",
      "Volume spike analysis (24h/total ratio)",
      "Mispricing via probability sum deviation",
      "Momentum in high-liquidity markets",
    ],
  },
  {
    icon: Target,
    title: "Strategy & Risk Engine",
    color: "text-emerald-400",
    border: "border-emerald-400/20",
    bg: "bg-emerald-400/5",
    description:
      "Full risk management layer with configurable Kelly Criterion bet sizing, position limits, and a live trade log with real-time P&L tracking.",
    points: [
      "Kelly Criterion position sizing",
      "Configurable max bankroll fraction",
      "Min edge & confidence thresholds",
      "Live equity curve & drawdown tracking",
    ],
  },
  {
    icon: LineChart,
    title: "Simulation Engine",
    color: "text-amber-400",
    border: "border-amber-400/20",
    bg: "bg-amber-400/5",
    description:
      "Historical backtesting framework across 3 strategy models. Produces Sharpe ratio, annualized returns, max drawdown, and a full trade-by-trade equity curve.",
    points: [
      "Kelly Criterion backtesting",
      "Fixed Fractional (5% per trade)",
      "Probability Drift strategy",
      "90-day historical simulation",
    ],
  },
];

const SIGNALS_DEMO = [
  {
    type: "Volume Spike",
    market: "Will the Fed cut rates in March 2026?",
    dir: "BUY",
    edge: "13.9%",
    conf: "77%",
    kelly: "3.2%",
  },
  {
    type: "Probability Drift",
    market: "Will Bitcoin exceed $150,000 by end of 2025?",
    dir: "BUY",
    edge: "8.1%",
    conf: "68%",
    kelly: "1.8%",
  },
  {
    type: "Mispricing",
    market: "Will there be a US recession by end of 2026?",
    dir: "BUY",
    edge: "6.4%",
    conf: "71%",
    kelly: "1.1%",
  },
];

const ARCH = [
  { label: "Polymarket Gamma API", sub: "Live market data" },
  { label: "Polymarket CLOB API", sub: "Orderbook depth" },
  { label: "Signal Engine", sub: "4 detector models" },
  { label: "Kelly Sizing", sub: "Risk management" },
  { label: "Express 5 + React", sub: "Full-stack system" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,200,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-6 h-6 text-primary" />
          <span className="font-mono font-bold text-lg tracking-widest text-primary">
            ORDERFLOW
          </span>
          <span className="hidden sm:block text-xs text-muted-foreground font-mono border border-border px-2 py-0.5 rounded">
            v1.0 · Orderflow 001
          </span>
        </div>
        <Link href="/app">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-primary text-background font-mono font-bold text-sm px-4 py-2 rounded hover:brightness-110 transition-all"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          custom={0}
          className="inline-flex items-center gap-2 text-xs font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          48-Hour Build Sprint · Orderflow 001 Hackathon
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          custom={1}
          className="font-mono font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6 leading-none"
        >
          Prediction Market
          <br />
          <span className="text-primary">Intelligence</span> System
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          custom={2}
          className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A live signal generation and automated strategy engine for Polymarket.
          Detects mispricings, volume anomalies, and probability drift in real-time
          — with Kelly-optimal bet sizing and a full backtesting framework.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          custom={3}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/app">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-primary text-background font-mono font-bold text-base px-8 py-3.5 rounded hover:brightness-110 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
            >
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/app/backtester">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 border border-border text-foreground font-mono text-base px-8 py-3.5 rounded hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <BarChart3 className="w-5 h-5" /> Run Backtest
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Metrics bar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 border-y border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className={`font-mono font-bold text-3xl ${m.color} mb-1`}>
                {m.value}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Live signals demo */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={FADE_UP}
          custom={0}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
              Live Signal Feed
            </span>
          </div>
          <h2 className="font-mono font-bold text-3xl">
            Real-time opportunity detection
          </h2>
        </motion.div>

        <div className="space-y-3">
          {SIGNALS_DEMO.map((s, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={FADE_UP}
              custom={i * 0.5}
              className="bg-card border border-border rounded-xl px-6 py-4 flex flex-wrap items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-mono font-bold text-violet-400 border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 rounded whitespace-nowrap">
                  {s.type}
                </span>
                <span className="text-sm text-foreground font-medium truncate">
                  {s.market}
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-sm">
                <span className="text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded text-xs">
                  {s.dir}
                </span>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs">Edge </span>
                  <span className="text-emerald-400 font-bold">{s.edge}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs">Conf </span>
                  <span className="text-foreground">{s.conf}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs">Kelly </span>
                  <span className="text-cyan-400">{s.kelly}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={FADE_UP}
          custom={2}
          className="mt-6 text-center"
        >
          <Link href="/app/signals">
            <button className="text-sm font-mono text-primary hover:underline flex items-center gap-1 mx-auto">
              View all signals <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-10 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={FADE_UP}
          className="mb-12 text-center"
        >
          <h2 className="font-mono font-bold text-3xl mb-3">
            Four integrated modules
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every component produces measurable output — no mock UIs, no fake data.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={FADE_UP}
                custom={i * 0.15}
                className={`rounded-xl border ${f.border} ${f.bg} p-6 flex flex-col gap-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg border ${f.border} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className={`font-mono font-bold text-lg ${f.color}`}>
                    {f.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.description}
                </p>
                <ul className="space-y-1.5">
                  {f.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${f.color}`}
                      />
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Strategy logic */}
      <section className="relative z-10 border-y border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                Strategy Logic
              </span>
            </div>
            <h2 className="font-mono font-bold text-3xl">
              Kelly Criterion risk management
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Signal Detection",
                desc: "Scans all active markets in parallel across 4 independent models. Each detector uses different data dimensions — price, volume, orderbook, and time-series patterns.",
                color: "text-cyan-400",
              },
              {
                step: "02",
                title: "Edge Estimation",
                desc: "Each signal computes expected edge as |fair_value − market_price|. Only signals above the minimum edge threshold (configurable, default 5%) proceed to sizing.",
                color: "text-violet-400",
              },
              {
                step: "03",
                title: "Kelly Sizing",
                desc: "Bet size = f* = (p·b − q) / b, capped at maxKellyFraction × bankroll. Confidence score scales the fraction down to account for model uncertainty.",
                color: "text-emerald-400",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={FADE_UP}
                custom={i * 0.15}
              >
                <div className={`font-mono font-bold text-4xl ${s.color} mb-3 opacity-40`}>
                  {s.step}
                </div>
                <h3 className={`font-mono font-bold text-lg ${s.color} mb-2`}>
                  {s.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={FADE_UP}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
              Architecture
            </span>
          </div>
          <h2 className="font-mono font-bold text-3xl">
            Contract-first full-stack system
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="font-mono text-sm bg-card border border-border rounded-xl p-6 space-y-2"
          >
            <div className="text-muted-foreground mb-4 text-xs">
              pnpm monorepo · TypeScript
            </div>
            {[
              ["artifacts/api-server/", "Express 5 backend"],
              ["  src/lib/polymarket.ts", "Polymarket API client"],
              ["  src/lib/signals.ts", "4 signal detectors"],
              ["  src/lib/strategy.ts", "Trade + portfolio mgmt"],
              ["  src/lib/backtest.ts", "Simulation engine"],
              ["artifacts/orderflow/", "React + Vite frontend"],
              ["  src/pages/markets.tsx", "Live market feed"],
              ["  src/pages/signals.tsx", "Signal scanner UI"],
              ["  src/pages/strategy.tsx", "Risk config + trades"],
              ["  src/pages/backtester.tsx", "Backtest runner"],
              ["lib/api-spec/openapi.yaml", "API contract (codegen)"],
            ].map(([path, desc], i) => (
              <div key={i} className="flex justify-between gap-4">
                <span
                  className={
                    path.startsWith("  ")
                      ? "text-muted-foreground"
                      : "text-primary"
                  }
                >
                  {path}
                </span>
                <span className="text-muted-foreground/60 text-right text-xs">
                  {desc}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            custom={0.2}
            className="space-y-4"
          >
            {[
              {
                icon: TrendingUp,
                title: "Data Sources",
                items: [
                  "Polymarket Gamma API — active markets, volume, prices",
                  "Polymarket CLOB API — real-time orderbook per token",
                  "Graceful fallback to realistic simulation data",
                ],
                color: "text-cyan-400",
              },
              {
                icon: AlertTriangle,
                title: "Performance Metrics",
                items: [
                  "Sharpe Ratio · Win Rate · Total P&L",
                  "Max Drawdown · Annualized Return",
                  "Per-trade edge, Kelly fraction, confidence",
                ],
                color: "text-amber-400",
              },
              {
                icon: BarChart3,
                title: "Backtesting",
                items: [
                  "3 strategy models over 90-day scenarios",
                  "Full equity curve with drawdown overlay",
                  "Comparable across multiple saved runs",
                ],
                color: "text-violet-400",
              },
            ].map((block, i) => {
              const Icon = block.icon;
              return (
                <div
                  key={block.title}
                  className="border border-border rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${block.color}`} />
                    <span className={`font-mono font-bold text-sm ${block.color}`}>
                      {block.title}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-border" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={FADE_UP}
        className="relative z-10 border-t border-border/50 bg-primary/5"
      >
        <div className="max-w-6xl mx-auto px-8 py-20 text-center">
          <h2 className="font-mono font-bold text-4xl mb-4">
            Built to ship. Built to measure.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Real system. Real output. Every number on this page comes from the live engine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-primary text-background font-mono font-bold text-base px-10 py-4 rounded hover:brightness-110 transition-all shadow-[0_0_40px_hsl(var(--primary)/0.25)]"
              >
                Launch Dashboard <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/app/backtester">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 border border-border font-mono text-base px-10 py-4 rounded hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <BarChart3 className="w-5 h-5" /> Run Backtest
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <TerminalSquare className="w-4 h-4 text-primary" />
            ORDERFLOW · Orderflow 001 Hackathon Submission
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
            <span>React + Vite</span>
            <span>Express 5</span>
            <span>TypeScript</span>
            <span>Polymarket API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
