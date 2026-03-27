import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Paid", value: 842, color: "#22C55E" },
  { name: "Pending", value: 284, color: "#F59E0B" },
  { name: "Overdue", value: 158, color: "#EF4444" },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{d.name}</p>
      <p className="text-xs text-muted-foreground">{d.value} invoices ({((d.value / total) * 100).toFixed(1)}%)</p>
    </div>
  );
};

export function PaymentStatusChart() {
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
            <Tooltip content={<CustomTooltip />} />
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
