import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { useState } from "react";
import {
  Building2, Snowflake, Zap, Landmark,
  Shield, Sparkles,
  Sun, Wifi, Wrench,
} from "lucide-react";

interface IndustryCategory {
  title: string;
  items: { title: string; icon: any }[];
}

const industries = {
  fr: {
    title: "Flowentra pour votre secteur d'activité",
    subtitle: "Des solutions adaptées aux métiers de service, conçues pour les professionnels du terrain et du bureau.",
    categories: [
      {
        title: "Services techniques du bâtiment",
        items: [
          { title: "Climatisation et réfrigération", icon: Snowflake },
          { title: "Installations électriques", icon: Zap },
          { title: "Gestion des installations", icon: Landmark },
        ],
      },
      {
        title: "Services aux entreprises",
        items: [
          { title: "Sécurité et surveillance", icon: Shield },
          { title: "Nettoyage et entretien", icon: Sparkles },
          { title: "Maintenance et SAV", icon: Wrench },
        ],
      },
      {
        title: "Énergie et IT",
        items: [
          { title: "Solaire et énergies", icon: Sun },
          { title: "IT et télécommunications", icon: Wifi },
        ],
      },
    ] as IndustryCategory[],
  },
  en: {
    title: "Flowentra for Your Industry",
    subtitle: "Tailored solutions for service businesses, designed for field and office professionals.",
    categories: [
      {
        title: "Building Technical Services",
        items: [
          { title: "HVAC & Refrigeration", icon: Snowflake },
          { title: "Electrical Installations", icon: Zap },
          { title: "Facility Management", icon: Landmark },
        ],
      },
      {
        title: "Business Services",
        items: [
          { title: "Security & Surveillance", icon: Shield },
          { title: "Cleaning & Maintenance", icon: Sparkles },
          { title: "Field Service & After-Sales", icon: Wrench },
        ],
      },
      {
        title: "Energy & IT",
        items: [
          { title: "Solar & Energy", icon: Sun },
          { title: "IT & Telecommunications", icon: Wifi },
        ],
      },
    ] as IndustryCategory[],
  },
  de: {
    title: "Flowentra für Ihre Branche",
    subtitle: "Maßgeschneiderte Lösungen für Dienstleistungsunternehmen.",
    categories: [
      {
        title: "Technische Gebäudedienste",
        items: [
          { title: "Klima- und Kältetechnik", icon: Snowflake },
          { title: "Elektroinstallationen", icon: Zap },
          { title: "Facility Management", icon: Landmark },
        ],
      },
      {
        title: "Unternehmensdienstleistungen",
        items: [
          { title: "Sicherheit & Überwachung", icon: Shield },
          { title: "Reinigung & Wartung", icon: Sparkles },
          { title: "Kundendienst & SAV", icon: Wrench },
        ],
      },
      {
        title: "Energie & IT",
        items: [
          { title: "Solar & Energie", icon: Sun },
          { title: "IT & Telekommunikation", icon: Wifi },
        ],
      },
    ] as IndustryCategory[],
  },
  ar: {
    title: "Flowentra لقطاعك",
    subtitle: "حلول مصممة لشركات الخدمات الميدانية والمكتبية.",
    categories: [
      {
        title: "الخدمات التقنية للمباني",
        items: [
          { title: "التكييف والتبريد", icon: Snowflake },
          { title: "التركيبات الكهربائية", icon: Zap },
          { title: "إدارة المرافق", icon: Landmark },
        ],
      },
      {
        title: "خدمات الشركات",
        items: [
          { title: "الأمن والمراقبة", icon: Shield },
          { title: "التنظيف والصيانة", icon: Sparkles },
          { title: "خدمة ما بعد البيع", icon: Wrench },
        ],
      },
      {
        title: "الطاقة وتكنولوجيا المعلومات",
        items: [
          { title: "الطاقة الشمسية", icon: Sun },
          { title: "تكنولوجيا المعلومات", icon: Wifi },
        ],
      },
    ] as IndustryCategory[],
  },
};

const IndustryVerticals = () => {
  const { lang } = useLanguage();
  const hardcoded = industries[lang as keyof typeof industries] || industries.en;
  const cms = useCmsSection("industryVerticals", lang, { title: hardcoded.title, subtitle: hardcoded.subtitle } as Record<string, any>);
  const t = { ...hardcoded, title: cms.title || hardcoded.title, subtitle: cms.subtitle || hardcoded.subtitle };
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="industries" className="py-20 sm:py-28 lg:py-36 border-y border-border">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="max-w-xl mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">{t.title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {t.categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === i
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Active category items */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {(t.categories[activeTab]?.items ?? []).map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/25 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{item.title}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default IndustryVerticals;
