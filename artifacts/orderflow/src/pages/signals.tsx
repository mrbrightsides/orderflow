import { useGetSignals, useScanSignals } from "@workspace/api-client-react";
import { formatCurrency, formatPercentage, formatProb, cn } from "@/lib/utils";
import { Radar, ExternalLink, Zap, AlertTriangle, Crosshair, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const SignalIconMap = {
  probability_drift: TrendingUp,
  volume_spike: Zap,
  mispricing: Crosshair,
  momentum: Radar
};

const SignalColorMap = {
  probability_drift: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  volume_spike: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  mispricing: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  momentum: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
};

export default function SignalScanner() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useGetSignals({
    query: { refetchInterval: 15000 }
  });
  
  const scanMutation = useScanSignals({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Scan Complete",
          description: "Successfully discovered new trading signals.",
          variant: "default",
        });
        refetch();
      },
      onError: () => {
        toast({
          title: "Scan Failed",
          description: "Failed to run signal scanner.",
          variant: "destructive",
        });
      }
    }
  });

  const handleScan = () => {
    scanMutation.mutate({});
  };

  const signals = data?.signals || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-glow-primary text-primary flex items-center">
            <Radar className="w-8 h-8 mr-3" />
            Signal Scanner
          </h1>
          <p className="text-muted-foreground mt-1">Autonomous detection of market inefficiencies and volume anomalies.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {data?.scannedAt && (
            <div className="text-sm font-mono text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              Last scan: {formatDistanceToNow(new Date(data.scannedAt), { addSuffix: true })}
            </div>
          )}
          <button
            onClick={handleScan}
            disabled={scanMutation.isPending}
            className={cn(
              "px-6 py-2.5 rounded-lg font-mono font-semibold uppercase tracking-wider flex items-center transition-all",
              "bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
              scanMutation.isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {scanMutation.isPending ? (
              <><span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" /> Scanning...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Run Scan</>
            )}
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground font-mono mb-1">Active Signals</div>
          <div className="text-3xl font-bold font-mono">{signals.length}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground font-mono mb-1">Markets Scanned</div>
          <div className="text-3xl font-bold font-mono">{data?.marketsScanned || 0}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-sm text-muted-foreground font-mono mb-1">Avg Expected Edge</div>
          <div className="text-3xl font-bold font-mono text-success">
            {signals.length > 0 
              ? formatPercentage(signals.reduce((acc, s) => acc + s.expectedEdge, 0) / signals.length * 100) 
              : "0.00%"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-10">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-panel rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass-panel rounded-xl text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-50 text-amber-500" />
            <p className="font-mono">No active signals found. Run a scan to discover opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {signals.map((signal, idx) => {
              const Icon = SignalIconMap[signal.signalType] || Radar;
              const style = SignalColorMap[signal.signalType];
              const isBuy = signal.direction === 'buy';
              
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={signal.id}
                  className="glass-panel rounded-xl p-5 flex flex-col group hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={cn("px-2.5 py-1 rounded text-xs font-mono border flex items-center capitalize tracking-wider", style)}>
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                      {signal.signalType.replace('_', ' ')}
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded text-xs font-bold font-mono uppercase tracking-widest",
                      isBuy ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                    )}>
                      {signal.direction}
                    </div>
                  </div>
                  
                  <h3 className="text-base font-medium text-foreground mb-1 line-clamp-2 leading-snug">
                    {signal.marketQuestion}
                  </h3>
                  <div className="text-sm font-mono text-muted-foreground mb-4">
                    Outcome: <span className="text-foreground font-semibold">{signal.outcomeName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-auto bg-black/20 p-3 rounded-lg border border-white/5 mb-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Current Price</div>
                      <div className="font-mono font-semibold text-lg">{formatProb(signal.currentPrice)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Target Price</div>
                      <div className="font-mono font-semibold text-lg">{formatProb(signal.targetPrice)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Exp Edge</div>
                      <div className="font-mono font-bold text-success text-glow-success">{formatPercentage(signal.expectedEdge * 100)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Confidence</div>
                      <div className="font-mono font-semibold">{formatPercentage(signal.confidence * 100)}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-mono mb-0.5">Rec. Bet (Kelly {formatPercentage(signal.kellyFraction*100)})</div>
                      <div className="font-mono font-bold text-primary">{formatCurrency(signal.suggestedBet)}</div>
                    </div>
                    <button className="text-xs font-mono bg-secondary hover:bg-white/10 text-foreground px-3 py-1.5 rounded transition-colors flex items-center">
                      Execute <ExternalLink className="w-3 h-3 ml-1.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
