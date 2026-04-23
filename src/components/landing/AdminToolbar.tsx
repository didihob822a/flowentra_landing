import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Mail, BarChart3, FileText, CreditCard,
  Pencil, PencilOff, LayoutDashboard, ChevronLeft, ChevronRight,
  LogOut, Megaphone, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { useAdminOverlay } from "@/contexts/AdminOverlayContext";
import { useCmsRaw } from "@/contexts/CmsContentContext";
import { toast } from "sonner";
const AdminToolbar = () => {
  const { isAdmin, overlaysEnabled, setOverlaysEnabled, publicPreview, setPublicPreview } = useAdminOverlay();
  const { refresh, loading } = useCmsRaw();
  const [collapsed, setCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Content refreshed");
    }, 600);
  };

  if (!isAdmin) return null;

  const links = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Settings, label: "Settings", path: "/admin?section=__settings" },
    { icon: Mail, label: "Emails", path: "/admin?section=__email" },
    { icon: CreditCard, label: "Pricing", path: "/admin?section=__pricing" },
    { icon: BarChart3, label: "Analytics", path: "/admin?section=__analytics" },
    { icon: Megaphone, label: "Releases", path: "/admin?section=__releases" },
    { icon: FileText, label: "History", path: "/admin?section=__history" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[9999] flex flex-col items-center"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2.5 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={collapsed ? "Expand toolbar" : "Collapse toolbar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="w-full h-px bg-border" />

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Quick links */}
              <div className="p-1.5 space-y-0.5">
                {links.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all group"
                    title={link.label}
                  >
                    <link.icon className="w-3.5 h-3.5 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="truncate">{link.label}</span>
                  </button>
                ))}
              </div>

              <div className="mx-3 h-px bg-border" />

              {/* Overlays toggle */}
              <div className="p-1.5">
                <button
                  onClick={() => setOverlaysEnabled(!overlaysEnabled)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    overlaysEnabled
                      ? "text-primary bg-primary/10 hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  title={overlaysEnabled ? "Disable edit overlays" : "Enable edit overlays"}
                >
                  {overlaysEnabled ? (
                    <Pencil className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <PencilOff className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">{overlaysEnabled ? "Editing ON" : "Editing OFF"}</span>
                </button>

                {/* Public preview toggle */}
                <button
                  onClick={() => {
                    setPublicPreview(!publicPreview);
                    toast.success(!publicPreview ? "Public preview ON" : "Public preview OFF", {
                      description: !publicPreview
                        ? "Hidden sections are now invisible, just like for visitors."
                        : "You can see all sections again.",
                    });
                  }}
                  className={`mt-0.5 flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    publicPreview
                      ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  title={publicPreview ? "Exit public preview" : "Preview as public visitor"}
                >
                  {publicPreview ? (
                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">{publicPreview ? "Public preview" : "Preview public"}</span>
                </button>
              </div>

              <div className="mx-3 h-px bg-border" />

              {/* Refresh CMS content */}
              <div className="p-1.5">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                  title="Refresh content from server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="truncate">Refresh</span>
                </button>
              </div>

              <div className="mx-3 h-px bg-border" />

              {/* Logout */}
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed: just show admin badge */}
        {collapsed && (
          <div className="p-2">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminToolbar;
