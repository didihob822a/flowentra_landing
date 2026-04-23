import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { releasesApi, type PublicRelease } from "@/services/adminReleasesApi";

type ReleaseType = "feature" | "bugfix" | "improvement";

// Fallback data when API is unavailable
const fallbackReleases: Record<string, { version: string; date: string; items: { type: ReleaseType; text: string }[] }[]> = {
  en: [
    { version: "2.4.0", date: "February 10, 2026", items: [
      { type: "feature", text: "New Kanban board view for project management" },
      { type: "feature", text: "Gmail & Outlook two-way sync for contacts" },
      { type: "improvement", text: "Faster dashboard loading — 40% performance boost" },
      { type: "bugfix", text: "Fixed invoice PDF export failing on large datasets" },
    ]},
    { version: "2.3.0", date: "January 15, 2026", items: [
      { type: "feature", text: "AI-powered smart assistant for task suggestions" },
      { type: "feature", text: "Stripe payment integration for invoices" },
      { type: "improvement", text: "Redesigned notification center with grouping" },
      { type: "bugfix", text: "Fixed stock level alerts not sending emails" },
    ]},
  ],
  fr: [
    { version: "2.4.0", date: "10 février 2026", items: [
      { type: "feature", text: "Nouvelle vue Kanban pour la gestion de projets" },
      { type: "feature", text: "Synchronisation bidirectionnelle Gmail & Outlook" },
      { type: "improvement", text: "Chargement du tableau de bord plus rapide — gain de 40%" },
      { type: "bugfix", text: "Correction de l'export PDF des factures" },
    ]},
    { version: "2.3.0", date: "15 janvier 2026", items: [
      { type: "feature", text: "Assistant intelligent IA pour les suggestions de tâches" },
      { type: "feature", text: "Intégration paiement Stripe pour les factures" },
      { type: "improvement", text: "Centre de notifications redessiné" },
      { type: "bugfix", text: "Correction des alertes de stock" },
    ]},
  ],
  de: [
    { version: "2.4.0", date: "10. Februar 2026", items: [
      { type: "feature", text: "Neue Kanban-Board-Ansicht für Projektmanagement" },
      { type: "feature", text: "Gmail & Outlook Zwei-Wege-Synchronisation" },
      { type: "improvement", text: "Schnelleres Dashboard — 40% Leistungssteigerung" },
      { type: "bugfix", text: "PDF-Export von Rechnungen behoben" },
    ]},
  ],
  ar: [
    { version: "2.4.0", date: "10 فيفري 2026", items: [
      { type: "feature", text: "عرض كانبان جديد لإدارة المشاريع" },
      { type: "feature", text: "مزامنة ثنائية مع Gmail و Outlook" },
      { type: "improvement", text: "تحميل أسرع للوحة المعلومات — تحسين 40%" },
      { type: "bugfix", text: "إصلاح فشل تصدير PDF للفواتير" },
    ]},
  ],
};

const pageText: Record<string, { title: string; subtitle: string }> = {
  en: { title: "Releases", subtitle: "Track every update to the Flowentra platform — new capabilities, performance improvements, and resolved issues." },
  fr: { title: "Notes de version", subtitle: "Suivez chaque mise à jour de la plateforme Flowentra — nouvelles fonctionnalités, améliorations et corrections." },
  de: { title: "Versionshinweise", subtitle: "Verfolgen Sie jedes Update der Flowentra-Plattform." },
  ar: { title: "سجل الإصدارات", subtitle: "تابع كل تحديث لمنصة Flowentra." },
};

const badgeLabels: Record<string, Record<ReleaseType, string>> = {
  en: { feature: "New", bugfix: "Fixed", improvement: "Improved" },
  fr: { feature: "Nouveau", bugfix: "Corrigé", improvement: "Amélioré" },
  de: { feature: "Neu", bugfix: "Behoben", improvement: "Verbessert" },
  ar: { feature: "جديد", bugfix: "مُصلح", improvement: "محسّن" },
};

const dotColor: Record<ReleaseType, string> = {
  feature: "text-emerald-500",
  bugfix: "text-rose-400",
  improvement: "text-blue-400",
};

const Releases = () => {
  const { lang } = useLanguage();
  const text = pageText[lang] || pageText.en;
  const labels = badgeLabels[lang] || badgeLabels.en;

  const [data, setData] = useState<{ version: string; date: string; items: { type: ReleaseType; text: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const apiData = await releasesApi.getPublic(lang);
        if (apiData.length > 0) {
          setData(apiData.map(r => ({
            version: r.version,
            date: r.date_display,
            items: r.items.map(i => ({ type: i.item_type as ReleaseType, text: i.text })),
          })));
        } else {
          setData(fallbackReleases[lang] || fallbackReleases.en);
        }
      } catch {
        setData(fallbackReleases[lang] || fallbackReleases.en);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  return (
    <PageLayout title={text.title} subtitle={text.subtitle}>
      <section className="py-16 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            data.map((release, i) => {
              const isLatest = i === 0;
              return (
                <motion.article
                  key={release.version}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="relative"
                >
                  {i < data.length - 1 && (
                    <div className="absolute left-6 top-[3.5rem] bottom-0 w-px bg-border" />
                  )}

                  <div className="flex items-start gap-5">
                    <div className="shrink-0 flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs tracking-wide ${isLatest ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground border border-border"}`}>
                        {release.version.split(".").slice(0, 2).join(".")}
                      </div>
                    </div>

                    <div className="flex-1 pb-12">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold tracking-tight">v{release.version}</h2>
                        {isLatest && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/8 px-2.5 py-1 rounded-md">
                            {lang === "fr" ? "Dernière" : lang === "de" ? "Aktuell" : lang === "ar" ? "الأحدث" : "Latest"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/60 mb-5 font-medium">{release.date}</p>

                      <div className="space-y-2">
                        {release.items.map((item, j) => (
                          <div key={j} className="flex items-baseline gap-3 py-1.5">
                            <span className={`shrink-0 text-[8px] leading-none ${dotColor[item.type]}`}>●</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 w-16 shrink-0">
                              {labels[item.type]}
                            </span>
                            <p className="text-sm text-foreground/75 leading-relaxed">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Releases;
