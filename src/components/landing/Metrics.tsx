import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

const AnimatedNumber = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + Math.round(latest).toLocaleString() + suffix;
      }
    });
    return unsubscribe;
  }, [spring, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

const Metrics = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const de = lang === "de";
  const ar = lang === "ar";

  const defaultTitle = fr ? "Ce que nos clients obtiennent" : de ? "Das erreichen unsere Kunden" : ar ? "ما يحققه عملاؤنا" : "What our customers achieve";
  const defaultMetrics = [
    { value: 60, suffix: "%", label: fr ? "Moins de tâches manuelles" : de ? "Weniger manuelle Aufgaben" : ar ? "مهام يدوية أقل" : "Less manual work" },
    { value: 3, suffix: "x", label: fr ? "Plus rapide" : de ? "Schneller" : ar ? "أسرع" : "Faster operations" },
    { value: 2, suffix: "x", label: fr ? "Plus de productivité" : de ? "Mehr Produktivität" : ar ? "إنتاجية أعلى" : "More productivity" },
    { value: 74, suffix: "%", label: fr ? "De temps gagné" : de ? "Zeitersparnis" : ar ? "توفير في الوقت" : "Time saved" },
  ];

  const cms = useCmsSection("metrics", lang, { title: defaultTitle, items: defaultMetrics } as Record<string, any>) as Record<string, any>;
  const title = cms.title || defaultTitle;
  const metrics: Array<{ value: number; suffix?: string; label: string }> =
    Array.isArray(cms.items) && cms.items.length ? cms.items : defaultMetrics;

  return (
    <section className="py-16 sm:py-20 section-dark">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.p
          className="text-center text-[10px] font-medium text-surface-dark-foreground/30 tracking-[0.2em] uppercase mb-10 sm:mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-3xl mx-auto">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-2 tabular-nums">
                <AnimatedNumber value={metric.value} suffix={metric.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-surface-dark-foreground/40 font-medium">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;
