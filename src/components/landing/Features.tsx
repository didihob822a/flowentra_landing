import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, ShoppingCart, MapPin, FolderKanban, Wallet, UserCog,
  BarChart3, FileText, Bell, Bot, Workflow, Settings,
} from "lucide-react";

const moduleIcons = [Users, ShoppingCart, MapPin, FolderKanban, Wallet, UserCog,
  BarChart3, FileText, Bell, Bot, Workflow, Settings];

const Features = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("features", lang, tr.features);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const items = cms.items || [];

  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">
            {lang === "fr" ? "Modules" : lang === "de" ? "Module" : lang === "ar" ? "الوحدات" : "Modules"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{cms.title}</h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{cms.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {items.map((item: any, i: number) => {
            const Icon = moduleIcons[i % moduleIcons.length];
            return (
              <motion.div
                key={i}
                className={`rounded-xl border bg-card p-6 transition-all duration-200 cursor-default ${hoveredIdx === i ? 'border-primary/30 shadow-md shadow-primary/5' : 'border-border hover:border-primary/15'}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
