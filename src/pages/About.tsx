import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const About = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  return (
    <PageLayout
      title={fr ? "À propos de Flowentra" : "About Flowentra"}
      subtitle={fr ? "Nous construisons la prochaine génération de logiciels de gestion d'entreprise." : "We're building the next generation of enterprise management software."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold mb-6">{fr ? "Notre Mission" : "Our Mission"}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {fr
                  ? "Flowentra est née d'une conviction simple : les entreprises méritent des outils aussi performants que ceux des grandes multinationales, mais accessibles et faciles à utiliser."
                  : "Flowentra was born from a simple belief: businesses deserve tools as powerful as those used by major corporations, yet accessible and easy to use."}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {fr
                  ? "Nous développons une plateforme tout-en-un qui réunit CRM, automatisation, analytique et intelligence artificielle pour permettre aux entreprises de se concentrer sur l'essentiel : leur croissance."
                  : "We develop an all-in-one platform that unifies CRM, automation, analytics, and AI to empower businesses to focus on what matters most: their growth."}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
              <h2 className="text-2xl font-bold mb-6">{fr ? "Nos Valeurs" : "Our Values"}</h2>
              <div className="space-y-5">
                {(fr
                  ? [
                      { title: "Innovation", desc: "Nous repoussons les limites de la technologie pour offrir des solutions avant-gardistes." },
                      { title: "Simplicité", desc: "La puissance sans la complexité. Nos outils sont intuitifs dès le premier jour." },
                      { title: "Fiabilité", desc: "99.9% de disponibilité. Vos données sont sécurisées et toujours accessibles." },
                      { title: "Proximité", desc: "Un support dédié et une écoute active de nos clients à chaque étape." },
                    ]
                  : [
                      { title: "Innovation", desc: "We push technology boundaries to deliver cutting-edge solutions." },
                      { title: "Simplicity", desc: "Power without complexity. Our tools are intuitive from day one." },
                      { title: "Reliability", desc: "99.9% uptime. Your data is secure and always accessible." },
                      { title: "Proximity", desc: "Dedicated support and active listening to our clients at every step." },
                    ]
                ).map((v, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 pt-16 border-t border-border" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            {[
              { value: "2026", label: fr ? "Fondée" : "Founded" },
              { value: "50+", label: fr ? "Employés" : "Employees" },
              { value: "2,500+", label: fr ? "Clients" : "Clients" },
              { value: "150+", label: fr ? "Pays" : "Countries" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-extrabold text-primary mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
