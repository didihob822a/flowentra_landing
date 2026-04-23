import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const CTABanner = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("ctaBanner", lang, tr.ctaBanner as Record<string, any>) as Record<string, any>;

  const defaultBullets: Record<string, string[]> = {
    en: ["14-day free trial", "No credit card required", "Cancel anytime"],
    fr: ["Essai gratuit de 14 jours", "Sans carte bancaire", "Annulation à tout moment"],
    de: ["14 Tage kostenlos testen", "Keine Kreditkarte nötig", "Jederzeit kündbar"],
    ar: ["تجربة مجانية 14 يوم", "بدون بطاقة ائتمان", "إلغاء في أي وقت"],
  };

  const bullets = cms.bulletPoints || defaultBullets[lang] || defaultBullets.en;

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden bg-foreground">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/12 blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold tracking-tight mb-4 text-primary-foreground leading-tight">
            {cms.title}
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/40 mb-8 sm:mb-10 leading-relaxed max-w-lg mx-auto">
            {cms.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8 sm:mb-10">
            {(Array.isArray(bullets) ? bullets : []).map((b: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground/50 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary/70" />
                {b}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/pricing"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary-foreground text-foreground hover:bg-primary-foreground/90 transition-colors w-full sm:w-auto justify-center shadow-lg shadow-white/5"
            >
              {cms.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border border-primary-foreground/15 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/30 transition-colors w-full sm:w-auto justify-center"
            >
              {cms.ctaSecondary}
            </a>
          </div>
          <p className="text-[11px] text-primary-foreground/20 mt-6">{cms.note}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
