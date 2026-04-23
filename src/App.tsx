import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AdminToolbar from "./components/landing/AdminToolbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminOverlayProvider } from "@/contexts/AdminOverlayContext";
import { CmsContentProvider } from "@/contexts/CmsContentContext";
import { useEffect } from "react";
import PasswordProtect from "./components/PasswordProtect";
import { trackPageView } from "./components/admin/AnalyticsDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Partners from "./pages/Partners";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Documentation from "./pages/Documentation";
import Status from "./pages/Status";
import Integrations from "./pages/Integrations";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SecurityPage from "./pages/SecurityPage";
import ChatAssistant from "./components/ChatAssistant";
import ScrollToTop from "./components/ScrollToTop";
import Releases from "./pages/Releases";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import PricingPage from "./pages/Pricing";
import CustomPage from "./pages/CustomPage";

const queryClient = new QueryClient();

const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
};

const PasswordProtectGate = () => {
  const location = useLocation();
  if (location.pathname === "/admin") {
    return <AppRoutes />;
  }
  return (
    <PasswordProtect>
      <AppRoutes />
    </PasswordProtect>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";

  return (
  <>
    <ScrollToTop />
    <AnalyticsTracker />
    <ChatAssistant />
    {!isAdminRoute && <AdminToolbar />}
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<Support />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/status" element={<Status />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/releases" element={<Releases />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/p/:slug" element={<CustomPage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CmsContentProvider>
          <AdminOverlayProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <PasswordProtectGate />
              </BrowserRouter>
            </TooltipProvider>
          </AdminOverlayProvider>
        </CmsContentProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
