import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
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
          <main className="flex-1 overflow-y-auto relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
