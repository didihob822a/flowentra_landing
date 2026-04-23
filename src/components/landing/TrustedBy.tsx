import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";

const defaultLogos = [
  "Telnet Holding", "Poulina Group", "BIAT", "Sofrecom",
  "Vermeg", "Instadeep", "Tunisie Telecom", "STEG",
];

const TrustedBy = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("trustedBy", lang, { title: tr.trustedBy, logos: defaultLogos } as Record<string, any>) as Record<string, any>;
  const title = cms.title || tr.trustedBy;
  const logos: string[] = Array.isArray(cms.logos) && cms.logos.length ? cms.logos : defaultLogos;

  return (
    <section className="py-10 sm:py-14 border-b border-border">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.p
          className="text-center text-[10px] font-medium text-muted-foreground/40 tracking-[0.2em] uppercase mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.p>
        <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 flex-wrap">
          {logos.map((name, i) => (
            <motion.span
              key={name}
              className="text-sm sm:text-base font-bold text-muted-foreground/15 hover:text-muted-foreground/35 transition-colors duration-300 cursor-default select-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
