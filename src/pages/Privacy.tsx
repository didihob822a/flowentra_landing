import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Users, Database, Globe, Mail, Trash2 } from "lucide-react";

const Privacy = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const sections = fr
    ? [
        {
          icon: Database,
          title: "1. Informations que nous collectons",
          content: [
            "Nous collectons les types d'informations suivants lorsque vous utilisez Flowentra :",
            "• **Informations de compte** : nom, adresse email, nom de l'entreprise, et mot de passe lors de l'inscription.",
            "• **Informations de profil** : photo de profil, poste, numéro de téléphone que vous choisissez de fournir.",
            "• **Données d'utilisation** : pages visitées, fonctionnalités utilisées, horodatages, adresse IP, type de navigateur et d'appareil.",
            "• **Données métier** : contacts CRM, workflows, factures et tout contenu que vous créez dans la plateforme.",
            "• **Informations de paiement** : traitées de manière sécurisée par nos processeurs de paiement tiers (Stripe). Nous ne stockons pas les numéros de carte bancaire.",
            "• **Données d'authentification Google** : si vous choisissez de vous connecter via Google, nous recevons votre nom, adresse email et photo de profil de votre compte Google. Nous accédons uniquement aux scopes que vous autorisez explicitement.",
          ],
        },
        {
          icon: Eye,
          title: "2. Comment nous utilisons vos informations",
          content: [
            "Nous utilisons vos informations pour :",
            "• Fournir, maintenir et améliorer les services Flowentra.",
            "• Créer et gérer votre compte utilisateur.",
            "• Traiter les transactions et envoyer les confirmations.",
            "• Envoyer des communications liées au service (mises à jour, alertes de sécurité, support).",
            "• Analyser les tendances d'utilisation pour améliorer l'expérience utilisateur (données agrégées et anonymisées uniquement).",
            "• Détecter, prévenir et résoudre les problèmes techniques et de sécurité.",
            "• Respecter les obligations légales.",
            "Nous n'utilisons PAS vos données Google pour de la publicité, du profilage ou toute finalité non liée à la fonctionnalité de base du service.",
          ],
        },
        {
          icon: Shield,
          title: "3. Utilisation des données Google",
          content: [
            "L'utilisation par Flowentra des informations reçues des API Google est conforme à la Politique de Données Utilisateur des Services API Google, y compris les exigences d'Utilisation Limitée.",
            "Plus précisément :",
            "• Nous accédons uniquement aux données Google nécessaires au fonctionnement de l'application (authentification et informations de profil).",
            "• Nous ne transférons pas les données Google à des tiers sauf si nécessaire pour fournir le service, avec votre consentement, ou si requis par la loi.",
            "• Nous n'utilisons pas les données Google à des fins publicitaires.",
            "• Nous permettons aux utilisateurs de révoquer l'accès à leur compte Google à tout moment via les paramètres du compte.",
            "• Les données Google sont stockées de manière sécurisée avec chiffrement au repos et en transit.",
          ],
        },
        {
          icon: Lock,
          title: "4. Stockage et sécurité des données",
          content: [
            "Nous prenons la sécurité de vos données très au sérieux :",
            "• **Chiffrement** : toutes les données sont chiffrées au repos (AES-256) et en transit (TLS 1.3).",
            "• **Infrastructure** : nos serveurs sont hébergés dans des data centers certifiés ISO 27001 en Europe.",
            "• **Contrôle d'accès** : accès strict basé sur les rôles aux données internes avec journalisation des audits.",
            "• **Sauvegardes** : sauvegardes automatiques quotidiennes avec chiffrement.",
            "• **Tests de sécurité** : tests de pénétration réguliers et audits de sécurité.",
          ],
        },
        {
          icon: Users,
          title: "5. Partage des données avec des tiers",
          content: [
            "Nous ne vendons jamais vos données personnelles. Nous pouvons partager des données avec :",
            "• **Fournisseurs de services** : fournisseurs de confiance qui nous aident à exploiter notre plateforme (hébergement cloud, traitement des paiements, envoi d'emails). Ces fournisseurs sont contractuellement tenus de protéger vos données.",
            "• **Obligations légales** : si requis par la loi, une procédure judiciaire ou une demande gouvernementale.",
            "• **Transferts d'entreprise** : en cas de fusion, acquisition ou vente d'actifs, vos données peuvent être transférées (vous serez notifié).",
            "• **Avec votre consentement** : pour toute autre finalité avec votre consentement explicite.",
          ],
        },
        {
          icon: Globe,
          title: "6. Conservation des données",
          content: [
            "• Nous conservons vos données de compte tant que votre compte est actif.",
            "• Après suppression du compte, nous supprimons ou anonymisons vos données personnelles dans les 30 jours.",
            "• Certaines données peuvent être conservées plus longtemps si requis par la loi ou à des fins comptables légitimes.",
            "• Les données d'utilisation sont anonymisées après 12 mois.",
          ],
        },
        {
          icon: Trash2,
          title: "7. Vos droits (RGPD)",
          content: [
            "Conformément au RGPD et aux lois tunisiennes sur la protection des données, vous avez le droit de :",
            "• **Accéder** à vos données personnelles que nous détenons.",
            "• **Rectifier** les données inexactes ou incomplètes.",
            "• **Supprimer** vos données personnelles (« droit à l'oubli »).",
            "• **Exporter** vos données dans un format portable.",
            "• **Révoquer** l'accès à votre compte Google à tout moment.",
            "• **Vous opposer** à certains traitements de données.",
            "Pour exercer ces droits, contactez-nous à privacy@flowentra.com. Nous répondrons dans les 30 jours.",
          ],
        },
        {
          icon: Mail,
          title: "8. Cookies et suivi",
          content: [
            "• **Cookies essentiels** : nécessaires au fonctionnement du service (authentification de session, préférences).",
            "• **Cookies analytiques** : utilisés avec votre consentement pour comprendre l'utilisation et améliorer nos services. Nous utilisons des analyses auto-hébergées respectueuses de la vie privée.",
            "• Nous n'utilisons PAS de cookies de suivi publicitaire ou de pixels de reciblage.",
            "• Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur.",
          ],
        },
      ]
    : [
        {
          icon: Database,
          title: "1. Information We Collect",
          content: [
            "We collect the following types of information when you use Flowentra:",
            "• **Account information**: name, email address, company name, and password when you sign up.",
            "• **Profile information**: profile photo, job title, phone number that you choose to provide.",
            "• **Usage data**: pages visited, features used, timestamps, IP address, browser type, and device type.",
            "• **Business data**: CRM contacts, workflows, invoices, and any content you create within the platform.",
            "• **Payment information**: processed securely by our third-party payment processors (Stripe). We do not store credit card numbers.",
            "• **Google authentication data**: if you choose to sign in with Google, we receive your name, email address, and profile picture from your Google account. We only access the scopes you explicitly authorize.",
          ],
        },
        {
          icon: Eye,
          title: "2. How We Use Your Information",
          content: [
            "We use your information to:",
            "• Provide, maintain, and improve Flowentra services.",
            "• Create and manage your user account.",
            "• Process transactions and send confirmations.",
            "• Send service-related communications (updates, security alerts, support).",
            "• Analyze usage trends to improve user experience (aggregated and anonymized data only).",
            "• Detect, prevent, and address technical and security issues.",
            "• Comply with legal obligations.",
            "We do NOT use your Google data for advertising, profiling, or any purpose unrelated to the core service functionality.",
          ],
        },
        {
          icon: Shield,
          title: "3. Google API Services User Data Policy",
          content: [
            "Flowentra's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
            "Specifically:",
            "• We only access Google data that is necessary for the application to function (authentication and profile information).",
            "• We do not transfer Google data to third parties unless necessary to provide the service, with your consent, or as required by law.",
            "• We do not use Google data for advertising purposes.",
            "• We allow users to revoke access to their Google account at any time through account settings.",
            "• Google data is stored securely with encryption at rest and in transit.",
          ],
        },
        {
          icon: Lock,
          title: "4. Data Storage & Security",
          content: [
            "We take the security of your data very seriously:",
            "• **Encryption**: all data is encrypted at rest (AES-256) and in transit (TLS 1.3).",
            "• **Infrastructure**: our servers are hosted in ISO 27001 certified data centers in Europe.",
            "• **Access control**: strict role-based access to internal data with audit logging.",
            "• **Backups**: automatic daily backups with encryption.",
            "• **Security testing**: regular penetration testing and security audits.",
          ],
        },
        {
          icon: Users,
          title: "5. Third-Party Data Sharing",
          content: [
            "We never sell your personal data. We may share data with:",
            "• **Service providers**: trusted vendors who help us operate our platform (cloud hosting, payment processing, email delivery). These providers are contractually required to protect your data.",
            "• **Legal requirements**: if required by law, legal process, or government request.",
            "• **Business transfers**: in the event of a merger, acquisition, or sale of assets, your data may be transferred (you will be notified).",
            "• **With your consent**: for any other purpose with your explicit consent.",
          ],
        },
        {
          icon: Globe,
          title: "6. Data Retention",
          content: [
            "• We retain your account data for as long as your account is active.",
            "• After account deletion, we delete or anonymize your personal data within 30 days.",
            "• Some data may be retained longer if required by law or for legitimate accounting purposes.",
            "• Usage data is anonymized after 12 months.",
          ],
        },
        {
          icon: Trash2,
          title: "7. Your Rights (GDPR)",
          content: [
            "Under the GDPR and Tunisian data protection laws, you have the right to:",
            "• **Access** your personal data that we hold.",
            "• **Rectify** inaccurate or incomplete data.",
            "• **Delete** your personal data ('right to be forgotten').",
            "• **Export** your data in a portable format.",
            "• **Revoke** access to your Google account at any time.",
            "• **Object** to certain data processing.",
            "To exercise these rights, contact us at privacy@flowentra.com. We will respond within 30 days.",
          ],
        },
        {
          icon: Mail,
          title: "8. Cookies & Tracking",
          content: [
            "• **Essential cookies**: required for the service to function (session authentication, preferences).",
            "• **Analytics cookies**: used with your consent to understand usage and improve our services. We use privacy-friendly, self-hosted analytics.",
            "• We do NOT use advertising tracking cookies or retargeting pixels.",
            "• You can manage your cookie preferences at any time through your browser settings.",
          ],
        },
      ];

  const renderContent = (text: string) => {
    // Bold markdown
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-foreground">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <PageLayout
      title={fr ? "Politique de Confidentialité" : "Privacy Policy"}
      subtitle={
        fr
          ? "Dernière mise à jour : 1er février 2026 · Flowentra s'engage à protéger votre vie privée et vos données."
          : "Last updated: February 1, 2026 · Flowentra is committed to protecting your privacy and data."
      }
    >
      {/* Quick summary banner */}
      <section className="border-b border-border bg-primary/3">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {fr
                ? "En résumé : nous collectons uniquement les données nécessaires au fonctionnement de notre service, nous ne vendons jamais vos données, nous respectons le RGPD, et notre utilisation des données Google est conforme à la Politique de Données Utilisateur des Services API Google."
                : "In summary: we only collect data necessary for our service to function, we never sell your data, we comply with GDPR, and our use of Google data adheres to the Google API Services User Data Policy."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="space-y-10 sm:space-y-12">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">{s.title}</h2>
                  </div>
                  <div className="pl-12 space-y-2">
                    {s.content.map((line, li) => (
                      <p
                        key={li}
                        className={`text-sm leading-relaxed ${
                          line.startsWith("•")
                            ? "text-muted-foreground pl-2"
                            : "text-muted-foreground"
                        }`}
                      >
                        {renderContent(line)}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact & Changes section */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-border space-y-8">
            <div>
              <h2 className="text-lg font-bold mb-3">
                {fr ? "9. Modifications de cette politique" : "9. Changes to This Policy"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {fr
                  ? "Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement significatif par email ou via une notification dans l'application au moins 30 jours avant l'entrée en vigueur des modifications."
                  : "We may update this privacy policy from time to time. We will notify you of any significant changes via email or in-app notification at least 30 days before the changes take effect."}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3">
                {fr ? "10. Nous contacter" : "10. Contact Us"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {fr
                  ? "Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques de traitement des données, veuillez nous contacter :"
                  : "If you have any questions about this privacy policy or our data handling practices, please contact us:"}
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:privacy@flowentra.com" className="text-primary hover:underline">
                    privacy@flowentra.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold">{fr ? "Adresse" : "Address"}:</span> Lac, Tunis, Tunisia
                </p>
                <p>
                  <span className="font-semibold">{fr ? "Téléphone" : "Phone"}:</span> +216 29 249 512
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                {fr ? "Voir aussi : " : "See also: "}
                <Link to="/terms" className="text-primary hover:underline">
                  {fr ? "Conditions d'utilisation" : "Terms of Service"}
                </Link>
                {" · "}
                <Link to="/security" className="text-primary hover:underline">
                  {fr ? "Sécurité" : "Security"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Privacy;
