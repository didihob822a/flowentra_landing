import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const Testimonials = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("testimonials", lang, tr.testimonials);
  const fr = lang === "fr";

  const items = cms.items || [];

  return (
    <section id="testimonials" className="py-20 sm:py-28 lg:py-36 bg-muted/30">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">
            {fr ? "Témoignages" : lang === "de" ? "Referenzen" : lang === "ar" ? "آراء العملاء" : "Testimonials"}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">{cms.title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{cms.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              className="relative bg-card rounded-2xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">"{item.quote}"</p>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
