import { type CmsSection, type AdminUser } from "@/services/adminApi";
import logo from "@/assets/flowentra-logo.png";
import {
  Navigation, Sparkles, Building2, Grid3X3, Monitor, ListOrdered,
  BarChart3, Factory, Plug, CreditCard, Table, MessageSquareQuote,
  HelpCircle, Mail, Megaphone, PanelBottom, FileText, Play, type LucideIcon,
  ChevronDown, Eye, LayoutDashboard, Receipt, Activity, Settings, Tag, BookOpen, Layers,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  Navigation, Sparkles, Building2, Grid3X3, Monitor, ListOrdered,
  BarChart3, Factory, Plug, CreditCard, Table, MessageSquareQuote,
  HelpCircle, Mail, Megaphone, PanelBottom, FileText, Play,
};

// Group sections logically so admins understand the page structure
const sectionGroups: { label: string; icon: LucideIcon; keys: string[] }[] = [
  {
    label: "Header & Navigation",
    icon: Navigation,
    keys: ["nav", "navMega", "hero"],
  },
  {
    label: "Social Proof",
    icon: Building2,
    keys: ["trustedBy", "testimonials", "metrics"],
  },
  {
    label: "Product & Features",
    icon: Grid3X3,
    keys: ["features", "productShowcase", "howItWorks", "demo", "industryVerticals", "integrations"],
  },
  {
    label: "Conversion",
    icon: CreditCard,
    keys: ["pricing", "comparisonTable", "ctaBanner"],
  },
  {
    label: "Support & Footer",
    icon: Mail,
    keys: ["faq", "contact", "footer"],
  },
];

// Admin-only panels (not CMS content sections)
const adminPanels: { key: string; label: string; desc: string; icon: LucideIcon }[] = [
  { key: "__docs", label: "Documentation", desc: "How to use this admin panel", icon: BookOpen },
  { key: "__pages", label: "Pages", desc: "Build & manage custom pages", icon: Layers },
  { key: "__pricing", label: "Pricing & Invoices", desc: "Plans, invoices, billing", icon: Receipt },
  { key: "__email", label: "Email Manager", desc: "SMTP, campaigns, templates", icon: Mail },
  { key: "__analytics", label: "Analytics", desc: "Visitor stats, page views", icon: Activity },
  { key: "__releases", label: "Release Notes", desc: "Version notes, changelog", icon: Tag },
  { key: "__settings", label: "Site Settings", desc: "Password, maintenance, meta", icon: Settings },
];

// Short descriptions for each section
const sectionDescriptions: Record<string, string> = {
  nav: "Menu links, CTA buttons",
  navMega: "Mega-menu dropdowns (Product/Solutions/Resources)",
  hero: "Main headline, images, CTAs",
  trustedBy: "Company logos & title",
  features: "Feature cards & descriptions",
  productShowcase: "Product screenshots & highlights",
  howItWorks: "Step-by-step process",
  demo: "Interactive workflow & analytics demo",
  metrics: "Key statistics & numbers",
  industryVerticals: "Target industry cards",
  integrations: "Third-party integrations",
  pricing: "Plans, prices & features",
  comparisonTable: "Feature comparison grid",
  testimonials: "Customer quotes & reviews",
  faq: "Common questions & answers",
  contact: "Contact info & form labels",
  ctaBanner: "Call-to-action banner",
  footer: "Footer links, copyright, socials",
};

interface Props {
  sections: CmsSection[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  user: AdminUser | null;
}

const AdminSidebar = ({ sections, activeSection, onSectionChange }: Props) => {
  const sectionMap = new Map(sections.map(s => [s.section_key, s]));
  
  // Auto-open the group containing the active section
  const activeGroupIdx = sectionGroups.findIndex(g => g.keys.includes(activeSection));
  const [openGroups, setOpenGroups] = useState<Set<number>>(
    new Set(activeGroupIdx >= 0 ? [activeGroupIdx] : [0])
  );

  const toggleGroup = (idx: number) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border gap-2">
        <img src={logo} alt="Flowentra" className="h-7" />
        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">CMS</span>
      </div>

      {/* Overview Link */}
      <div className="px-3 pt-4 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          View Live Site →
        </a>
      </div>

      {/* Grouped Page Sections FIRST */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 pt-2">
        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2 mt-1">
          Page Sections
        </p>

        {sectionGroups.map((group, gIdx) => {
          const isOpen = openGroups.has(gIdx);
          const GroupIcon = group.icon;
          const hasActive = group.keys.includes(activeSection);

          return (
            <div key={gIdx} className="mb-1">
              <button
                onClick={() => toggleGroup(gIdx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  hasActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
              </button>

              {isOpen && (
                <div className="ml-3 pl-3 border-l border-border/50 mt-0.5 space-y-0.5">
                  {group.keys.map(key => {
                    const section = sectionMap.get(key);
                    if (!section) return null;
                    const Icon = iconMap[section.icon] || FileText;
                    const isActive = activeSection === key;

                    return (
                      <button
                        key={key}
                        onClick={() => onSectionChange(key)}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all group ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-xs font-medium block truncate">{section.label}</span>
                          <span className={`text-[10px] block truncate ${
                            isActive ? "text-primary/60" : "text-muted-foreground/50 group-hover:text-muted-foreground/70"
                          }`}>
                            {sectionDescriptions[key] || "Edit content"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="mx-0 my-2 border-t border-border/50" />

        {/* Admin Tools AFTER */}
        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2 mt-1">
          Admin Tools
        </p>
        {adminPanels.map(panel => {
          const isActive = activeSection === panel.key;
          return (
            <button
              key={panel.key}
              onClick={() => onSectionChange(panel.key)}
              className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all group mb-0.5 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <panel.icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-medium block truncate">{panel.label}</span>
                <span className={`text-[10px] block truncate ${
                  isActive ? "text-primary/60" : "text-muted-foreground/50 group-hover:text-muted-foreground/70"
                }`}>
                  {panel.desc}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
          <LayoutDashboard className="w-3 h-3" />
          <span>Flowentra CMS v1.0</span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
