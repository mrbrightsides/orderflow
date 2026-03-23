import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, LineChart, Target, TerminalSquare, Zap, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app", label: "Markets Dashboard", icon: Activity },
  { href: "/app/signals", label: "Signal Scanner", icon: Zap },
  { href: "/app/strategy", label: "Strategy & Trades", icon: Target },
  { href: "/app/backtester", label: "Backtester", icon: LineChart },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <TerminalSquare className="w-6 h-6 text-primary mr-3" />
          <span className="font-mono font-bold text-lg tracking-wider text-glow-primary">ORDERFLOW</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground font-mono hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Back to landing
          </Link>
          <div className="flex items-center text-xs text-muted-foreground font-mono">
            <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse shadow-[0_0_8px_hsl(var(--success))]" />
            System Online
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRlcm4gaWQ9InNtYWxsR3JpZCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMTAgMEwwIDBMMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InVybCgjc21hbGxHcmlkKSIvPjxwYXRoIGQ9Ik00MCAwTDAgMEwwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-[0.15]" />

        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
