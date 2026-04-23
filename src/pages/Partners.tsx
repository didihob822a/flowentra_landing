import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Partners = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const benefits = fr
    ? [
        { title: "Revenus Récurrents", desc: "Commissions attractives sur chaque client référé et accompagné." },
        { title: "Formation & Certification", desc: "Accès à notre programme de certification partenaire complet." },
        { title: "Support Dédié", desc: "Un channel partner manager dédié pour vous accompagner." },
        { title: "Co-Marketing", desc: "Ressources marketing et opportunités de co-branding." },
      ]
    : [
        { title: "Recurring Revenue", desc: "Attractive commissions on every referred and supported client." },
        { title: "Training & Certification", desc: "Access to our comprehensive partner certification program." },
        { title: "Dedicated Support", desc: "A dedicated channel partner manager to support you." },
        { title: "Co-Marketing", desc: "Marketing resources and co-branding opportunities." },
      ];

  return (
    <PageLayout
      title={fr ? "Programme Partenaires" : "Partner Program"}
      subtitle={fr ? "Développez votre activité avec Flowentra. Rejoignez notre écosystème de partenaires." : "Grow your business with Flowentra. Join our partner ecosystem."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                className="p-7 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                <h3 className="font-bold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-16">
            <a href="mailto:partners@flowentra.com" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              {fr ? "Devenir Partenaire" : "Become a Partner"}
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Partners;
