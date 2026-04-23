import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Blog = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const posts = fr
    ? [
        { title: "Comment Flowentra réduit vos coûts opérationnels de 40%", category: "Produit", date: "12 Fév 2026", excerpt: "Découvrez comment nos clients optimisent leurs processus et réduisent significativement leurs dépenses." },
        { title: "Les 5 tendances ERP à surveiller en 2026", category: "Industrie", date: "8 Fév 2026", excerpt: "Intelligence artificielle, low-code, et intégrations natives : ce qui transforme le marché ERP cette année." },
        { title: "Guide : Migrer vers Flowentra en 2 semaines", category: "Guide", date: "1 Fév 2026", excerpt: "Un guide étape par étape pour une migration réussie depuis votre solution actuelle." },
        { title: "Nouveau : Module Factures & Devis", category: "Mise à jour", date: "25 Jan 2026", excerpt: "Créez, envoyez et suivez vos factures et devis professionnels directement depuis Flowentra." },
        { title: "Sécurité et conformité : notre engagement", category: "Sécurité", date: "18 Jan 2026", excerpt: "Comment nous protégeons vos données avec un chiffrement de bout en bout et une conformité RGPD." },
        { title: "Témoignage : Vermeg transforme ses opérations", category: "Cas client", date: "10 Jan 2026", excerpt: "Comment Vermeg a unifié 4 outils en un seul avec Flowentra et gagné en productivité." },
      ]
    : [
        { title: "How Flowentra Reduces Your Operational Costs by 40%", category: "Product", date: "Feb 12, 2026", excerpt: "Discover how our clients optimize their processes and significantly reduce their expenses." },
        { title: "5 ERP Trends to Watch in 2026", category: "Industry", date: "Feb 8, 2026", excerpt: "AI, low-code, and native integrations: what's transforming the ERP market this year." },
        { title: "Guide: Migrate to Flowentra in 2 Weeks", category: "Guide", date: "Feb 1, 2026", excerpt: "A step-by-step guide for a successful migration from your current solution." },
        { title: "New: Invoices & Quotes Module", category: "Update", date: "Jan 25, 2026", excerpt: "Create, send, and track professional invoices and quotes directly from Flowentra." },
        { title: "Security & Compliance: Our Commitment", category: "Security", date: "Jan 18, 2026", excerpt: "How we protect your data with end-to-end encryption and GDPR compliance." },
        { title: "Case Study: Vermeg Transforms Its Operations", category: "Case Study", date: "Jan 10, 2026", excerpt: "How Vermeg unified 4 tools into one with Flowentra and boosted productivity." },
      ];

  return (
    <PageLayout title="Blog" subtitle={fr ? "Actualités, guides et tendances pour votre entreprise." : "News, guides, and trends for your business."}>
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post, i) => (
              <motion.article
                key={i}
                className="group rounded-xl border border-border bg-card p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-4">{post.category}</span>
                <h3 className="font-bold text-[15px] mb-3 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground/60 mt-5 pt-4 border-t border-border">{post.date}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Blog;
