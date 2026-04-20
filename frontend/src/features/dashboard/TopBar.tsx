import { Search, Bell, User, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useApp } from "@/context/useApp";

export function TopBar() {
  const { user } = useApp();
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="flex text-muted-foreground hover:text-white transition-colors" />
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices, customers..."
            className="w-64 lg:w-96 bg-white/5 border-white/10 pl-9 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:bg-white/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white hover:bg-white/5">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-black" />
        </Button>
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/profile" className="flex items-center gap-3 pl-2 border-l border-white/10 ml-1 group">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-semibold text-white leading-none group-hover:text-primary transition-colors">{user?.name || 'Aaryan'}</span>
          </div>
          <div className="h-9 w-9 rounded-full p-[1px] bg-gradient-to-tr from-primary/20 to-primary/40 group-hover:from-primary group-hover:to-neon-purple transition-all">
            <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
