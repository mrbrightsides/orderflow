import { useState, useEffect } from "react";
import { useGetStrategyConfig, useUpdateStrategyConfig, useGetTrades, useGetPerformance } from "@workspace/api-client-react";
import { formatCurrency, formatPercentage, formatProb, cn } from "@/lib/utils";
import { Settings, Save, RefreshCw, Briefcase, Activity, CheckCircle2, XCircle, TrendingUp, Info, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StrategyPage() {
  const { toast } = useToast();
  const { data: config, isLoading: isConfigLoading } = useGetStrategyConfig();
  const { data: tradesData, isLoading: isTradesLoading } = useGetTrades({ query: { refetchInterval: 10000 } });
  const { data: performance, isLoading: isPerfLoading } = useGetPerformance({ query: { refetchInterval: 10000 } });
  
  const updateConfigMut = useUpdateStrategyConfig({
    mutation: {
      onSuccess: () => {
        toast({ title: "Config Saved", description: "Strategy configuration updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update config.", variant: "destructive" });
      }
    }
  });

  const [localConfig, setLocalConfig] = useState({
    bankroll: 10000,
    maxKellyFraction: 0.25,
    minEdge: 0.05,
    minConfidence: 0.80,
    autoTrade: false
  });

  useEffect(() => {
    if (config) {
      setLocalConfig({
        bankroll: config.bankroll,
        maxKellyFraction: config.maxKellyFraction,
        minEdge: config.minEdge / 100,
        minConfidence: config.minConfidence,
        autoTrade: config.autoTrade
      });
    }
  }, [config]);

  const handleSaveConfig = () => {
    updateConfigMut.mutate({
      data: {
        ...localConfig,
        minEdge: parseFloat((localConfig.minEdge * 100).toFixed(2)),
      },
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-glow-primary text-primary flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          Strategy & Live Execution
        </h1>
        <p className="text-muted-foreground mt-1">Configure trading parameters and monitor live automated execution.</p>
      </header>

      {/* Workflow explanation */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="font-mono text-muted-foreground text-xs leading-relaxed">
          <span className="text-foreground font-semibold">How this works: </span>
          Set your risk parameters and save → go to{" "}
          <span className="text-primary">Signal Scanner</span> and click Execute on any signal →
          the trade appears in the log below → Performance and Equity Curve update automatically.
          <span className="text-muted-foreground/60"> Parameters do not retroactively change existing trades.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Config & Performance */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
          {/* Performance Summary */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Live Performance
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground/50 bg-black/20 px-2 py-0.5 rounded">
                from closed trades · auto-refreshes
              </span>
            </div>
            {isPerfLoading ? (
              <div className="h-32 animate-pulse bg-white/5 rounded-lg" />
            ) : performance ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Net P&L</div>
                  <div className={cn("font-mono font-bold text-xl", performance.totalPnl >= 0 ? "text-success text-glow-success" : "text-destructive text-glow-destructive")}>
                    {performance.totalPnl >= 0 ? "+" : ""}{formatCurrency(performance.totalPnl)}
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Win Rate</div>
                  <div className="font-mono font-bold text-xl text-foreground">{formatPercentage(performance.winRate * 100)}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Bankroll</div>
                  <div className="font-mono font-bold text-xl text-foreground">{formatCurrency(performance.bankroll)}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Open Trades</div>
                  <div className="font-mono font-bold text-xl text-primary">{performance.openTrades}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Sharpe Ratio</div>
                  <div className="font-mono font-bold text-lg text-violet-400">{performance.sharpeRatio.toFixed(2)}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">Max Drawdown</div>
                  <div className="font-mono font-bold text-lg text-amber-400">{performance.maxDrawdown.toFixed(1)}%</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Equity Curve */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" /> Equity Curve
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground/50 bg-black/20 px-2 py-0.5 rounded flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> execute trades to grow this
              </span>
            </div>
            {isPerfLoading ? (
              <div className="h-36 animate-pulse bg-white/5 rounded-lg" />
            ) : performance?.equityCurve && performance.equityCurve.length > 1 ? (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={performance.equityCurve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
                    formatter={(v: number) => [formatCurrency(v), "Equity"]}
                  />
                  <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#equityGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-36 flex items-center justify-center text-muted-foreground text-xs font-mono">No closed trades yet</div>
            )}
          </div>

          {/* Strategy Config */}
          <div className="glass-panel rounded-xl p-5 flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
                <Briefcase className="w-4 h-4 mr-2" /> Risk Parameters
              </h3>
              <button 
                onClick={handleSaveConfig}
                disabled={updateConfigMut.isPending}
                className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50 px-3 py-1.5 rounded font-mono text-xs transition-colors flex items-center"
              >
                {updateConfigMut.isPending ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                Save
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/60 font-mono mb-5 leading-relaxed">
              Save changes, then execute signals from the Scanner. Parameters apply to the <span className="text-primary">next trade only</span> — existing trades are unaffected.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-2 flex justify-between">
                  <span>Operating Bankroll</span>
                  <span className="text-foreground">{formatCurrency(localConfig.bankroll)}</span>
                </label>
                <input 
                  type="number" 
                  value={localConfig.bankroll}
                  onChange={(e) => setLocalConfig({...localConfig, bankroll: Number(e.target.value)})}
                  className="w-full bg-black/30 border border-border rounded px-3 py-2 text-sm font-mono focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground mb-2 flex justify-between">
                  <span>Max Kelly Fraction</span>
                  <span className="text-foreground">{formatPercentage(localConfig.maxKellyFraction * 100)}</span>
                </label>
                <input 
                  type="range" min="0.01" max="1" step="0.01"
                  value={localConfig.maxKellyFraction}
                  onChange={(e) => setLocalConfig({...localConfig, maxKellyFraction: Number(e.target.value)})}
                  className="w-full accent-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">Caps bet size relative to pure Kelly suggestion.</p>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground mb-2 flex justify-between">
                  <span>Minimum Edge</span>
                  <span className="text-foreground">{formatPercentage(localConfig.minEdge * 100)}</span>
                </label>
                <input 
                  type="range" min="0" max="0.5" step="0.01"
                  value={localConfig.minEdge}
                  onChange={(e) => setLocalConfig({...localConfig, minEdge: Number(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground mb-2 flex justify-between">
                  <span>Min. Signal Confidence</span>
                  <span className="text-foreground">{formatPercentage(localConfig.minConfidence * 100)}</span>
                </label>
                <input 
                  type="range" min="0.5" max="0.99" step="0.01"
                  value={localConfig.minConfidence}
                  onChange={(e) => setLocalConfig({...localConfig, minConfidence: Number(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-mono text-foreground">Auto-Trade</div>
                  <div className="text-xs text-muted-foreground font-mono">Execute signals automatically</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={localConfig.autoTrade}
                    onChange={(e) => setLocalConfig({...localConfig, autoTrade: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success shadow-[0_0_10px_rgba(0,0,0,0.2)] peer-checked:shadow-[0_0_15px_hsl(var(--success)/0.5)]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trade Log */}
        <div className="lg:col-span-8 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center">
            <h3 className="font-mono font-bold text-foreground">Trade Log</h3>
            <span className="text-xs font-mono text-muted-foreground bg-black/30 px-2 py-1 rounded">
              Total: {tradesData?.total || 0}
            </span>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm font-mono">
              <thead className="text-xs uppercase bg-black/20 text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Market / Outcome</th>
                  <th className="px-4 py-3 font-medium">Dir</th>
                  <th className="px-4 py-3 font-medium text-right">Size</th>
                  <th className="px-4 py-3 font-medium text-right">Entry</th>
                  <th className="px-4 py-3 font-medium text-right">P&L</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isTradesLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                ) : !tradesData?.trades?.length ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No trade history available.</td></tr>
                ) : (
                  tradesData.trades.map((trade) => {
                    const isBuy = trade.direction === 'buy';
                    const isProfitable = trade.pnl && trade.pnl > 0;
                    return (
                      <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(trade.openedAt), 'MMM dd, HH:mm')}
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="truncate text-foreground" title={trade.marketQuestion}>{trade.marketQuestion}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{trade.outcomeName} • {trade.signalType}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold", isBuy ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(trade.size)}</td>
                        <td className="px-4 py-3 text-right">{formatProb(trade.entryPrice)}</td>
                        <td className="px-4 py-3 text-right">
                          {trade.status === 'open' ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            <span className={cn("font-bold text-glow", isProfitable ? "text-success text-glow-success" : "text-destructive text-glow-destructive")}>
                              {isProfitable ? "+" : ""}{trade.pnl ? formatCurrency(trade.pnl) : "0.00"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {trade.status === 'open' ? (
                            <span className="inline-flex items-center text-primary text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1.5" /> Open
                            </span>
                          ) : trade.status === 'closed' ? (
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
