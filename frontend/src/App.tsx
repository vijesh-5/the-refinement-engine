import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BlogCreator from "./pages/BlogCreator";
import AdCopywriter from "./pages/AdCopywriter";
import ProductDescriptions from "./pages/ProductDescriptions";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import Templates from "./pages/Templates";
import BrandProfiles from "./pages/BrandProfiles";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/blog" element={<BlogCreator />} />
            <Route path="/app/ads" element={<AdCopywriter />} />
            <Route path="/app/products" element={<ProductDescriptions />} />
            <Route path="/app/content" element={<Library />} />
            <Route path="/app/templates" element={<Templates />} />
            <Route path="/app/brands" element={<BrandProfiles />} />
            <Route path="/app/competitors" element={<CompetitorAnalysis />} />
            <Route path="/app/settings" element={<Settings />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
