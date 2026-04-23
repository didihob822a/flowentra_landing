import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Status = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const services = [
    { name: "API", status: "operational" },
    { name: "Web Application", status: "operational" },
    { name: "Database", status: "operational" },
    { name: fr ? "Authentification" : "Authentication", status: "operational" },
    { name: fr ? "Stockage Fichiers" : "File Storage", status: "operational" },
    { name: "Email / SMTP", status: "operational" },
    { name: "Webhooks", status: "operational" },
    { name: fr ? "Intégrations Tierces" : "Third-party Integrations", status: "operational" },
  ];

  return (
    <PageLayout
      title={fr ? "État du Système" : "System Status"}
      subtitle={fr ? "Surveillance en temps réel de tous les services Flowentra." : "Real-time monitoring of all Flowentra services."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div
            className="p-6 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 mb-10 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">
                {fr ? "Tous les systèmes sont opérationnels" : "All Systems Operational"}
              </p>
              <p className="text-sm text-green-700/70 dark:text-green-400/70">
                {fr ? "Dernière vérification il y a 2 minutes" : "Last checked 2 minutes ago"}
              </p>
            </div>
          </motion.div>
          <div className="space-y-2">
            {services.map((s, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <span className="text-sm font-medium">{s.name}</span>
                <span className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {fr ? "Opérationnel" : "Operational"}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-10">
            {fr ? "Disponibilité sur les 90 derniers jours : " : "Uptime over the last 90 days: "}
            <span className="font-bold text-foreground">99.98%</span>
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default Status;
