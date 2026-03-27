import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const data = [
  { name: "Apex Rentals", revenue: 28400 },
  { name: "Metro Corp", revenue: 22100 },
  { name: "BlueSky Ltd", revenue: 18600 },
  { name: "NovaTech", revenue: 15200 },
  { name: "Summit Inc", revenue: 12800 },
];

const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#22C55E"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
      <p className="text-xs text-muted-foreground">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export function TopCustomersChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Top Customers</h3>
      <p className="text-sm text-muted-foreground mb-6">By revenue contribution</p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
          <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
