import { Home, RotateCcw, AlertCircle } from "lucide-react";

const insights = [
  {
    label: "Active Rentals",
    value: "186",
    sub: "12 new this week",
    icon: Home,
    color: "from-neon-blue to-neon-cyan",
  },
  {
    label: "Upcoming Returns",
    value: "24",
    sub: "Next 7 days",
    icon: RotateCcw,
    color: "from-neon-purple to-neon-pink",
  },
  {
    label: "Overdue Returns",
    value: "8",
    sub: "Action required",
    icon: AlertCircle,
    color: "from-neon-red to-neon-yellow",
  },
];

export function RentalInsights() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Rental Insights</h3>
      <p className="text-sm text-muted-foreground mb-5">Current rental status overview</p>

      <div className="space-y-4">
        {insights.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-xl bg-secondary/50 p-4 transition-all hover:bg-secondary"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
            >
              <item.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
