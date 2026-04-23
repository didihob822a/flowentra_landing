import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { CreditCard, UserPlus, Users, Rocket } from "lucide-react";

const stepIcons = [CreditCard, UserPlus, Users, Rocket];

const defaultSteps: Record<string, { title: string; items: { title: string; desc: string }[] }> = {
  en: { title: "Your First Steps with Flowentra", items: [
    { title: "Choose Your Plan", desc: "Start with a 14-day free trial — no credit card required." },
    { title: "Set Up Your Workspace", desc: "Configure your administrator profile and dashboard in seconds." },
    { title: "Invite Your Team", desc: "Add team members, assign roles, and start collaborating." },
    { title: "Start Optimizing", desc: "Automate processes and focus on growth." },
  ]},
  fr: { title: "Vos premiers pas avec Flowentra", items: [
    { title: "Choisissez votre plan", desc: "Commencez avec un essai gratuit de 14 jours — sans carte bancaire." },
    { title: "Configurez votre espace", desc: "Créez votre profil administrateur et personnalisez votre tableau de bord." },
    { title: "Invitez votre équipe", desc: "Ajoutez vos collaborateurs, attribuez des rôles et commencez à travailler." },
    { title: "Optimisez votre travail", desc: "Automatisez vos processus et concentrez-vous sur la croissance." },
  ]},
  de: { title: "Ihre ersten Schritte mit Flowentra", items: [
    { title: "Plan wählen", desc: "14-tägige kostenlose Testversion — keine Kreditkarte erforderlich." },
    { title: "Workspace einrichten", desc: "Administratorprofil und Dashboard in Sekunden konfigurieren." },
    { title: "Team einladen", desc: "Teammitglieder hinzufügen, Rollen zuweisen und zusammenarbeiten." },
    { title: "Optimieren starten", desc: "Prozesse automatisieren und auf Wachstum konzentrieren." },
  ]},
  ar: { title: "خطواتك الأولى مع Flowentra", items: [
    { title: "اختر خطتك", desc: "ابدأ بتجربة مجانية لمدة 14 يومًا — بدون بطاقة ائتمان." },
    { title: "أعد مساحة العمل", desc: "قم بإعداد ملفك الشخصي ولوحة التحكم في ثوانٍ." },
    { title: "أضف فريقك", desc: "أضف أعضاء الفريق وعيّن الأدوار وابدأ التعاون." },
    { title: "ابدأ التحسين", desc: "أتمت العمليات وركّز على النمو." },
  ]},
};

const HowItWorks = () => {
  const { lang } = useLanguage();
  const defaults = defaultSteps[lang] || defaultSteps.en;
  const cms = useCmsSection("howItWorks", lang, defaults);

  const items = cms.items || [];

  return (
    <section className="py-20 sm:py-28 lg:py-36 bg-muted/30">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.h2
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-center mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          {cms.title}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 max-w-4xl mx-auto">
          {items.map((step: any, i: number) => {
            const Icon = stepIcons[i % stepIcons.length];
            return (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="relative mx-auto w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-[15px] mb-1.5">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
