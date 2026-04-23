import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Documentation = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const sections = fr
    ? [
        { title: "Démarrage Rapide", desc: "Configurez votre compte et commencez à utiliser Flowentra en quelques minutes.", icon: "🚀" },
        { title: "CRM & Contacts", desc: "Gérez vos prospects, clients et pipelines de vente.", icon: "👥" },
        { title: "Automatisation", desc: "Créez des workflows automatisés avec notre éditeur visuel.", icon: "⚡" },
        { title: "Analytique", desc: "Tableaux de bord, rapports et visualisations de données.", icon: "📊" },
        { title: "API & Intégrations", desc: "Documentation complète de notre API RESTful et webhooks.", icon: "🔗" },
        { title: "Administration", desc: "Utilisateurs, rôles, permissions et configuration système.", icon: "⚙" },
        { title: "Factures & Devis", desc: "Création et gestion de factures et devis professionnels.", icon: "📄" },
        { title: "Email & Gmail/Outlook", desc: "Configuration et utilisation des intégrations email.", icon: "✉" },
      ]
    : [
        { title: "Quick Start", desc: "Set up your account and start using Flowentra in minutes.", icon: "🚀" },
        { title: "CRM & Contacts", desc: "Manage your leads, clients, and sales pipelines.", icon: "👥" },
        { title: "Automation", desc: "Create automated workflows with our visual editor.", icon: "⚡" },
        { title: "Analytics", desc: "Dashboards, reports, and data visualizations.", icon: "📊" },
        { title: "API & Integrations", desc: "Complete documentation for our RESTful API and webhooks.", icon: "🔗" },
        { title: "Administration", desc: "Users, roles, permissions, and system configuration.", icon: "⚙" },
        { title: "Invoices & Quotes", desc: "Create and manage professional invoices and quotes.", icon: "📄" },
        { title: "Email & Gmail/Outlook", desc: "Setup and usage of email integrations.", icon: "✉" },
      ];

  return (
    <PageLayout title="Documentation" subtitle={fr ? "Guides complets pour maîtriser Flowentra." : "Complete guides to master Flowentra."}>
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <span className="text-2xl mb-3 block">{s.icon}</span>
                <h3 className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Documentation;
