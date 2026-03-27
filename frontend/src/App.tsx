import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Invoices from "./pages/Invoices.tsx";
import Quotes from "./pages/Quotes.tsx";
import Customers from "./pages/Customers.tsx";
import CustomerDetail from "./pages/CustomerDetail.tsx";
import CreateInvoice from "./pages/CreateInvoice.tsx";
import CreateQuote from "./pages/CreateQuote.tsx";
import Reports from "./pages/Reports.tsx";
import Items from "./pages/Items.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/:id" element={<CreateInvoice />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/create" element={<CreateQuote />} />
            <Route path="/quotes/:id" element={<CreateQuote />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/items" element={<Items />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
