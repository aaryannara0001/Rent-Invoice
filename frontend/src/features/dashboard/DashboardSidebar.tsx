import {
  LayoutDashboard,
  FileText,
  Quote,
  Users,
  BarChart3,
  Package,
  ChevronLeft,
  Landmark,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/common/NavLink";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Quotes", url: "/quotes", icon: Quote },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Bank Details", url: "/bank-details", icon: Landmark },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Items", url: "/items", icon: Package },
];


export function DashboardSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar/40 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <span className="text-sm font-bold text-white tracking-widest">RF</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">
                RentFlow
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                Management
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-all duration-300 hover:text-white hover:bg-white/5 group relative overflow-hidden"
                      activeClassName="bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-2 border-primary shadow-[inset_4px_0_12px_-4px_rgba(59,130,246,0.3)]"
                    >
                      <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                      {/* Suble glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
