import { DollarSign, FileText, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useApp } from "@/context/useApp";

export function StatsCards() {
  const { getTotalRevenue, invoices, getInvoiceStats } = useApp();
  const stats = getInvoiceStats();
  const revenue = getTotalRevenue();
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const statItems = [
    {
      label: "Total Revenue",
      value: `₹${revenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "from-neon-blue to-neon-cyan",
      glowClass: "glow-blue",
    },
    {
      label: "Total Invoices",
      value: stats.total.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: FileText,
      color: "from-neon-purple to-neon-pink",
      glowClass: "glow-purple",
    },
    {
      label: "Pending Payments",
      value: `₹${pendingAmount.toLocaleString()}`,
      change: "-3.1%",
      trend: "down" as const,
      icon: Clock,
      color: "from-neon-yellow to-neon-red",
      glowClass: "glow-pink",
    },
    {
      label: "Overdue Invoices",
      value: stats.overdue.toString(),
      change: "+2.4%",
      trend: "up" as const,
      icon: AlertTriangle,
      color: "from-neon-red to-neon-pink",
      glowClass: "glow-pink",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((stat, i) => (
        <div
          key={stat.label}
          className="glow-border group rounded-2xl bg-glass-card border border-white/5 p-5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
            >
              <stat.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === "up" ? "text-neon-green" : "text-neon-red"
              }`}
            >
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stat.change}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
