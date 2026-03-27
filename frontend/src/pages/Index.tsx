import { TopBar } from "@/features/dashboard/TopBar";
import { StatsCards } from "@/features/dashboard/StatsCards";
import { RevenueChart } from "@/features/dashboard/RevenueChart";
import { PaymentStatusChart } from "@/features/dashboard/PaymentStatusChart";
import { WeeklyActivityChart } from "@/features/dashboard/WeeklyActivityChart";
import { TopCustomersChart } from "@/features/dashboard/TopCustomersChart";
import { RentalInsights } from "@/features/dashboard/RentalInsights";
import { RecentInvoicesTable } from "@/features/dashboard/RecentInvoicesTable";
import MainLayout from "@/layouts/MainLayout";

const Index = () => {
  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto w-full">
          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">Welcome back, <span className="text-primary font-semibold">John</span>. Here's your rental overview.</p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <StatsCards />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="xl:col-span-2">
              <RevenueChart />
            </div>
            <PaymentStatusChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <WeeklyActivityChart />
            <TopCustomersChart />
            <RentalInsights />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <RecentInvoicesTable />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
