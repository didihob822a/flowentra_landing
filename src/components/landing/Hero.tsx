import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { ArrowRight, Play, LayoutDashboard, Layers } from "lucide-react";
import { MEGA_ICONS } from "@/components/admin/megaMenuIcons";

interface HeroModule {
  icon: string;
  label: string;
}

const DEFAULT_MODULES: HeroModule[] = [
  { icon: "LayoutDashboard", label: "Dashboard" },
  { icon: "Users", label: "Team Management" },
  { icon: "FileText", label: "Smart Documents" },
  { icon: "BarChart3", label: "Analytics & Reports" },
  { icon: "Zap", label: "Automation" },
  { icon: "Shield", label: "Security Center" },
  { icon: "Settings", label: "Configuration" },
];

const DEFAULT_MODULES_FR: HeroModule[] = [
  { icon: "LayoutDashboard", label: "Tableau de bord" },
  { icon: "Users", label: "Gestion d'équipe" },
  { icon: "FileText", label: "Documents intelligents" },
  { icon: "BarChart3", label: "Analyses & Rapports" },
  { icon: "Zap", label: "Automatisation" },
  { icon: "Shield", label: "Centre de sécurité" },
  { icon: "Settings", label: "Configuration" },
];

const GRADIENT_COLORS = [
  "from-primary/20 to-primary/5",
  "from-accent/20 to-accent/5",
  "from-primary/15 to-accent/10",
  "from-accent/20 to-primary/5",
  "from-primary/20 to-primary/10",
  "from-accent/15 to-accent/5",
  "from-primary/10 to-accent/10",
];

const resolveIcon = (name?: string) => (name && MEGA_ICONS[name]) || LayoutDashboard;

const Hero = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("hero", lang, tr.hero as Record<string, any>) as Record<string, any>;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const [activeModule, setActiveModule] = useState(0);

  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const fr = lang === "fr";

  // Parse modules from CMS JSON or fall back to defaults
  const modules: HeroModule[] = useMemo(() => {
    if (cms.heroModules) {
      try {
        const parsed = typeof cms.heroModules === "string" ? JSON.parse(cms.heroModules) : cms.heroModules;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* fall through */ }
    }
    return fr ? DEFAULT_MODULES_FR : DEFAULT_MODULES;
  }, [cms.heroModules, fr]);

  const currentModule = modules[activeModule] || modules[0];
  const CurrentIcon = resolveIcon(currentModule?.icon);
  const gradientColor = GRADIENT_COLORS[activeModule % GRADIENT_COLORS.length];

  return (
    <section ref={sectionRef} className="relative flex flex-col pt-16 overflow-hidden bg-background">
      {/* Subtle animated brand-color gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-primary/25 blur-[120px]"
          animate={{ x: [0, 60, -20, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-accent/25 blur-[140px]"
          animate={{ x: [0, -80, 30, 0], y: [0, -50, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-[540px] h-[300px] rounded-full bg-primary/18 blur-[120px]"
          animate={{ x: [0, 40, -60, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container relative mx-auto px-5 sm:px-4 lg:px-8 pt-16 sm:pt-24 lg:pt-28 flex-1 flex flex-col">
        <motion.div className="max-w-3xl mx-auto text-center" style={{ opacity: contentOpacity }}>
          <motion.h1
            className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] mb-5 sm:mb-6 text-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {cms.headline}
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            {cms.subtext}
          </motion.p>

          <motion.p
            className="text-xs sm:text-sm text-muted-foreground/70 max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {cms.tagline || (fr
              ? "Flowentra connecte chaque fonction de votre entreprise pour vous offrir plus de visibilité, d'efficacité et de maîtrise."
              : "Flowentra connects every function of your business to give you more visibility, efficiency, and control.")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <a href="#demo" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-all w-full sm:w-auto justify-center shadow-lg shadow-primary/30">
              <Play className="w-4 h-4" />
              {cms.cta}
            </a>
            <a href="#features" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-sm bg-primary-foreground text-foreground hover:bg-primary-foreground/90 transition-colors w-full sm:w-auto justify-center">
              {cms.ctaSecondary}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>

          <motion.p
            className="text-[11px] text-muted-foreground/60 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {cms.trustLine || (fr
              ? "Recommandé par plus de 2 500 entreprises et professionnels."
              : "Trusted by over 2,500 businesses and professionals.")}
          </motion.p>
        </motion.div>

        {/* App screenshot with floating module switcher */}
        <motion.div
          className="relative mx-auto mt-10 sm:mt-14 max-w-4xl w-full pb-0"
          style={{ y: dashboardY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Browser frame */}
          <div className="relative rounded-2xl overflow-visible border border-border/40 border-b-0 shadow-2xl shadow-primary/5">
            {/* Chrome bar */}
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-card/80 backdrop-blur border-b border-border/40 rounded-t-2xl">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-48 h-5 rounded-md bg-muted/40" />
              </div>
            </div>

            {/* Content area */}
            <div className="relative bg-gradient-to-b from-muted/20 to-muted/40 aspect-[16/10] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`}
                >
                  <div className="absolute inset-0 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <CurrentIcon className="w-6 h-6 text-primary/50" />
                        <div className="h-3 w-28 rounded-full bg-foreground/8" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-7 w-16 rounded-lg bg-primary/10" />
                        <div className="h-7 w-7 rounded-lg bg-foreground/5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="rounded-xl bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
                          <div className="h-2 w-12 rounded-full bg-foreground/6 mb-2" />
                          <div className="h-4 w-16 rounded-full bg-foreground/10 mb-1" />
                          <div className="h-1.5 w-10 rounded-full bg-primary/15" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 rounded-xl bg-card/30 border border-border/15 p-4 h-32 sm:h-40">
                        <div className="h-2.5 w-20 rounded-full bg-foreground/8 mb-3" />
                        <div className="flex gap-2 h-full pb-4">
                          {[40, 65, 50, 80, 60, 75, 45, 70].map((h, j) => (
                            <div key={j} className="flex-1 flex items-end">
                              <div className="w-full rounded-t-sm bg-primary/15" style={{ height: `${h}%` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl bg-card/30 border border-border/15 p-4 h-32 sm:h-40">
                        <div className="h-2.5 w-14 rounded-full bg-foreground/8 mb-3" />
                        <div className="space-y-2.5">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/25" />
                              <div className="h-2 flex-1 rounded-full bg-foreground/6" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-card/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/30">
                    <CurrentIcon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground/70">{currentModule.label}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating vertical module switcher — top-right, shifted up */}
            <motion.div
              className="hidden md:flex absolute -right-5 -top-8 z-20 flex-col w-48"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-1.5 shadow-xl shadow-primary/5">
                {modules.map((mod, i) => {
                  const Icon = resolveIcon(mod.icon);
                  const isActive = i === activeModule;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveModule(i)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isActive ? "bg-primary-foreground/15" : "bg-muted/50"
                      }`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="truncate">{mod.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;