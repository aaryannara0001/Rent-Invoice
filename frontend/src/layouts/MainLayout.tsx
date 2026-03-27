import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full mesh-gradient text-foreground transition-colors duration-500">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background/30 backdrop-blur-[2px]">
          {/* Mobile Header with Sidebar Trigger */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
            <SidebarTrigger className="bg-[#111827] border-[#1F2937] text-gray-300 hover:bg-[#1F2937] hover:text-white" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <span className="text-xs font-bold text-white">RF</span>
              </div>
              <span className="text-sm font-bold text-white">RentFlow</span>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
