import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-foreground" />
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices, customers..."
            className="w-64 lg:w-72 bg-secondary border-border pl-9 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div />
    </header>
  );
}
