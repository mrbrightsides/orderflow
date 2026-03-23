import { useState } from "react";
import { useRunBacktest, useGetBacktestResults } from "@workspace/api-client-react";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Play, Database, Calendar, BarChart2, Hash, Activity } from "lucide-react";
import { format } from "date-fns";
import type { BacktestRequestStrategy, BacktestResult } from "@workspace/api-client-react";

export default function Backtester() {
  const { data: historyData, refetch: refetchHistory } = useGetBacktestResults();
  
  const [params, setParams] = useState({
    strategy: 'kelly_criterion' as BacktestRequestStrategy,
    initialBankroll: 10000,
    startDate: "2024-01-01",
    endDate: format(new Date(), 'yyyy-MM-dd'),
    maxKellyFraction: 0.25,
    minEdge: 0.05
  });

  const [activeResult, setActiveResult] = useState<BacktestResult | null>(null);

  const runMut = useRunBacktest({
    mutation: {
      onSuccess: (res) => {
        setActiveResult(res);
        refetchHistory();
      }
    }
  });

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    runMut.mutate({
      data: {
        ...params,
        startDate: new Date(params.startDate).toISOString(),
        endDate: new Date(params.endDate).toISOString(),
      }
    });
  };

  // If we have history but no active result, pick the first one
  if (!activeResult && historyData?.results?.length) {
    setActiveResult(historyData.results[0]);
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <header>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-glow-primary text-primary flex items-center">
          <Database className="w-8 h-8 mr-3" />
          Simulation Engine
        </h1>
        <p className="text-muted-foreground mt-1">Run historical backtests on prediction market data using custom strategies.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Col: Config Form */}
        <div className="glass-panel rounded-xl p-5 flex flex-col overflow-y-auto">
          <h3 className="font-mono font-bold text-foreground mb-4 border-b border-border pb-2">Test Parameters</h3>
          
          <form onSubmit={handleRun} className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">Strategy Type</label>
              <select 
                className="w-full bg-black/30 border border-border rounded px-3 py-2 text-sm font-mono focus:border-primary outline-none appearance-none"
                value={params.strategy}
                onChange={e => setParams({...params, strategy: e.target.value as BacktestRequestStrategy})}
              >
                <option value="kelly_criterion">Kelly Criterion</option>
                <option value="fixed_fractional">Fixed Fractional</option>
                <option value="probability_drift">Momentum / Drift</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">Starting Capital ($)</label>
              <input 
                type="number" 
                value={params.initialBankroll}
                onChange={e => setParams({...params, initialBankroll: Number(e.target.value)})}
                className="w-full bg-black/30 border border-border rounded px-3 py-2 text-sm font-mono focus:border-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">Start Date</label>
                <input 
                  type="date" 
                  value={params.startDate}
                  onChange={e => setParams({...params, startDate: e.target.value})}
                  className="w-full bg-black/30 border border-border rounded px-2 py-2 text-xs font-mono focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">End Date</label>
                <input 
                  type="date" 
                  value={params.endDate}
                  onChange={e => setParams({...params, endDate: e.target.value})}
                  className="w-full bg-black/30 border border-border rounded px-2 py-2 text-xs font-mono focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">Max Kelly Frc: {params.maxKellyFraction}</label>
              <input type="range" min="0.05" max="1" step="0.05" value={params.maxKellyFraction} onChange={e => setParams({...params, maxKellyFraction: Number(e.target.value)})} className="w-full accent-primary" />
            </div>

            <div className="pt-4 mt-auto">
              <button 
                type="submit"
                disabled={runMut.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold py-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
              >
                {runMut.isPending ? (
                  <><span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"/> Running...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2 fill-current" /> Initialize Run</>
                )}
              </button>
            </div>
          </form>

          {/* History List */}
          {historyData?.results && historyData.results.length > 0 && (
            <div className="mt-8 pt-4 border-t border-border">
              <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase">Previous Runs</h4>
              <div className="space-y-2">
                {historyData.results.slice(0,5).map(res => (
                  <button
                    key={res.id}
                    onClick={() => setActiveResult(res)}
                    className={cn(
                      "w-full text-left p-2 rounded border text-xs font-mono transition-colors",
                      activeResult?.id === res.id 
                        ? "bg-primary/10 border-primary text-foreground" 
                        : "bg-black/20 border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <div className="flex justify-between">
                      <span className="truncate pr-2">{res.strategy.replace('_', ' ')}</span>
                      <span className={res.totalReturn >= 0 ? "text-success" : "text-destructive"}>
                        {formatPercentage(res.totalReturn)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Results */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
          {!activeResult ? (
            <div className="glass-panel rounded-xl flex-1 flex flex-col items-center justify-center text-muted-foreground p-10">
              <BarChart2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-mono text-lg">No simulation active</p>
              <p className="text-sm mt-2">Configure parameters and run a backtest to see results.</p>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border-l-2 border-l-primary">
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Total Return</div>
                  <div className={cn("text-2xl font-bold font-mono", activeResult.totalReturn >= 0 ? "text-success text-glow-success" : "text-destructive text-glow-destructive")}>
                    {activeResult.totalReturn >= 0 ? "+" : ""}{formatPercentage(activeResult.totalReturn)}
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border-l-2 border-l-blue-500">
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Sharpe Ratio</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{activeResult.sharpeRatio.toFixed(2)}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border-l-2 border-l-amber-500">
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Max Drawdown</div>
                  <div className="text-2xl font-bold font-mono text-destructive">{formatPercentage(activeResult.maxDrawdown)}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border-l-2 border-l-purple-500">
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Win Rate</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatPercentage(activeResult.winRate)}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel rounded-xl p-5 flex-1 min-h-[350px]">
                <h3 className="font-mono font-bold text-foreground mb-6 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-primary" />
                  Equity Curve
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeResult.equityCurve} margin={{ top: 5, right: 5, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10} 
                        tickFormatter={(v) => format(new Date(v), 'MMM dd')}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        domain={['dataMin - 1000', 'dataMax + 1000']} 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontFamily: 'monospace' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px', fontFamily: 'monospace' }}
                        formatter={(value: number) => [formatCurrency(value), 'Equity']}
                        labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                      />
                      <ReferenceLine y={activeResult.initialBankroll} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                      <Line 
                        type="monotone" 
                        dataKey="equity" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
