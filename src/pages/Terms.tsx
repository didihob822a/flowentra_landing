import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const sections = fr
    ? [
        { title: "1. Acceptation des Conditions", content: "En accédant à Flowentra, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service." },
        { title: "2. Description du Service", content: "Flowentra est une plateforme de gestion d'entreprise tout-en-un proposant des modules CRM, automatisation, analytique, facturation et autres outils de productivité." },
        { title: "3. Comptes Utilisateurs", content: "Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte." },
        { title: "4. Propriété Intellectuelle", content: "Le contenu, les marques et le code source de Flowentra sont protégés par le droit d'auteur. Toute reproduction non autorisée est interdite." },
        { title: "5. Limitation de Responsabilité", content: "Flowentra est fourni « tel quel ». Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs, bien que nous nous engageons à maintenir une disponibilité de 99.9%." },
        { title: "6. Résiliation", content: "Vous pouvez résilier votre compte à tout moment. En cas de violation de ces conditions, nous nous réservons le droit de suspendre ou résilier votre accès." },
        { title: "7. Loi Applicable", content: "Ces conditions sont régies par le droit tunisien. Tout litige sera soumis à la compétence exclusive des tribunaux de Tunis." },
      ]
    : [
        { title: "1. Acceptance of Terms", content: "By accessing Flowentra, you agree to be bound by these terms of service. If you do not accept these terms, please do not use our service." },
        { title: "2. Service Description", content: "Flowentra is an all-in-one business management platform offering CRM, automation, analytics, invoicing, and other productivity tools." },
        { title: "3. User Accounts", content: "You are responsible for the confidentiality of your login credentials and all activities performed under your account." },
        { title: "4. Intellectual Property", content: "Flowentra's content, trademarks, and source code are protected by copyright law. Any unauthorized reproduction is prohibited." },
        { title: "5. Limitation of Liability", content: "Flowentra is provided 'as is'. We do not guarantee the service will be uninterrupted or error-free, though we commit to maintaining 99.9% uptime." },
        { title: "6. Termination", content: "You may terminate your account at any time. In case of violation of these terms, we reserve the right to suspend or terminate your access." },
        { title: "7. Governing Law", content: "These terms are governed by Tunisian law. Any dispute shall be submitted to the exclusive jurisdiction of the courts of Tunis." },
      ];

  return (
    <PageLayout
      title={fr ? "Conditions d'Utilisation" : "Terms of Service"}
      subtitle={fr ? "Dernière mise à jour : 1er février 2026" : "Last updated: February 1, 2026"}
    >
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="space-y-10">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold mb-3">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Terms;
