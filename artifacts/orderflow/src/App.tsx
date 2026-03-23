import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";

import MarketsDashboard from "@/pages/markets";
import SignalScanner from "@/pages/signals";
import StrategyPage from "@/pages/strategy";
import Backtester from "@/pages/backtester";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app">
        <Layout>
          <MarketsDashboard />
        </Layout>
      </Route>
      <Route path="/app/signals">
        <Layout>
          <SignalScanner />
        </Layout>
      </Route>
      <Route path="/app/strategy">
        <Layout>
          <StrategyPage />
        </Layout>
      </Route>
      <Route path="/app/backtester">
        <Layout>
          <Backtester />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
