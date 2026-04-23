import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

const DemoPreview = () => {
  const { tr, lang } = useLanguage();
  const fr = lang === "fr";
  const de = lang === "de";
  const ar = lang === "ar";
  const [activeTab, setActiveTab] = useState(0);

  const defaultSectionLabel = fr ? "Démonstration" : de ? "Demo" : ar ? "عرض توضيحي" : "Live Demo";
  const defaultDeviceLabels = {
    desktop: fr ? "Bureau" : de ? "Desktop" : ar ? "حاسوب" : "Desktop",
    tablet: fr ? "Tablette" : de ? "Tablet" : ar ? "لوحي" : "Tablet",
    mobile: fr ? "Mobile" : de ? "Mobil" : ar ? "جوال" : "Mobile",
  };
  const defaultBrowserBarUrl = "app.flowentra.io";
  const defaultScreenshotNote = fr
    ? "Remplacez par de vraies captures d'écran de votre application"
    : de
    ? "Ersetzen Sie dies durch echte Screenshots Ihrer Anwendung"
    : ar
    ? "استبدلها بلقطات حقيقية لتطبيقك"
    : "Replace with real screenshots of your application";

  const defaultBarChart = [55, 72, 40, 88, 65, 80, 50, 92, 68, 85, 60, 90];
  const defaultAnalyticsStats = [
    { label: tr.demo.stats.revenue, value: "+24%" },
    { label: tr.demo.stats.users, value: "12.4K" },
    { label: tr.demo.stats.completion, value: "98.2%" },
  ];

  const cms = useCmsSection("demo", lang, {
    title: tr.demo.title,
    subtitle: tr.demo.subtitle,
    workflow: tr.demo.workflow,
    workflowDesc: tr.demo.workflowDesc,
    analytics: tr.demo.analytics,
    analyticsDesc: tr.demo.analyticsDesc,
    nodes: tr.demo.nodes,
    stats: tr.demo.stats,
    sectionLabel: defaultSectionLabel,
    deviceDesktop: defaultDeviceLabels.desktop,
    deviceTablet: defaultDeviceLabels.tablet,
    deviceMobile: defaultDeviceLabels.mobile,
    browserBarUrl: defaultBrowserBarUrl,
    screenshotNote: defaultScreenshotNote,
    barChart: defaultBarChart,
    analyticsStats: defaultAnalyticsStats,
  } as Record<string, any>) as Record<string, any>;

  const tabs = [
    { label: cms.workflow || tr.demo.workflow, key: "workflow" },
    { label: cms.analytics || tr.demo.analytics, key: "analytics" },
  ];

  const devices = [
    { icon: Monitor, label: cms.deviceDesktop || defaultDeviceLabels.desktop, aspect: "aspect-[16/9]" },
    { icon: Tablet, label: cms.deviceTablet || defaultDeviceLabels.tablet, aspect: "aspect-[4/3] max-w-md" },
    { icon: Smartphone, label: cms.deviceMobile || defaultDeviceLabels.mobile, aspect: "aspect-[9/16] max-w-[200px]" },
  ];
  const [activeDevice, setActiveDevice] = useState(0);

  const browserUrl = cms.browserBarUrl || defaultBrowserBarUrl;
  const barChart: number[] = Array.isArray(cms.barChart) && cms.barChart.length ? cms.barChart : defaultBarChart;
  const analyticsStats: { label: string; value: string }[] =
    Array.isArray(cms.analyticsStats) && cms.analyticsStats.length ? cms.analyticsStats : defaultAnalyticsStats;
  const screenshotNote = cms.screenshotNote || defaultScreenshotNote;
  const sectionLabel = cms.sectionLabel || defaultSectionLabel;

  const nodes = cms.nodes || tr.demo.nodes;

  return (
    <section id="demo" className="py-20 sm:py-28 lg:py-36 section-dark">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">
            {sectionLabel}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 text-primary-foreground">{cms.title || tr.demo.title}</h2>
          <p className="text-surface-dark-foreground/40 text-sm sm:text-base">{cms.subtitle || tr.demo.subtitle}</p>
        </motion.div>

        {/* Tab + device switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {tabs.map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === i
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {devices.map((d, i) => {
              const DevIcon = d.icon;
              return (
                <button
                  key={d.label}
                  onClick={() => setActiveDevice(i)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    activeDevice === i
                      ? "bg-white/10 text-white"
                      : "text-white/30 hover:text-white/50"
                  }`}
                >
                  <DevIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Device frame */}
        <div className="max-w-4xl mx-auto flex justify-center">
          <motion.div
            key={`${activeTab}-${activeDevice}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`w-full ${devices[activeDevice].aspect} mx-auto`}
          >
            <div className="relative h-full rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border-b border-white/8">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 flex items-center justify-center p-8 min-h-[300px]">
                {activeTab === 0 ? (
                  <div className="w-full">
                    <p className="text-white/35 text-sm mb-6 text-center max-w-lg mx-auto">{cms.workflowDesc || tr.demo.workflowDesc}</p>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      {[nodes.trigger, nodes.condition, nodes.action].map((label, ni) => (
                        <div key={ni} className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white/60">
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center my-3">
                      <div className="w-px h-5 bg-white/8" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      {[nodes.email, nodes.log].map((label, ni) => (
                        <div key={ni} className="px-4 py-2.5 rounded-lg border border-white/8 bg-white/3 text-sm font-medium text-white/40">
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <p className="text-white/35 text-sm mb-6 text-center max-w-lg mx-auto">{cms.analyticsDesc || tr.demo.analyticsDesc}</p>
                    <div className="flex items-end gap-1 h-28 sm:h-36 mb-6 max-w-sm mx-auto">
                      {barChart.map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-sm bg-white/12"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/8 max-w-sm mx-auto">
                      {analyticsStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-lg font-bold text-white">{stat.value}</p>
                          <p className="text-[11px] text-white/25 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Screenshot placement note */}
        <motion.p
          className="text-center text-[11px] text-white/15 mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {screenshotNote}
        </motion.p>
      </div>
    </section>
  );
};

export default DemoPreview;
