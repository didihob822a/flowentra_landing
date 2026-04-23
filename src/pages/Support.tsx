import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Support = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const channels = fr
    ? [
        { title: "Centre d'Aide", desc: "Consultez nos guides et tutoriels détaillés.", icon: "📚", link: "/docs" },
        { title: "Email Support", desc: "Contactez notre équipe à support@flowentra.com.", icon: "✉", link: "mailto:support@flowentra.com" },
        { title: "Chat en Direct", desc: "Discutez avec un agent en temps réel (Lun-Ven, 9h-18h).", icon: "💬", link: "#" },
        { title: "Communauté", desc: "Échangez avec d'autres utilisateurs Flowentra.", icon: "👥", link: "#" },
      ]
    : [
        { title: "Help Center", desc: "Browse our detailed guides and tutorials.", icon: "📚", link: "/docs" },
        { title: "Email Support", desc: "Reach our team at support@flowentra.com.", icon: "✉", link: "mailto:support@flowentra.com" },
        { title: "Live Chat", desc: "Chat with an agent in real time (Mon-Fri, 9AM-6PM).", icon: "💬", link: "#" },
        { title: "Community", desc: "Connect with other Flowentra users.", icon: "👥", link: "#" },
      ];

  return (
    <PageLayout title="Support" subtitle={fr ? "Nous sommes là pour vous aider à réussir." : "We're here to help you succeed."}>
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {channels.map((ch, i) => (
              <motion.a
                key={i}
                href={ch.link}
                className="p-7 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <span className="text-2xl mb-4 block">{ch.icon}</span>
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{ch.title}</h3>
                <p className="text-sm text-muted-foreground">{ch.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Support;
