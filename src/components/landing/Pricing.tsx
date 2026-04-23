import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";

const BASE_PRICE_PER_USER = { basic: 29, professional: 39, enterprise: 55 };
const BASE_USERS = 5;

const pricingData = {
  fr: {
    title: "Tarification simple et transparente",
    subtitle: "Choisissez le plan adapté à la taille de votre entreprise et à vos ambitions",
    plans: [
      {
        name: "Basic",
        pricePerUser: BASE_PRICE_PER_USER.basic,
        tagline: "Pour les petites entreprises qui veulent se développer.",
        toolsTitle: "OUTILS DE CROISSANCE",
        tools: [
          "Limité à 5 utilisateurs",
          "Checklists avec 30 étapes par ordre",
          "Planification & optimisation des itinéraires",
          "Application mobile",
          "Saisie des temps",
          "Rapports",
          "Gestion des commandes",
        ],
        serviceTitle: "NOTRE SERVICE",
        services: ["Configuration du compte", "Support par email", "Tutoriels vidéo premium"],
      },
      {
        name: "Professional",
        pricePerUser: BASE_PRICE_PER_USER.professional,
        tagline: "Pour les entreprises qui veulent travailler efficacement et digitalement.",
        popular: true,
        toolsTitle: "LOGICIEL POUR VISIONNAIRES",
        tools: [
          `${BASE_PRICE_PER_USER.professional} TND par utilisateur / mois`,
          "Planificateur de maintenance",
          "Base de données & historique des installations",
          "Branding personnalisé",
          "Notification client automatique",
        ],
        extraLabel: "BASIC PLUS :",
        serviceTitle: "NOTRE SERVICE",
        services: ["Configuration du compte", "Conseil en processus", "Support par email", "Tutoriels vidéo premium"],
      },
      {
        name: "Entreprise",
        pricePerUser: BASE_PRICE_PER_USER.enterprise,
        tagline: "Pour les entreprises à la pointe de la technologie.",
        toolsTitle: "TECHNOLOGIE POUR LEADERS",
        tools: [
          `${BASE_PRICE_PER_USER.enterprise} TND par utilisateur / mois`,
          "Checklists avec 120 étapes par ordre",
          "Planification & optimisation IA des itinéraires",
          "Planification client automatique (IA)",
          "Single Sign-on",
        ],
        extraLabel: "PROFESSIONAL PLUS :",
        serviceTitle: "NOTRE SERVICE",
        services: ["Configuration du compte", "Conseil en processus", "Support par email", "Tutoriels vidéo premium"],
      },
    ],
    currency: "TND",
    monthly: "/ mois",
    perUser: "par utilisateur / mois",
    yourUsers: "Vos utilisateurs",
    calculatePrice: "CALCULER LE PRIX :",
    cta: "Contacter les ventes",
    popular: "Recommandé",
    aiLabel: "Avec IA",
    allFeatures: "Toutes les fonctionnalités",
  },
  en: {
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the plan that fits your business size and ambitions",
    plans: [
      {
        name: "Basic",
        pricePerUser: BASE_PRICE_PER_USER.basic,
        tagline: "For small businesses that want to grow.",
        toolsTitle: "TOOLS TO GROW",
        tools: [
          "Limited to 5 users",
          "Checklists with 30 steps per order",
          "Scheduling & route optimization",
          "Mobile app",
          "Time tracking",
          "Reports",
          "Order management",
        ],
        serviceTitle: "OUR SERVICE",
        services: ["Account setup", "Email support", "Premium video tutorials"],
      },
      {
        name: "Professional",
        pricePerUser: BASE_PRICE_PER_USER.professional,
        tagline: "For businesses that want to work efficiently and digitally.",
        popular: true,
        toolsTitle: "SOFTWARE FOR VISIONARIES",
        tools: [
          `${BASE_PRICE_PER_USER.professional} TND per user / month`,
          "Maintenance planner",
          "Asset database & history",
          "Custom branding",
          "Automatic client notifications",
        ],
        extraLabel: "BASIC PLUS:",
        serviceTitle: "OUR SERVICE",
        services: ["Account setup", "Process consulting", "Email support", "Premium video tutorials"],
      },
      {
        name: "Enterprise",
        pricePerUser: BASE_PRICE_PER_USER.enterprise,
        tagline: "For businesses at the cutting edge of technology.",
        toolsTitle: "TECHNOLOGY FOR LEADERS",
        tools: [
          `${BASE_PRICE_PER_USER.enterprise} TND per user / month`,
          "Checklists with 120 steps per order",
          "AI scheduling & route optimization",
          "Automatic client scheduling (AI)",
          "Single Sign-on",
        ],
        extraLabel: "PROFESSIONAL PLUS:",
        serviceTitle: "OUR SERVICE",
        services: ["Account setup", "Process consulting", "Email support", "Premium video tutorials"],
      },
    ],
    currency: "TND",
    monthly: "/ month",
    perUser: "per user / month",
    yourUsers: "Your users",
    calculatePrice: "CALCULATE PRICE:",
    cta: "Contact Sales",
    popular: "Recommended",
    aiLabel: "With AI",
    allFeatures: "All features",
  },
};

const Pricing = () => {
  const { lang } = useLanguage();
  const hardcoded = pricingData[lang as keyof typeof pricingData] || pricingData.en;
  const cms = useCmsSection("pricing", lang, hardcoded as Record<string, any>) as Record<string, any>;
  const t = { ...hardcoded, ...cms };
  const [userCounts, setUserCounts] = useState([5, 5, 5]);

  const updateUsers = (index: number, delta: number) => {
    setUserCounts(prev => {
      const next = [...prev];
      next[index] = Math.max(1, Math.min(999, next[index] + delta));
      return next;
    });
  };

  const plans = t.plans || hardcoded.plans;

  return (
    <section id="pricing" className="py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">{t.title}</h2>
          <p className="text-muted-foreground text-base sm:text-lg">{t.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {plans.map((plan: any, i: number) => {
            const isPopular = plan.popular;
            const isEnterprise = i === 2;
            const users = userCounts[i];
            // Coerce pricePerUser to a number — CMS overrides may store it as a string,
            // and direct multiplication on a string yields NaN.
            const fallbackPrice =
              hardcoded.plans[i]?.pricePerUser ??
              Object.values(BASE_PRICE_PER_USER)[i] ?? 0;
            const rawPrice = plan.pricePerUser;
            const parsedPrice =
              typeof rawPrice === "number"
                ? rawPrice
                : parseFloat(
                    String(rawPrice ?? "")
                      .replace(/[^\d.,-]/g, "")
                      .replace(",", ".")
                  );
            const pricePerUser = Number.isFinite(parsedPrice) ? parsedPrice : fallbackPrice;
            const totalPrice = pricePerUser * users;

            return (
              <div
                key={i}
                className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all ${
                  isPopular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {/* Badge */}
                {isPopular && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-b-lg">
                      {t.popular}
                    </span>
                  </div>
                )}
                {isEnterprise && (
                  <div className="absolute -top-px right-4">
                    <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-b-lg">
                      {t.aiLabel}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="p-6 sm:p-8 text-center border-b border-border">
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">{plan.tagline}</p>
                  
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-5xl font-extrabold tracking-tight">{pricePerUser}</span>
                    <div className="text-left">
                      <span className="text-sm text-muted-foreground">{t.currency || "TND"}</span>
                      <div className="text-xs text-muted-foreground">{t.perUser}</div>
                    </div>
                  </div>

                  <Link
                    to={`/checkout?plan=${plan.name.toLowerCase()}`}
                    className="mt-6 block w-full text-center py-3 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted/50 transition-all"
                  >
                    {t.cta}
                  </Link>
                </div>

                {/* Features */}
                <div className="p-6 sm:p-8 flex-1 space-y-5">
                  {plan.extraLabel && (
                    <p className="text-xs font-bold text-muted-foreground tracking-wide">{plan.extraLabel}</p>
                  )}
                  <div>
                    <p className="text-xs font-bold text-primary tracking-wide mb-3">{plan.toolsTitle}</p>
                    <ul className="space-y-2.5">
                      {(plan.tools || []).map((tool: string, ti: number) => (
                        <li key={ti} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{tool}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-primary tracking-wide mb-3">{plan.serviceTitle}</p>
                    <ul className="space-y-2.5">
                      {(plan.services || []).map((s: string, si: number) => (
                        <li key={si} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Calculator */}
                <div className="mx-4 mb-4 p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs font-bold text-center text-muted-foreground tracking-wide mb-3">{t.calculatePrice}</p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <span className="text-xs text-muted-foreground mr-2">{t.yourUsers}</span>
                    <button
                      onClick={() => updateUsers(i, -1)}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{users}</span>
                    <button
                      onClick={() => updateUsers(i, 1)}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold">{totalPrice}</span>
                    <span className="text-sm text-muted-foreground ml-1.5">{t.currency || "TND"} {t.monthly}</span>
                  </div>
                </div>

                {/* All features link */}
                <div className="px-4 pb-4">
                  <a href="#features" className="block text-center py-2.5 text-xs font-semibold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
                    {t.allFeatures}
                  </a>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
