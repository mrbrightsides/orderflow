import { useState } from "react";
import { useGetMarkets, useGetOrderbook } from "@workspace/api-client-react";
import { formatProb, formatCurrency, cn } from "@/lib/utils";
import { Search, TrendingUp, Droplets, Filter, AlertCircle, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  const { data: marketsData, isLoading, error } = useGetMarkets(
    { category: categoryFilter, limit: 50 },
    { query: { refetchInterval: 30000 } }
  );

  const selectedMarket = marketsData?.markets?.find(m => m.id === selectedMarketId);
  const selectedTokenId = selectedMarket?.outcomes[0]?.tokenId || ""; // default to first outcome for orderbook

  const { data: orderbook, isLoading: isOrderbookLoading } = useGetOrderbook(
    selectedMarketId || "",
    { tokenId: selectedTokenId },
    { query: { enabled: !!selectedMarketId && !!selectedTokenId, refetchInterval: 10000 } }
  );

  const filteredMarkets = marketsData?.markets?.filter(m => 
    m.question.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-glow-primary text-primary">Live Markets</h1>
          <p className="text-muted-foreground mt-1">Real-time Polymarket orderflow & probability analysis.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 font-mono transition-all"
            />
          </div>
          <select 
            value={categoryFilter || ""} 
            onChange={(e) => setCategoryFilter(e.target.value || undefined)}
            className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary font-mono appearance-none"
          >
            <option value="">All Categories</option>
            <option value="Crypto">Crypto</option>
            <option value="Politics">Politics</option>
            <option value="Sports">Sports</option>
            <option value="Pop Culture">Pop Culture</option>
          </select>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Markets List */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse h-40"></div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-destructive glass-panel rounded-xl">
              <AlertCircle className="w-6 h-6 mr-2" />
              Failed to load markets. API endpoint might be offline.
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground glass-panel rounded-xl">
              <Filter className="w-12 h-12 mb-4 opacity-50" />
              <p>No markets found matching your criteria.</p>
            </div>
          ) : (
            filteredMarkets.map(market => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={market.id}
                onClick={() => setSelectedMarketId(market.id)}
                className={cn(
                  "bg-card rounded-xl p-5 border cursor-pointer transition-all duration-200 hover:shadow-lg",
                  selectedMarketId === market.id 
                    ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)] ring-1 ring-primary/50" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-2 pr-4">
                    {market.question}
                  </h3>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs text-muted-foreground uppercase font-mono">{market.category || "Uncategorized"}</span>
                    {market.active ? (
                      <span className="inline-flex items-center mt-1 text-xs text-success font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center mt-1 text-xs text-muted-foreground font-mono">Closed</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center text-sm text-muted-foreground font-mono">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                    Vol: <span className="text-foreground ml-1">{formatCurrency(market.volume)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground font-mono">
                    <Droplets className="w-4 h-4 mr-2 text-primary" />
                    Liq: <span className="text-foreground ml-1">{formatCurrency(market.liquidity)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {market.outcomes.slice(0, 2).map((outcome, idx) => {
                    const prob = outcome.price * 100;
                    const isYes = outcome.name.toLowerCase() === 'yes';
                    const barColor = isYes ? 'bg-success' : 'bg-destructive';
                    const textColor = isYes ? 'text-success' : 'text-destructive';
                    
                    return (
                      <div key={idx} className="relative pt-1">
                        <div className="flex mb-1 items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-foreground">{outcome.name}</span>
                          <span className={cn("font-bold", textColor)}>{formatProb(outcome.price)}</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-secondary">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${prob}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={cn("shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center", barColor)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {market.outcomes.length > 2 && (
                    <div className="text-xs text-muted-foreground font-mono text-center">
                      + {market.outcomes.length - 2} more outcomes
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Orderbook Sidebar */}
        <AnimatePresence>
          {selectedMarketId && (
            <motion.div 
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 400 }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="flex-shrink-0"
            >
              <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border bg-card/50">
                  <h3 className="font-mono font-bold text-foreground flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                    Orderbook Depth
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-1" title={selectedMarket?.question}>
                    {selectedMarket?.question}
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                  {isOrderbookLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : orderbook ? (
                    <div className="space-y-6">
                      {/* ASKS (Sells) */}
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2 px-2">
                          <span>Price (Ask)</span>
                          <span>Size (Shares)</span>
                        </div>
                        <div className="space-y-1">
                          {orderbook.asks.map((level, i) => {
                            const maxAskSize = Math.max(...orderbook.asks.map(a => a.size), 1);
                            const depthPct = (level.size / maxAskSize) * 100;
                            return (
                              <div key={i} className="relative flex justify-between px-2 py-1 group hover:bg-white/5 rounded">
                                <div className="absolute right-0 top-0 bottom-0 bg-destructive/10 -z-10 transition-all" style={{ width: `${depthPct}%` }} />
                                <span className="text-destructive font-medium">{formatProb(level.price)}</span>
                                <span className="text-foreground">{level.size.toLocaleString()}</span>
                              </div>
                            )
                          }).reverse()}
                        </div>
                      </div>

                      {/* SPREAD */}
                      <div className="py-2 border-y border-border/50 text-center flex flex-col items-center justify-center bg-black/20 rounded">
                        <span className="text-xs text-muted-foreground">Spread</span>
                        <span className="font-bold text-primary">{formatProb(orderbook.spread)}</span>
                      </div>

                      {/* BIDS (Buys) */}
                      <div>
                        <div className="space-y-1">
                          {orderbook.bids.map((level, i) => {
                            const maxBidSize = Math.max(...orderbook.bids.map(b => b.size), 1);
                            const depthPct = (level.size / maxBidSize) * 100;
                            return (
                              <div key={i} className="relative flex justify-between px-2 py-1 group hover:bg-white/5 rounded">
                                <div className="absolute left-0 top-0 bottom-0 bg-success/10 -z-10 transition-all" style={{ width: `${depthPct}%` }} />
                                <span className="text-success font-medium">{formatProb(level.price)}</span>
                                <span className="text-foreground">{level.size.toLocaleString()}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground mt-10">No orderbook data available.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
