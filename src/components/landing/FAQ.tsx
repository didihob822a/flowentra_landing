import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("faq", lang, tr.faq);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = cms.items || [];

  return (
    <section id="faq" className="py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">{cms.title}</h2>
          <p className="text-muted-foreground text-base sm:text-lg">{cms.subtitle}</p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-2">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              className="border border-border rounded-xl overflow-hidden bg-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full text-left px-5 py-4 cursor-pointer"
              >
                <span className="text-sm font-semibold pr-4">{item.q}</span>
                <span className={`text-muted-foreground transition-transform ${openIndex === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
