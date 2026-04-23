import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const SecurityPage = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const features = fr
    ? [
        { title: "Chiffrement de bout en bout", desc: "AES-256 au repos, TLS 1.3 en transit. Vos données sont protégées à chaque étape.", icon: "🔒" },
        { title: "Conformité RGPD", desc: "Pleine conformité avec le Règlement Général sur la Protection des Données européen.", icon: "🇪🇺" },
        { title: "Authentification Multi-Facteurs", desc: "MFA obligatoire pour les comptes administrateurs, optionnel pour tous les utilisateurs.", icon: "🔐" },
        { title: "Audit Trail Complet", desc: "Journal détaillé de toutes les actions utilisateur pour la traçabilité et la conformité.", icon: "📋" },
        { title: "Data Centers Certifiés", desc: "Hébergement dans des centres de données ISO 27001 et SOC 2 Type II en Europe.", icon: "🏢" },
        { title: "Sauvegardes Automatiques", desc: "Sauvegardes automatiques quotidiennes avec rétention de 30 jours et restauration instantanée.", icon: "💾" },
      ]
    : [
        { title: "End-to-End Encryption", desc: "AES-256 at rest, TLS 1.3 in transit. Your data is protected at every step.", icon: "🔒" },
        { title: "GDPR Compliance", desc: "Full compliance with the European General Data Protection Regulation.", icon: "🇪🇺" },
        { title: "Multi-Factor Authentication", desc: "MFA mandatory for admin accounts, optional for all users.", icon: "🔐" },
        { title: "Complete Audit Trail", desc: "Detailed log of all user actions for traceability and compliance.", icon: "📋" },
        { title: "Certified Data Centers", desc: "Hosted in ISO 27001 and SOC 2 Type II certified data centers in Europe.", icon: "🏢" },
        { title: "Automatic Backups", desc: "Daily automatic backups with 30-day retention and instant restoration.", icon: "💾" },
      ];

  return (
    <PageLayout
      title={fr ? "Sécurité" : "Security"}
      subtitle={fr ? "La protection de vos données est notre priorité absolue." : "Protecting your data is our absolute priority."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="p-7 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <span className="text-2xl mb-4 block">{f.icon}</span>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-8 mt-16 pt-12 border-t border-border flex-wrap">
            {["ISO 27001", "SOC 2", "GDPR", "SSL/TLS"].map((badge) => (
              <div key={badge} className="px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-semibold text-muted-foreground">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default SecurityPage;
