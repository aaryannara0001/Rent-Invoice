import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", revenue: 3200, invoices: 18, collections: 2800 },
  { day: "Tue", revenue: 4100, invoices: 24, collections: 3600 },
  { day: "Wed", revenue: 3800, invoices: 21, collections: 3200 },
  { day: "Thu", revenue: 5200, invoices: 32, collections: 4800 },
  { day: "Fri", revenue: 4800, invoices: 28, collections: 4200 },
  { day: "Sat", revenue: 2100, invoices: 12, collections: 1800 },
  { day: "Sun", revenue: 1400, invoices: 8, collections: 1200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground mt-1">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export function WeeklyActivityChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Weekly Activity</h3>
      <p className="text-sm text-muted-foreground mb-6">Daily revenue & collections</p>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
          <defs>
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#3B82F6"
            strokeWidth={2.5}
            fill="url(#revArea)"
          />
          <Area
            type="monotone"
            dataKey="collections"
            name="Collections"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            fill="url(#colArea)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
