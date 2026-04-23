import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Integrations = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const integrations = [
    { name: "Gmail", category: "Email", letters: "GM" },
    { name: "Outlook", category: "Email", letters: "OL" },
    { name: "Slack", category: fr ? "Communication" : "Communication", letters: "SL" },
    { name: "Zapier", category: fr ? "Automatisation" : "Automation", letters: "ZP" },
    { name: "Stripe", category: fr ? "Paiement" : "Payment", letters: "ST" },
    { name: "Google Drive", category: fr ? "Stockage" : "Storage", letters: "GD" },
    { name: "Dropbox", category: fr ? "Stockage" : "Storage", letters: "DB" },
    { name: "HubSpot", category: "CRM", letters: "HS" },
    { name: "Salesforce", category: "CRM", letters: "SF" },
    { name: "QuickBooks", category: fr ? "Comptabilité" : "Accounting", letters: "QB" },
    { name: "Xero", category: fr ? "Comptabilité" : "Accounting", letters: "XR" },
    { name: "Twilio", category: "SMS", letters: "TW" },
    { name: "WhatsApp Business", category: fr ? "Messagerie" : "Messaging", letters: "WA" },
    { name: "Microsoft Teams", category: fr ? "Communication" : "Communication", letters: "MT" },
    { name: "Jira", category: fr ? "Gestion de projet" : "Project Mgmt", letters: "JR" },
    { name: "REST API", category: fr ? "Développeur" : "Developer", letters: "AP" },
  ];

  return (
    <PageLayout
      title={fr ? "Intégrations" : "Integrations"}
      subtitle={fr ? "Connectez Flowentra à vos outils préférés pour un workflow unifié." : "Connect Flowentra to your favorite tools for a unified workflow."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {integrations.map((int, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  {int.letters}
                </div>
                <h3 className="font-semibold text-sm mb-1">{int.name}</h3>
                <p className="text-xs text-muted-foreground">{int.category}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Integrations;
