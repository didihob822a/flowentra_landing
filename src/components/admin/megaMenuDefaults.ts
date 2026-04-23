/**
 * Default mega-menu content — mirrors the fallback used in
 * src/components/landing/Navbar.tsx (defaultMegas).
 *
 * Admins use these as a starting template when a menu is empty,
 * so they can see exactly "what's currently shown by default" and
 * customize from there.
 *
 * Keep this file in sync with Navbar.tsx defaultMegas.
 */

import type { MegaConfig } from "./MegaMenuBuilder";

type Lang = "en" | "fr";

const productDefaults = (lang: Lang): MegaConfig => {
  const fr = lang === "fr";
  return {
    tabs: [
      {
        id: "modules",
        label: fr ? "Modules" : "Modules",
        icon: "Layers",
        items: [
          { label: fr ? "Service de terrain" : "Field Service", desc: fr ? "Gérez intelligemment le service sur le terrain." : "Intelligently manage field service.", icon: "Wrench", href: "#features" },
          { label: fr ? "Projet" : "Project", desc: fr ? "Planifiez et exécutez des projets efficacement." : "Plan and execute projects efficiently.", icon: "FolderKanban", href: "#features" },
          { label: fr ? "Bureau / CRM" : "Office / CRM", desc: fr ? "Devis, calculs et factures plus rapidement." : "Quotes, calculations and invoices faster.", icon: "LayoutDashboard", href: "#features" },
          { label: fr ? "Géolocalisation" : "Geolocation", desc: fr ? "Flotte, GPS et carnet de bord." : "Fleet, GPS and logbook.", icon: "MapPin", href: "#features" },
        ],
      },
      {
        id: "features",
        label: fr ? "Caractéristiques" : "Features",
        icon: "CircuitBoard",
        items: [
          { label: fr ? "Intelligence artificielle" : "Artificial Intelligence", desc: fr ? "Automatisez avec l'IA." : "Automate with AI.", icon: "Brain", href: "#features" },
          { label: fr ? "Sécurité" : "Security", desc: fr ? "Protection des données avancée." : "Advanced data protection.", icon: "ShieldCheck", href: "#features" },
          { label: fr ? "Analytique" : "Analytics", desc: fr ? "Tableaux de bord et rapports." : "Dashboards and reports.", icon: "BarChart3", href: "#features" },
        ],
      },
      {
        id: "interfaces",
        label: fr ? "Interfaces" : "Interfaces",
        icon: "Smartphone",
        items: [
          { label: fr ? "Application mobile" : "Mobile App", desc: fr ? "Accès terrain en mobilité." : "Field access on the go.", icon: "Smartphone", href: "#demo" },
          { label: fr ? "Portail client" : "Client Portal", desc: fr ? "Espace client en libre-service." : "Self-service client portal.", icon: "Globe", href: "#demo" },
        ],
      },
    ],
  };
};

const solutionsDefaults = (lang: Lang): MegaConfig => {
  const fr = lang === "fr";
  return {
    tabs: [
      {
        id: "industries",
        label: fr ? "Industries" : "Industries",
        icon: "Building2",
        items: [
          { label: fr ? "Climatisation et réfrigération" : "HVAC & Refrigeration", icon: "Snowflake", href: "#industries" },
          { label: fr ? "Installations électriques" : "Electrical", icon: "Zap", href: "#industries" },
          { label: fr ? "Gestion des installations" : "Facility Management", icon: "Building2", href: "#industries" },
          { label: fr ? "Sécurité et surveillance" : "Security & Surveillance", icon: "Eye", href: "#industries" },
          { label: fr ? "Nettoyage et entretien" : "Cleaning & Maintenance", icon: "SprayCan", href: "#industries" },
          { label: fr ? "Maintenance et SAV" : "Field Service & After-Sales", icon: "Settings2", href: "#industries" },
          { label: fr ? "Solaire et énergies" : "Solar & Energy", icon: "Sun", href: "#industries" },
          { label: fr ? "IT et télécommunications" : "IT & Telecom", icon: "Wifi", href: "#industries" },
        ],
        footer: { label: fr ? "Trouvez votre secteur" : "Find your industry", href: "#industries" },
      },
      {
        id: "applications",
        label: fr ? "Applications" : "Applications",
        icon: "Layers",
        items: [
          { label: "Flowentra CRM/Office", desc: fr ? "Gestion commerciale complète." : "Complete business management.", icon: "LayoutDashboard", href: "#features" },
          { label: "Flowentra Service", desc: fr ? "Gestion des interventions terrain." : "Field intervention management.", icon: "Wrench", href: "#features" },
          { label: "Flowentra Project", desc: fr ? "Pilotage de projets avancé." : "Advanced project management.", icon: "FolderKanban", href: "#features" },
        ],
      },
    ],
  };
};

const resourcesDefaults = (lang: Lang): MegaConfig => {
  const fr = lang === "fr";
  return {
    tabs: [
      {
        id: "learn",
        label: fr ? "Apprendre" : "Learn",
        icon: "BookOpen",
        items: [
          { label: fr ? "Démo interactive" : "Interactive Demo", desc: fr ? "Explorez la plateforme en direct." : "Explore the platform live.", icon: "Play", href: "#demo" },
          { label: fr ? "Tutoriels" : "Tutorials", desc: fr ? "Guides pas à pas." : "Step-by-step guides.", icon: "BookOpen", href: "/documentation", isRoute: true },
          { label: "FAQ", desc: fr ? "Questions fréquentes." : "Frequently asked questions.", icon: "HelpCircle", href: "#faq" },
        ],
      },
      {
        id: "community",
        label: fr ? "Communauté" : "Community",
        icon: "Handshake",
        items: [
          { label: fr ? "Témoignages" : "Testimonials", desc: fr ? "Ce que nos clients disent." : "What our customers say.", icon: "MessageCircle", href: "#testimonials" },
          { label: fr ? "Partenaires" : "Partners", desc: fr ? "Notre réseau de partenaires." : "Our partner network.", icon: "Handshake", href: "/partners", isRoute: true },
          { label: fr ? "Support client" : "Customer Support", desc: fr ? "Nous sommes là pour vous." : "We're here for you.", icon: "HeadphonesIcon", href: "/support", isRoute: true },
        ],
      },
    ],
  };
};

export type MegaMenuKey = "product" | "solutions" | "resources";

/**
 * Returns the default MegaConfig for a given menu and language —
 * EXACTLY matches the fallback shown to visitors when CMS is empty.
 * For unknown languages, falls back to English.
 */
export const getDefaultMegaConfig = (key: MegaMenuKey, lang: string): MegaConfig => {
  const l: Lang = lang === "fr" ? "fr" : "en";
  switch (key) {
    case "product":
      return productDefaults(l);
    case "solutions":
      return solutionsDefaults(l);
    case "resources":
      return resourcesDefaults(l);
  }
};

export const getDefaultMegaJson = (key: MegaMenuKey, lang: string): string =>
  JSON.stringify(getDefaultMegaConfig(key, lang));
