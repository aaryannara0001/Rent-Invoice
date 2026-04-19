import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/useApp";
import { useNavigate } from "react-router-dom";

type Status = "paid" | "pending" | "overdue" | "sent" | "draft";

const statusColors: Record<string, string> = {
  paid: "bg-neon-green/10 text-neon-green border-neon-green/20",
  pending: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20",
  overdue: "bg-neon-red/10 text-neon-red border-neon-red/20",
  sent: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

type SortKey = "amount" | "date";

export function RecentInvoicesTable() {
  const { invoices } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = invoices;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((inv) => 
        inv.invoiceNumber.toLowerCase().includes(q) || 
        inv.customerName.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      list = list.filter((inv) => inv.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      const val = sortKey === "amount" ? a.grandTotal - b.grandTotal : a.invoiceDate.localeCompare(b.invoiceDate);
      return sortAsc ? val : -val;
    });
    return list.slice(0, 10); // Show last 10
  }, [invoices, search, statusFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
          <p className="text-sm text-muted-foreground">Latest invoice activity</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-32 sm:w-48 bg-secondary border-border pl-9 text-sm"
            />
          </div>
          <div className="flex gap-1 rounded-lg bg-secondary p-1 overflow-x-auto max-w-[200px] sm:max-w-none">
            {(["All", "paid", "pending", "overdue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all capitalize ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No invoices found.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 first:pl-0">Invoice</th>
                  <th className="pb-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6">Customer</th>
                  <th className="pb-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 cursor-pointer select-none group" onClick={() => toggleSort("amount")}>
                    <span className="inline-flex items-center gap-1.5 group-hover:text-foreground transition-colors">
                      Amount 
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </span>
                  </th>
                  <th className="pb-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6">Status</th>
                  <th className="pb-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 last:pr-0 cursor-pointer select-none group" onClick={() => toggleSort("date")}>
                    <span className="inline-flex items-center gap-1.5 group-hover:text-foreground transition-colors">
                      Date 
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="group transition-colors hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="py-4 text-sm font-medium text-white px-6 first:pl-0">{inv.invoiceNumber}</td>
                    <td className="py-4 text-sm text-gray-400 px-6">{inv.customerName}</td>
                    <td className="py-4 text-sm font-semibold text-white px-6">₹{inv.grandTotal.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider py-0 px-2 h-5 flex items-center w-fit capitalize ${statusColors[inv.status] || ''}`}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm text-gray-400 px-6 last:pr-0 text-right">{inv.invoiceDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
