import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Status = "Paid" | "Pending" | "Overdue";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: Status;
  date: string;
}

const invoices: Invoice[] = [
  { id: "INV-001", customer: "Apex Rentals", amount: 4200, status: "Paid", date: "2024-12-15" },
  { id: "INV-002", customer: "Metro Corp", amount: 3150, status: "Pending", date: "2024-12-14" },
  { id: "INV-003", customer: "BlueSky Ltd", amount: 5800, status: "Paid", date: "2024-12-13" },
  { id: "INV-004", customer: "NovaTech", amount: 2400, status: "Overdue", date: "2024-12-10" },
  { id: "INV-005", customer: "Summit Inc", amount: 6100, status: "Paid", date: "2024-12-09" },
  { id: "INV-006", customer: "Greenfield Co", amount: 1850, status: "Pending", date: "2024-12-08" },
  { id: "INV-007", customer: "Peak Holdings", amount: 7200, status: "Paid", date: "2024-12-07" },
  { id: "INV-008", customer: "Urban Lease", amount: 3600, status: "Overdue", date: "2024-12-05" },
];

const statusColors: Record<Status, string> = {
  Paid: "bg-neon-green/10 text-neon-green border-neon-green/20",
  Pending: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20",
  Overdue: "bg-neon-red/10 text-neon-red border-neon-red/20",
};

type SortKey = "amount" | "date";

export function RecentInvoicesTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = invoices;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((inv) => inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q));
    }
    if (statusFilter !== "All") {
      list = list.filter((inv) => inv.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      const val = sortKey === "amount" ? a.amount - b.amount : a.date.localeCompare(b.date);
      return sortAsc ? val : -val;
    });
    return list;
  }, [search, statusFilter, sortKey, sortAsc]);

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
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {(["All", "Paid", "Pending", "Overdue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
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
                <tr key={inv.id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="py-4 text-sm font-medium text-white px-6 first:pl-0">{inv.id}</td>
                  <td className="py-4 text-sm text-gray-400 px-6">{inv.customer}</td>
                  <td className="py-4 text-sm font-semibold text-white px-6">${inv.amount.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider py-0 px-2 h-5 flex items-center w-fit ${statusColors[inv.status]}`}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-sm text-gray-400 px-6 last:pr-0 text-right">{inv.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
