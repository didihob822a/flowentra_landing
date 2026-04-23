import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Contact = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  return (
    <PageLayout
      title={fr ? "Nous Contacter" : "Contact Us"}
      subtitle={fr ? "Notre équipe est là pour répondre à toutes vos questions." : "Our team is here to answer all your questions."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{fr ? "Prénom" : "First Name"}</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{fr ? "Nom" : "Last Name"}</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{fr ? "Entreprise" : "Company"}</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                </div>
                <button type="submit" className="w-full px-6 py-3.5 rounded-lg font-semibold text-sm gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                  {fr ? "Envoyer le message" : "Send Message"}
                </button>
              </form>
            </motion.div>
            <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              {(fr
                ? [
                    { title: "Email", value: "contact@flowentra.io", icon: "✉" },
                    { title: "Téléphone", value: "+216 29 249 512", icon: "📞" },
                    { title: "Siège Social", value: "Lac, Tunis, Tunisie", icon: "📍" },
                    { title: "Site Web", value: "flowentra.io", icon: "🌐" },
                    { title: "Application", value: "flowentra.app", icon: "💻" },
                    { title: "Horaires", value: "Lun - Ven, 9h - 18h (CET)", icon: "🕐" },
                  ]
                : [
                    { title: "Email", value: "contact@flowentra.io", icon: "✉" },
                    { title: "Phone", value: "+216 29 249 512", icon: "📞" },
                    { title: "Headquarters", value: "Lac, Tunis, Tunisia", icon: "📍" },
                    { title: "Website", value: "flowentra.io", icon: "🌐" },
                    { title: "Application", value: "flowentra.app", icon: "💻" },
                    { title: "Hours", value: "Mon - Fri, 9AM - 6PM (CET)", icon: "🕐" },
                  ]
              ).map((info, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">{info.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{info.title}</h3>
                    <p className="text-sm text-muted-foreground">{info.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Contact;
