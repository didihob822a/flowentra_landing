import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";

import gmailLogo from "@/assets/integrations/gmail.svg";
import outlookLogo from "@/assets/integrations/outlook.svg";
import telegramLogo from "@/assets/integrations/telegram.svg";
import stripeLogo from "@/assets/integrations/stripe.svg";
import konnektLogo from "@/assets/integrations/konnekt.png";
import openrouterLogo from "@/assets/integrations/openrouter.svg";

const logoMap: Record<string, string> = {
  Gmail: gmailLogo,
  Outlook: outlookLogo,
  Telegram: telegramLogo,
  Stripe: stripeLogo,
  Konnekt: konnektLogo,
  OpenRouter: openrouterLogo,
};

const defaultIntegrations = ["Gmail", "Outlook", "Telegram", "Stripe", "Konnekt", "OpenRouter"];

const titles = {
  en: { label: "Integrations", title: "Works With the Tools You Already Use", subtitle: "Native integrations to connect your entire tech stack seamlessly.", comingSoon: "more coming soon" },
  fr: { label: "Intégrations", title: "Compatible avec vos outils existants", subtitle: "Des intégrations natives pour connecter tout votre écosystème technique.", comingSoon: "d'autres à venir" },
  de: { label: "Integrationen", title: "Funktioniert mit Ihren bestehenden Tools", subtitle: "Native Integrationen für nahtlose Verbindung Ihres Tech-Stacks.", comingSoon: "weitere folgen" },
  ar: { label: "التكاملات", title: "يعمل مع الأدوات التي تستخدمها", subtitle: "تكاملات أصلية لربط منظومتك التقنية بسلاسة.", comingSoon: "المزيد قريبًا" },
};

const IntegrationsShowcase = () => {
  const { lang } = useLanguage();
  const defaults = titles[lang as keyof typeof titles] || titles.en;
  const cms = useCmsSection("integrations", lang, { ...defaults, items: defaultIntegrations } as Record<string, any>) as Record<string, any>;
  const t = { ...defaults, ...cms };
  const integrationNames: string[] = Array.isArray(cms.items) && cms.items.length ? cms.items : defaultIntegrations;
  const integrations = integrationNames.map((name) => ({ name, logo: logoMap[name] || logoMap.Gmail }));

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-card border-y border-border">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">{t.label}</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">{t.title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              className="group relative flex flex-col items-center justify-center gap-2.5 sm:gap-3 p-4 sm:p-6 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
                <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300 text-center">
                {item.name}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-8 sm:mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/40 tracking-widest uppercase">
            + {t.comingSoon}
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationsShowcase;
