import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const monthlyData = [
  { name: "Jan", revenue: 12400, invoices: 84 },
  { name: "Feb", revenue: 15800, invoices: 102 },
  { name: "Mar", revenue: 13200, invoices: 91 },
  { name: "Apr", revenue: 18600, invoices: 120 },
  { name: "May", revenue: 16400, invoices: 108 },
  { name: "Jun", revenue: 21200, invoices: 135 },
  { name: "Jul", revenue: 19800, invoices: 128 },
  { name: "Aug", revenue: 22400, invoices: 142 },
  { name: "Sep", revenue: 20100, invoices: 131 },
  { name: "Oct", revenue: 24800, invoices: 156 },
  { name: "Nov", revenue: 23600, invoices: 149 },
  { name: "Dec", revenue: 26200, invoices: 164 },
];

const weeklyData = [
  { name: "Mon", revenue: 3200, invoices: 18 },
  { name: "Tue", revenue: 4100, invoices: 24 },
  { name: "Wed", revenue: 3800, invoices: 21 },
  { name: "Thu", revenue: 5200, invoices: 32 },
  { name: "Fri", revenue: 4800, invoices: 28 },
  { name: "Sat", revenue: 2100, invoices: 12 },
  { name: "Sun", revenue: 1400, invoices: 8 },
];

const periods = ["Weekly", "Monthly", "Yearly"] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground mt-1">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
          {p.name}: {p.name === "Revenue" ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export function RevenueChart() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("Monthly");
  const data = period === "Weekly" ? weeklyData : monthlyData;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Revenue and invoice trends</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#EC4899" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="invoices"
            name="Invoices"
            stroke="#06B6D4"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#06B6D4", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#06B6D4", stroke: "#0B0F19", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
