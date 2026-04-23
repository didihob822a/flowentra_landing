import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { BarChart3, Users, Workflow, Bot } from "lucide-react";

const showcaseData = {
  en: {
    label: "See it in action",
    title: "One platform to run your entire business",
    items: [
      {
        tag: "Dashboard",
        title: "Real-time analytics at a glance",
        desc: "Track KPIs, monitor performance, and make data-driven decisions with customizable dashboards that update in real time.",
      },
      {
        tag: "Team Management",
        title: "Collaborate without the chaos",
        desc: "Assign tasks, manage schedules, and keep your whole team aligned — from the field to the office.",
      },
      {
        tag: "Workflow Automation",
        title: "Automate repetitive processes",
        desc: "Build visual workflows that trigger actions, send notifications, and move data between systems automatically.",
      },
      {
        tag: "AI Assistant",
        title: "Your intelligent copilot",
        desc: "Get smart suggestions, automate document creation, and let AI handle routine decisions for you.",
      },
    ],
  },
  fr: {
    label: "Découvrez en action",
    title: "Une seule plateforme pour gérer toute votre entreprise",
    items: [
      {
        tag: "Tableau de bord",
        title: "Analyses en temps réel, en un coup d'œil",
        desc: "Suivez vos KPIs, surveillez les performances et prenez des décisions éclairées grâce à des tableaux de bord personnalisables.",
      },
      {
        tag: "Gestion d'équipe",
        title: "Collaborez sans le chaos",
        desc: "Attribuez des tâches, gérez les plannings et gardez toute votre équipe alignée — du terrain au bureau.",
      },
      {
        tag: "Automatisation",
        title: "Automatisez les processus répétitifs",
        desc: "Créez des workflows visuels qui déclenchent des actions, envoient des notifications et synchronisent vos données.",
      },
      {
        tag: "Assistant IA",
        title: "Votre copilote intelligent",
        desc: "Obtenez des suggestions intelligentes, automatisez la création de documents et laissez l'IA gérer les décisions routinières.",
      },
    ],
  },
  de: {
    label: "In Aktion erleben",
    title: "Eine Plattform für Ihr gesamtes Unternehmen",
    items: [
      {
        tag: "Dashboard",
        title: "Echtzeit-Analysen auf einen Blick",
        desc: "Verfolgen Sie KPIs, überwachen Sie die Leistung und treffen Sie datenbasierte Entscheidungen.",
      },
      {
        tag: "Teamverwaltung",
        title: "Zusammenarbeit ohne Chaos",
        desc: "Aufgaben zuweisen, Zeitpläne verwalten und das gesamte Team koordinieren.",
      },
      {
        tag: "Automatisierung",
        title: "Wiederkehrende Prozesse automatisieren",
        desc: "Erstellen Sie visuelle Workflows, die Aktionen auslösen und Daten zwischen Systemen synchronisieren.",
      },
      {
        tag: "KI-Assistent",
        title: "Ihr intelligenter Copilot",
        desc: "Intelligente Vorschläge, automatische Dokumentenerstellung und KI-gestützte Entscheidungen.",
      },
    ],
  },
  ar: {
    label: "شاهدها أثناء العمل",
    title: "منصة واحدة لإدارة أعمالك بالكامل",
    items: [
      {
        tag: "لوحة التحكم",
        title: "تحليلات فورية في لمحة",
        desc: "تتبع مؤشرات الأداء واتخذ قرارات مبنية على البيانات مع لوحات تحكم قابلة للتخصيص.",
      },
      {
        tag: "إدارة الفريق",
        title: "تعاون بدون فوضى",
        desc: "عيّن المهام وأدر الجداول الزمنية وأبقِ فريقك متوافقاً.",
      },
      {
        tag: "الأتمتة",
        title: "أتمت العمليات المتكررة",
        desc: "أنشئ سير عمل مرئية تطلق الإجراءات وترسل الإشعارات تلقائياً.",
      },
      {
        tag: "مساعد الذكاء الاصطناعي",
        title: "مساعدك الذكي",
        desc: "احصل على اقتراحات ذكية وأتمت إنشاء المستندات.",
      },
    ],
  },
};

const icons = [BarChart3, Users, Workflow, Bot];

const ProductShowcase = () => {
  const { lang } = useLanguage();
  const fallback = showcaseData[lang as keyof typeof showcaseData] || showcaseData.en;
  const fr = lang === "fr";
  const de = lang === "de";
  const ar = lang === "ar";

  const defaultBrowserBarHost = "app.flowentra.io";
  const defaultScreenshotPrefix = fr
    ? "Capture"
    : de
    ? "Screenshot"
    : ar
    ? "لقطة"
    : "Screenshot";

  const cms = useCmsSection("productShowcase", lang, {
    label: fallback.label,
    title: fallback.title,
    items: fallback.items,
    browserBarHost: defaultBrowserBarHost,
    screenshotPrefix: defaultScreenshotPrefix,
  } as Record<string, any>) as Record<string, any>;

  const data = {
    label: cms.label || fallback.label,
    title: cms.title || fallback.title,
    items: Array.isArray(cms.items) && cms.items.length ? cms.items : fallback.items,
  };
  const browserBarHost = cms.browserBarHost || defaultBrowserBarHost;
  const screenshotPrefix = cms.screenshotPrefix || defaultScreenshotPrefix;

  return (
    <section className="py-24 sm:py-32 lg:py-40">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-24"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">{data.label}</p>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold tracking-tight leading-tight">{data.title}</h2>
        </motion.div>

        {/* Alternating rows */}
        <div className="space-y-20 sm:space-y-28 lg:space-y-36">
          {data.items.map((item: any, i: number) => {
            const Icon = icons[i % icons.length];
            const reversed = i % 2 !== 0;

            return (
              <motion.div
                key={i}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reversed ? "lg:direction-reverse" : ""}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
              >
                {/* Text side */}
                <div className={reversed ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold mb-4">
                    <Icon className="w-3.5 h-3.5" />
                    {item.tag}
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-4 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                    {item.desc}
                  </p>
                </div>

                {/* Screenshot placeholder */}
                <div className={reversed ? "lg:order-1" : ""}>
                  <div className="relative rounded-xl overflow-hidden border border-border shadow-lg bg-card">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                      </div>
                    </div>
                    {/* Screenshot area */}
                    <div className="aspect-[16/10] bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
                      <div className="text-center">
                        <Icon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground/30">{screenshotPrefix} — {item.tag}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
