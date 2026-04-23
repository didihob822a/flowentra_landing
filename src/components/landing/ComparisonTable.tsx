import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";

const titles = {
  en: { label: "Why Flowentra", title: "The All-in-One Advantage", featureColumnLabel: "Feature", productName: "Flowentra" },
  fr: { label: "Pourquoi Flowentra", title: "L'avantage tout-en-un", featureColumnLabel: "Fonctionnalité", productName: "Flowentra" },
  de: { label: "Warum Flowentra", title: "Der All-in-One-Vorteil", featureColumnLabel: "Funktion", productName: "Flowentra" },
  ar: { label: "لماذا Flowentra", title: "ميزة الحل الشامل", featureColumnLabel: "الميزة", productName: "Flowentra" },
};

const features = {
  en: [
    "Unified CRM & ERP",
    "Visual Workflow Builder",
    "Built-in Analytics",
    "Multi-language (4+ langs)",
    "Field Operations & Dispatch",
    "No-code Website Builder",
    "Smart AI Assistant",
    "Custom Invoicing & Quotes",
    "200+ Integrations",
    "Dedicated Support",
  ],
  fr: [
    "CRM & ERP unifiés",
    "Constructeur de workflows visuel",
    "Analytique intégrée",
    "Multilingue (4+ langues)",
    "Opérations terrain & dispatch",
    "Créateur de sites sans code",
    "Assistant IA intelligent",
    "Facturation & devis personnalisés",
    "200+ intégrations",
    "Support dédié",
  ],
  de: [
    "Einheitliches CRM & ERP",
    "Visueller Workflow-Builder",
    "Integrierte Analytik",
    "Mehrsprachig (4+ Sprachen)",
    "Außendienst & Disposition",
    "No-Code Website-Builder",
    "Intelligenter KI-Assistent",
    "Rechnungen & Angebote",
    "200+ Integrationen",
    "Dedizierter Support",
  ],
  ar: [
    "CRM & ERP موحد",
    "منشئ سير عمل مرئي",
    "تحليلات مدمجة",
    "متعدد اللغات (4+ لغات)",
    "عمليات ميدانية وتوزيع",
    "منشئ مواقع بدون كود",
    "مساعد ذكي بالذكاء الاصطناعي",
    "فواتير وعروض مخصصة",
    "200+ تكامل",
    "دعم مخصص",
  ],
};

const defaultCompetitors = ["Odoo", "Salesforce", "HubSpot"];

// Which features each competitor has (indexed same as features array)
// true = has it, false = doesn't
const defaultCompetitorSupport: Record<string, boolean[]> = {
  Odoo: [true, false, true, true, false, true, false, true, true, false],
  Salesforce: [true, false, true, false, false, false, true, false, true, true],
  HubSpot: [true, true, true, false, false, false, false, false, true, true],
};

const ComparisonTable = () => {
  const { lang } = useLanguage();
  const defaults = titles[lang as keyof typeof titles] || titles.en;
  const defaultFeatureList = features[lang as keyof typeof features] || features.en;
  const cms = useCmsSection("comparisonTable", lang, {
    ...defaults,
    features: defaultFeatureList,
    competitors: defaultCompetitors,
    competitorSupport: defaultCompetitorSupport,
  } as Record<string, any>) as Record<string, any>;
  const t = { ...defaults, ...cms };
  const featureList: string[] = Array.isArray(cms.features) && cms.features.length ? cms.features : defaultFeatureList;
  const competitors: string[] = Array.isArray(cms.competitors) && cms.competitors.length ? cms.competitors : defaultCompetitors;
  const competitorSupport: Record<string, boolean[]> =
    cms.competitorSupport && typeof cms.competitorSupport === "object" ? cms.competitorSupport : defaultCompetitorSupport;

  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">{t.label}</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{t.title}</h2>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-start py-4 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-[40%]">
                  {t.featureColumnLabel}
                </th>
                <th className="py-4 px-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {t.productName || "Flowentra"}
                  </span>
                </th>
                {competitors.map((c) => (
                  <th key={c} className="py-4 px-4 text-center font-medium text-muted-foreground text-xs">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureList.map((feature, i) => (
                <motion.tr
                  key={i}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td className="py-3.5 px-4 font-medium text-foreground/80">{feature}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,8 7,12 13,4" />
                      </svg>
                    </span>
                  </td>
                  {competitors.map((c) => (
                    <td key={c} className="py-3.5 px-4 text-center">
                      {competitorSupport[c]?.[i] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                          <svg className="w-3 h-3 text-muted-foreground/50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,8 7,12 13,4" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/50">
                          <svg className="w-3 h-3 text-muted-foreground/25" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="4" y1="8" x2="12" y2="8" />
                          </svg>
                        </span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
