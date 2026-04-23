import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Careers = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const positions = fr
    ? [
        { title: "Ingénieur Full Stack Senior", dept: "Ingénierie", location: "Tunis / Remote", type: "CDI" },
        { title: "Product Designer", dept: "Design", location: "Tunis", type: "CDI" },
        { title: "Responsable Customer Success", dept: "Client", location: "Tunis / Remote", type: "CDI" },
        { title: "Développeur Mobile React Native", dept: "Ingénierie", location: "Remote", type: "CDI" },
        { title: "Business Developer", dept: "Commercial", location: "Tunis / Paris", type: "CDI" },
      ]
    : [
        { title: "Senior Full Stack Engineer", dept: "Engineering", location: "Tunis / Remote", type: "Full-time" },
        { title: "Product Designer", dept: "Design", location: "Tunis", type: "Full-time" },
        { title: "Customer Success Manager", dept: "Customer", location: "Tunis / Remote", type: "Full-time" },
        { title: "React Native Mobile Developer", dept: "Engineering", location: "Remote", type: "Full-time" },
        { title: "Business Developer", dept: "Sales", location: "Tunis / Paris", type: "Full-time" },
      ];

  return (
    <PageLayout
      title={fr ? "Carrières" : "Careers"}
      subtitle={fr ? "Rejoignez une équipe passionnée qui transforme la gestion d'entreprise." : "Join a passionate team transforming business management."}
    >
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="space-y-3">
            {positions.map((pos, i) => (
              <motion.div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <div>
                  <h3 className="font-semibold text-[15px] group-hover:text-primary transition-colors">{pos.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{pos.dept} · {pos.location}</p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full mt-3 sm:mt-0 w-fit">{pos.type}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-12">
            {fr ? "Vous ne trouvez pas votre poste ? Envoyez-nous une candidature spontanée à " : "Don't see your role? Send us a spontaneous application at "}
            <a href="mailto:careers@flowentra.com" className="text-primary font-medium hover:underline">careers@flowentra.com</a>
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default Careers;
