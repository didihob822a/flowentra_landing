import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { languages } from "@/lib/i18n";
import logo from "@/assets/flowentra-logo.png";
import {
  Menu, X, ChevronDown, ChevronRight, Layers,
  Wrench, FolderKanban, LayoutDashboard,
  MapPin, Brain, ShieldCheck, BarChart3,
  Smartphone, Globe,
  Snowflake, Zap, Building2, Eye, SprayCan, Settings2, Sun, Wifi,
  CircuitBoard,
  Play, HelpCircle, BookOpen, MessageCircle, Handshake, HeadphonesIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/components/FlagIcon";
import { Link, useLocation } from "react-router-dom";
import { MEGA_ICONS } from "@/components/admin/megaMenuIcons";

// ── Icon registry: maps a string name (from CMS JSON) to a Lucide component ──
const resolveIcon = (name: string | undefined, fallback: React.ElementType = Layers): React.ElementType =>
  (name && MEGA_ICONS[name]) || fallback;

// ── Types ──
interface TabItem {
  label: string;
  desc?: string;
  href: string;
  isRoute?: boolean;
  icon: React.ElementType;
}
interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  items: TabItem[];
  footer?: { label: string; href: string };
}
interface MegaConfig {
  tabs: Tab[];
}

// CMS-shape (icons as strings)
interface RawTabItem { label: string; desc?: string; href: string; isRoute?: boolean; icon?: string }
interface RawTab { id: string; label: string; icon?: string; items: RawTabItem[]; footer?: { label: string; href: string } }
interface RawMega { tabs: RawTab[] }

const hydrateMega = (raw: RawMega | undefined, fallback: MegaConfig): MegaConfig => {
  if (!raw || !Array.isArray(raw.tabs) || raw.tabs.length === 0) return fallback;
  return {
    tabs: raw.tabs.map((t, i) => ({
      id: t.id || `tab-${i}`,
      label: t.label || "",
      icon: resolveIcon(t.icon, fallback.tabs[i]?.icon || Layers),
      items: (t.items || []).map((it) => ({
        label: it.label || "",
        desc: it.desc,
        href: it.href || "#",
        isRoute: !!it.isRoute,
        icon: resolveIcon(it.icon, Layers),
      })),
      footer: t.footer,
    })),
  };
};

const Navbar = () => {
  const { lang, setLang, tr } = useLanguage();
  const navCmsDefaults = {
    features: tr.nav.features,
    pricing: tr.nav.pricing,
    demo: tr.nav.demo,
    testimonials: tr.nav.testimonials,
    faq: tr.nav.faq,
    cta: tr.nav.cta,
    signup: (tr.nav as any).signup || tr.nav.cta,
  };
  const navCms = useCmsSection("nav", lang, navCmsDefaults as Record<string, any>) as Record<string, any>;
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDarkHero = isHome && !scrolled;
  const fr = lang === "fr";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ── Default Mega Menu Data (used as fallback when CMS is empty/invalid) ──
  const defaultMegas: Record<string, MegaConfig> = {
    product: {
      tabs: [
        {
          id: "modules",
          label: fr ? "Modules" : "Modules",
          icon: Layers,
          items: [
            { label: fr ? "Service de terrain" : "Field Service", desc: fr ? "Gérez intelligemment le service sur le terrain." : "Intelligently manage field service.", icon: Wrench, href: "#features" },
            { label: fr ? "Projet" : "Project", desc: fr ? "Planifiez et exécutez des projets efficacement." : "Plan and execute projects efficiently.", icon: FolderKanban, href: "#features" },
            { label: fr ? "Bureau / CRM" : "Office / CRM", desc: fr ? "Devis, calculs et factures plus rapidement." : "Quotes, calculations and invoices faster.", icon: LayoutDashboard, href: "#features" },
            { label: fr ? "Géolocalisation" : "Geolocation", desc: fr ? "Flotte, GPS et carnet de bord." : "Fleet, GPS and logbook.", icon: MapPin, href: "#features" },
          ],
        },
        {
          id: "features",
          label: fr ? "Caractéristiques" : "Features",
          icon: CircuitBoard,
          items: [
            { label: fr ? "Intelligence artificielle" : "Artificial Intelligence", desc: fr ? "Automatisez avec l'IA." : "Automate with AI.", icon: Brain, href: "#features" },
            { label: fr ? "Sécurité" : "Security", desc: fr ? "Protection des données avancée." : "Advanced data protection.", icon: ShieldCheck, href: "#features" },
            { label: fr ? "Analytique" : "Analytics", desc: fr ? "Tableaux de bord et rapports." : "Dashboards and reports.", icon: BarChart3, href: "#features" },
          ],
        },
        {
          id: "interfaces",
          label: fr ? "Interfaces" : "Interfaces",
          icon: Smartphone,
          items: [
            { label: fr ? "Application mobile" : "Mobile App", desc: fr ? "Accès terrain en mobilité." : "Field access on the go.", icon: Smartphone, href: "#demo" },
            { label: fr ? "Portail client" : "Client Portal", desc: fr ? "Espace client en libre-service." : "Self-service client portal.", icon: Globe, href: "#demo" },
          ],
        },
      ],
    },
    solutions: {
      tabs: [
        {
          id: "industries",
          label: fr ? "Industries" : "Industries",
          icon: Building2,
          items: [
            { label: fr ? "Climatisation et réfrigération" : "HVAC & Refrigeration", icon: Snowflake, href: "#industries" },
            { label: fr ? "Installations électriques" : "Electrical", icon: Zap, href: "#industries" },
            { label: fr ? "Gestion des installations" : "Facility Management", icon: Building2, href: "#industries" },
            { label: fr ? "Sécurité et surveillance" : "Security & Surveillance", icon: Eye, href: "#industries" },
            { label: fr ? "Nettoyage et entretien" : "Cleaning & Maintenance", icon: SprayCan, href: "#industries" },
            { label: fr ? "Maintenance et SAV" : "Field Service & After-Sales", icon: Settings2, href: "#industries" },
            { label: fr ? "Solaire et énergies" : "Solar & Energy", icon: Sun, href: "#industries" },
            { label: fr ? "IT et télécommunications" : "IT & Telecom", icon: Wifi, href: "#industries" },
          ],
          footer: { label: fr ? "Trouvez votre secteur" : "Find your industry", href: "#industries" },
        },
        {
          id: "applications",
          label: fr ? "Applications" : "Applications",
          icon: Layers,
          items: [
            { label: "Flowentra CRM/Office", desc: fr ? "Gestion commerciale complète." : "Complete business management.", icon: LayoutDashboard, href: "#features" },
            { label: "Flowentra Service", desc: fr ? "Gestion des interventions terrain." : "Field intervention management.", icon: Wrench, href: "#features" },
            { label: "Flowentra Project", desc: fr ? "Pilotage de projets avancé." : "Advanced project management.", icon: FolderKanban, href: "#features" },
          ],
        },
      ],
    },
    resources: {
      tabs: [
        {
          id: "learn",
          label: fr ? "Apprendre" : "Learn",
          icon: BookOpen,
          items: [
            { label: fr ? "Démo interactive" : "Interactive Demo", desc: fr ? "Explorez la plateforme en direct." : "Explore the platform live.", icon: Play, href: "#demo" },
            { label: fr ? "Tutoriels" : "Tutorials", desc: fr ? "Guides pas à pas." : "Step-by-step guides.", icon: BookOpen, href: "/documentation", isRoute: true },
            { label: "FAQ", desc: fr ? "Questions fréquentes." : "Frequently asked questions.", icon: HelpCircle, href: "#faq" },
          ],
        },
        {
          id: "community",
          label: fr ? "Communauté" : "Community",
          icon: Handshake,
          items: [
            { label: fr ? "Témoignages" : "Testimonials", desc: fr ? "Ce que nos clients disent." : "What our customers say.", icon: MessageCircle, href: "#testimonials" },
            { label: fr ? "Partenaires" : "Partners", desc: fr ? "Notre réseau de partenaires." : "Our partner network.", icon: Handshake, href: "/partners", isRoute: true },
            { label: fr ? "Support client" : "Customer Support", desc: fr ? "Nous sommes là pour vous." : "We're here for you.", icon: HeadphonesIcon, href: "/support", isRoute: true },
          ],
        },
      ],
    },
  };

  // ── Pull live mega-menu config from CMS ──
  const navMegaDefaults = {
    productLabel: fr ? "Produit" : "Product",
    solutionsLabel: fr ? "Solutions" : "Solutions",
    resourcesLabel: fr ? "Ressources" : "Resources",
  };
  const navMegaCms = useCmsSection("navMega", lang, navMegaDefaults as Record<string, any>) as Record<string, any>;

  const megas: Record<string, MegaConfig> = {
    product: hydrateMega(navMegaCms.product as RawMega | undefined, defaultMegas.product),
    solutions: hydrateMega(navMegaCms.solutions as RawMega | undefined, defaultMegas.solutions),
    resources: hydrateMega(navMegaCms.resources as RawMega | undefined, defaultMegas.resources),
  };

  // Custom links from CMS — admins can append { label, href } pairs to nav.customLinks (JSON).
  const customLinks: Array<{ label: string; href: string }> = Array.isArray(navCms.customLinks) ? navCms.customLinks : [];

  const navItems = [
    { label: navMegaCms.productLabel || navMegaDefaults.productLabel, id: "product", hasMega: true },
    { label: navMegaCms.solutionsLabel || navMegaDefaults.solutionsLabel, id: "solutions", hasMega: true },
    { label: navMegaCms.resourcesLabel || navMegaDefaults.resourcesLabel, id: "resources", hasMega: true },
    { label: navCms.pricing || (fr ? "Prix" : "Pricing"), id: "pricing", href: "/pricing", isRoute: true },
    ...customLinks.map((c, i) => ({ label: c.label, id: `custom_${i}`, href: c.href, isRoute: c.href.startsWith("/") })),
    { label: navCms.contact || "Contact", id: "contact", href: "#contact" },
  ];

  const handleMenuEnter = (id: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(id);
    const mega = megas[id];
    if (mega?.tabs?.length) setActiveTab(mega.tabs[0].id);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveTab(null);
    }, 180);
  };

  const closeMenu = () => { setActiveMenu(null); setActiveTab(null); };

  const currentLang = languages.find((l) => l.code === lang)!;

  // ── Unified Mega Panel ──
  const renderMegaPanel = (menuId: string) => {
    const mega = megas[menuId];
    if (!mega) return null;
    const currentTab = mega.tabs.find(t => t.id === activeTab) || mega.tabs[0];

    return (
      <div className="flex">
        {/* Left sidebar */}
        <div className="w-[220px] shrink-0 border-r border-border bg-muted/20 p-3 flex flex-col gap-0.5">
          {mega.tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onMouseEnter={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                  isActive
                    ? "bg-primary/8 text-primary border border-primary/12"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="flex-1 text-left">{tab.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "translate-x-0.5" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Right content */}
        <div className="flex-1 p-5">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-1">
            {currentTab.items.map((item, i) => {
              const Icon = item.icon;
              const inner = (
                <div className="flex items-start gap-3.5 px-4 py-3.5 rounded-xl hover:bg-muted/40 transition-colors group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-foreground leading-tight">{item.label}</div>
                    {item.desc && (
                      <div className="text-[12px] text-muted-foreground mt-1 leading-snug">{item.desc}</div>
                    )}
                  </div>
                </div>
              );
              if (item.isRoute) {
                return <Link key={i} to={item.href} onClick={closeMenu}>{inner}</Link>;
              }
              return <a key={i} href={item.href} onClick={closeMenu}>{inner}</a>;
            })}
          </div>

          {currentTab.footer && (
            <a
              href={currentTab.footer.href}
              onClick={closeMenu}
              className="mt-4 mx-2 block text-center py-3 rounded-xl border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
            >
              {currentTab.footer.label}
            </a>
          )}
        </div>
      </div>
    );
  };

  // ── Mobile data ──
  const mobileMenuData = Object.entries(megas).map(([, mega]) => ({
    label: mega.tabs[0]?.label || "",
    children: mega.tabs.flatMap(t => [
      { label: t.label, isHeader: true },
      ...t.items.map(i => ({ label: i.label, href: i.href, isRoute: i.isRoute })),
    ]),
  }));
  // Fix labels
  mobileMenuData[0].label = fr ? "Produit" : "Product";
  mobileMenuData[1].label = fr ? "Solutions" : "Solutions";
  mobileMenuData[2].label = fr ? "Ressources" : "Resources";
  mobileMenuData.push(
    { label: fr ? "Prix" : "Pricing", children: undefined as any },
    { label: "Contact", children: undefined as any },
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isHome ? "bg-card/95 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center h-14 sm:h-16 px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center shrink-0 w-[140px] sm:w-[180px]">
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="relative">
             <img 
  src={logo} 
  alt="Flowentra" 
  className="h-10 sm:h-12 transition-all duration-300 opacity-0 absolute inset-0"
/>
<img 
  src={logo} 
  alt="Flowentra" 
  className="h-10 sm:h-12 transition-all duration-300 brightness-0 hue-rotate-[190deg]"
  style={{ filter: 'brightness(0.8) sepia(1) hue-rotate(170deg) saturate(3)' }}
/>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
          {navItems.map((item) => (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => item.hasMega ? handleMenuEnter(item.id) : undefined}
              onMouseLeave={item.hasMega ? handleMenuLeave : undefined}
            >
              <a
                href={item.href || "#"}
                onClick={(e) => { if (item.hasMega) e.preventDefault(); }}
                className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-md transition-all ${
                  isDarkHero
                    ? 'text-primary hover:text-primary/80 hover:bg-primary/10'
                    : 'text-primary hover:text-primary/80 hover:bg-primary/10'
                } ${activeMenu === item.id ? (isDarkHero ? 'text-primary bg-primary/10' : 'text-primary bg-primary/10') : ''}`}
              >
                {item.label}
                {item.hasMega && (
                  <ChevronDown className={`w-3.5 h-3.5 text-primary transition-transform ${activeMenu === item.id ? 'rotate-180' : ''}`} />
                )}
              </a>

              {/* Full-width mega dropdown */}
              <AnimatePresence>
                {item.hasMega && activeMenu === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="fixed left-0 right-0 top-14 sm:top-16 z-50"
                    onMouseEnter={() => handleMenuEnter(item.id)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="border-b border-border bg-card shadow-lg">
                      <div className="container mx-auto px-4 lg:px-8">
                        {renderMegaPanel(item.id)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center justify-end gap-2 w-[220px]">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-all ${isDarkHero ? 'text-primary hover:text-primary/80 hover:bg-primary/10' : 'text-primary hover:text-primary/80 hover:bg-primary/10'}`}
            >
              <FlagIcon country={currentLang.country} className="w-5 h-auto" />
              <ChevronDown className={`w-3 h-3 text-primary transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${l.code === lang ? "bg-primary/5 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                    >
                      <FlagIcon country={l.country} className="w-5 h-auto" />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`w-px h-5 ${isDarkHero ? 'bg-primary/30' : 'bg-primary/30'}`} />

          <a href="#features" className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 ${isDarkHero ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
            {navCms.discover || (fr ? "Découvrir" : "Discover")}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`lg:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg transition-colors relative z-50 ${isDarkHero ? 'hover:bg-primary/10 text-primary' : 'hover:bg-primary/10 text-primary'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-14 bg-white backdrop-blur-xl z-40 overflow-y-auto"
          >
            <div className="px-5 py-6 space-y-1">
              {mobileMenuData.map((item, i) => (
                <div key={i}>
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      if (item.children) {
                        setMobileExpanded(mobileExpanded === item.label ? null : item.label);
                      } else {
                        setMobileOpen(false);
                      }
                    }}
                    className="w-full flex items-center justify-between text-base font-semibold text-foreground py-3.5 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    {item.children ? item.label : (
                      <a href={item.label === "Contact" ? "#contact" : "/pricing"} onClick={() => setMobileOpen(false)} className="w-full text-left">{item.label}</a>
                    )}
                    {item.children && <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />}
                  </motion.button>

                  <AnimatePresence>
                    {item.children && mobileExpanded === item.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4"
                      >
                        {item.children.map((child: any, ci: number) => {
                          if (child.isHeader) {
                            return (
                              <div key={ci} className="px-4 pt-3 pb-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                {child.label}
                              </div>
                            );
                          }
                          if (child.isRoute) {
                            return (
                              <Link key={ci} to={child.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                                {child.label}
                              </Link>
                            );
                          }
                          return (
                            <a key={ci} href={child.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                              {child.label}
                            </a>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="pt-4 mt-3 border-t border-border">
                <p className="text-[10px] font-semibold text-muted-foreground/50 tracking-widest uppercase px-4 mb-2">
                  {navCms.languageLabel || (fr ? "Langue" : "Language")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setMobileOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${l.code === lang ? "bg-primary/8 text-primary font-semibold border border-primary/15" : "text-muted-foreground hover:bg-muted/50 border border-transparent"}`}
                    >
                      <FlagIcon country={l.country} className="w-5 h-auto" />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <a href="#demo" onClick={() => setMobileOpen(false)} className="block text-center px-5 py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  {navCms.requestDemo || navCms.cta || (fr ? "Demander une démo" : "Request Demo")}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
