import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApp } from "@/context/useApp";

const CustomTooltip = ({ active, payload, total }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{d.name}</p>
      <p className="text-xs text-muted-foreground">{d.value} invoices ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</p>
    </div>
  );
};

export function PaymentStatusChart() {
  const { getInvoiceStats } = useApp();
  const stats = getInvoiceStats();

  const data = [
    { name: "Paid", value: stats.paid, color: "#22C55E" },
    { name: "Pending", value: stats.pending, color: "#F59E0B" },
    { name: "Overdue", value: stats.overdue, color: "#EF4444" },
  ];

  const total = stats.total;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Payment Status</h3>
      <p className="text-sm text-muted-foreground mb-4">Invoice payment breakdown</p>

      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
