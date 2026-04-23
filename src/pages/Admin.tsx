import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { adminAuth, adminContent, type AdminUser, type CmsSection } from "@/services/adminApi";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SectionEditor from "@/components/admin/SectionEditor";
import AdminHistory from "@/components/admin/AdminHistory";
import PricingManager from "@/components/admin/PricingManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import AdminSettings from "@/components/admin/AdminSettings";
import EmailManager from "@/components/admin/EmailManager";
import ReleasesManager from "@/components/admin/ReleasesManager";
import AdminDocs from "@/components/admin/AdminDocs";
import PagesManager from "@/components/admin/PagesManager";
import FlagIcon from "@/components/FlagIcon";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { LogOut, History, Download, Upload, PanelLeftClose, PanelLeft } from "lucide-react";

const FALLBACK_SECTIONS: CmsSection[] = [
  { section_key: "nav", label: "Navigation", icon: "Navigation", sort_order: 1, is_active: 1 },
  { section_key: "navMega", label: "Nav Mega Menu", icon: "LayoutGrid", sort_order: 1, is_active: 1 },
  { section_key: "hero", label: "Hero Section", icon: "Sparkles", sort_order: 2, is_active: 1 },
  { section_key: "trustedBy", label: "Trusted By", icon: "Building2", sort_order: 3, is_active: 1 },
  { section_key: "features", label: "Features", icon: "Grid3X3", sort_order: 4, is_active: 1 },
  { section_key: "productShowcase", label: "Product Showcase", icon: "Monitor", sort_order: 5, is_active: 1 },
  { section_key: "howItWorks", label: "How It Works", icon: "ListOrdered", sort_order: 6, is_active: 1 },
  { section_key: "demo", label: "Demo Preview", icon: "Play", sort_order: 7, is_active: 1 },
  { section_key: "metrics", label: "Metrics", icon: "BarChart3", sort_order: 8, is_active: 1 },
  { section_key: "industryVerticals", label: "Industry Verticals", icon: "Factory", sort_order: 9, is_active: 1 },
  { section_key: "integrations", label: "Integrations", icon: "Plug", sort_order: 10, is_active: 1 },
  { section_key: "pricing", label: "Pricing", icon: "CreditCard", sort_order: 11, is_active: 1 },
  { section_key: "comparisonTable", label: "Comparison Table", icon: "Table", sort_order: 12, is_active: 1 },
  { section_key: "testimonials", label: "Testimonials", icon: "MessageSquareQuote", sort_order: 13, is_active: 1 },
  { section_key: "faq", label: "FAQ", icon: "HelpCircle", sort_order: 14, is_active: 1 },
  { section_key: "contact", label: "Contact Section", icon: "Mail", sort_order: 15, is_active: 1 },
  { section_key: "ctaBanner", label: "CTA Banner", icon: "Megaphone", sort_order: 16, is_active: 1 },
  { section_key: "footer", label: "Footer", icon: "PanelBottom", sort_order: 17, is_active: 1 },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

// Special admin views (not CMS sections)
const SPECIAL_VIEWS = ["__pricing", "__analytics", "__settings", "__history", "__email", "__releases", "__docs", "__pages"];

const Admin = () => {
  const [searchParams] = useSearchParams();
  const hardcodedUser: AdminUser = { id: 1, email: 'admin@flowentra.io', name: 'Admin', role: 'super_admin' };
  const [user, setUser] = useState<AdminUser | null>(hardcodedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>(searchParams.get("section") || "");
  const [activeLang, setActiveLang] = useState<string>("en");
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-authenticate on mount
  useEffect(() => {
    localStorage.setItem('admin_user', JSON.stringify(hardcodedUser));
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadSections();
  }, [isAuthenticated]);

  const loadSections = async () => {
    try {
      const data = await adminContent.getSections();
      setSections(data);
      if (data.length > 0 && !activeSection) setActiveSection(data[0].section_key);
    } catch {
      setSections(FALLBACK_SECTIONS);
      if (!activeSection) setActiveSection(FALLBACK_SECTIONS[0].section_key);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await adminAuth.login(email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        toast.success("Welcome back, " + result.user.name);
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminAuth.logout();
    setUser(null);
    setIsAuthenticated(false);
    setActiveSection("");
    toast.success("Logged out");
  };

  const handleExport = async () => {
    try {
      const data = await adminContent.exportContent();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowentra-content-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Content exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        await adminContent.importContent(json.data || json);
        toast.success("Content imported successfully");
      } catch {
        toast.error("Import failed");
      }
    };
    input.click();
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} loading={loading} />;
  }

  const isSpecialView = SPECIAL_VIEWS.includes(activeSection);
  const currentLabel = activeSection === "__pricing" ? "Pricing & Invoices"
    : activeSection === "__email" ? "Email Manager"
    : activeSection === "__releases" ? "Release Notes"
    : activeSection === "__analytics" ? "Analytics"
    : activeSection === "__settings" ? "Site Settings"
    : activeSection === "__history" ? "Change History"
    : activeSection === "__docs" ? "Documentation"
    : activeSection === "__pages" ? "Pages"
    : sections.find(s => s.section_key === activeSection)?.label || "Admin";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Toaster position="top-right" />

      {/* Sidebar */}
      {!sidebarCollapsed && (
        <AdminSidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={(key) => setActiveSection(key)}
          user={user}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-sm font-bold text-foreground truncate">{currentLabel}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selector — only for CMS sections */}
            {!isSpecialView && (
              <>
                <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLang(lang.code)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        activeLang === lang.code
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FlagIcon country={lang.code} className="w-4 h-3" />
                      {lang.label}
                    </button>
                  ))}
                </div>
                <div className="w-px h-6 bg-border mx-1" />
              </>
            )}

            <button
              onClick={() => setActiveSection("__history")}
              className={`p-1.5 rounded-lg transition-colors ${activeSection === "__history" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              title="Change History"
            >
              <History className="w-4 h-4" />
            </button>
            <button onClick={handleExport} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Export Content">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={handleImport} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Import Content">
              <Upload className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-foreground hidden sm:inline">{user?.name}</span>
            </div>

            <button onClick={handleLogout} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {activeSection === "__docs" ? (
            <AdminDocs onJumpToSection={(key) => setActiveSection(key)} />
          ) : activeSection === "__pages" ? (
            <PagesManager />
          ) : activeSection === "__pricing" ? (
            <PricingManager />
          ) : activeSection === "__releases" ? (
            <ReleasesManager />
          ) : activeSection === "__email" ? (
            <EmailManager />
          ) : activeSection === "__analytics" ? (
            <AnalyticsDashboard />
          ) : activeSection === "__settings" ? (
            <AdminSettings />
          ) : activeSection === "__history" ? (
            <AdminHistory section="" />
          ) : (
            <SectionEditor
              sectionKey={activeSection}
              lang={activeLang}
              allLanguages={LANGUAGES}
              onLangChange={setActiveLang}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
