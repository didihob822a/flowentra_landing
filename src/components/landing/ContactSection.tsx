import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const contactIcons = [Mail, Phone, MapPin, Clock];

const ContactSection = () => {
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const de = lang === "de";
  const ar = lang === "ar";

  const defaults = {
    title: fr ? "Parlons de votre projet" : de ? "Sprechen wir über Ihr Projekt" : ar ? "لنتحدث عن مشروعك" : "Let's Talk About Your Project",
    subtitle: fr
      ? "Notre équipe est disponible pour répondre à vos questions et vous accompagner."
      : de
      ? "Unser Team steht bereit, um Ihre Fragen zu beantworten."
      : ar
      ? "فريقنا متاح للإجابة على أسئلتكم"
      : "Our team is ready to answer your questions and help you get started.",
    firstName: fr ? "Prénom" : de ? "Vorname" : ar ? "الاسم الأول" : "First Name",
    lastName: fr ? "Nom" : de ? "Nachname" : ar ? "اسم العائلة" : "Last Name",
    email: "Email",
    company: fr ? "Entreprise" : de ? "Unternehmen" : ar ? "الشركة" : "Company",
    message: "Message",
    send: fr ? "Envoyer" : de ? "Absenden" : ar ? "إرسال" : "Send Message",
    info: [
      { label: fr ? "Email" : de ? "E-Mail" : "Email", value: "contact@flowentra.io" },
      { label: fr ? "Téléphone" : de ? "Telefon" : ar ? "الهاتف" : "Phone", value: "+216 29 249 512" },
      { label: fr ? "Siège Social" : de ? "Hauptsitz" : ar ? "المقر الرئيسي" : "Headquarters", value: fr ? "Lac, Tunis, Tunisie" : de ? "Lac, Tunis, Tunesien" : "Lac, Tunis, Tunisia" },
      { label: fr ? "Horaires" : de ? "Öffnungszeiten" : ar ? "ساعات العمل" : "Business Hours", value: fr ? "Lun – Ven, 9h – 18h (CET)" : de ? "Mo – Fr, 9 – 18 Uhr (MEZ)" : "Mon – Fri, 9AM – 6PM (CET)" },
    ],
  };

  const cms = useCmsSection("contact", lang, defaults as Record<string, any>) as Record<string, any>;
  const t = { ...defaults, ...cms, info: Array.isArray(cms.info) && cms.info.length ? cms.info : defaults.info };

  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", company: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32 bg-card border-t border-border">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8">
        <motion.div
          className="max-w-2xl mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">{t.title}</h2>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{t.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 sm:gap-16 max-w-6xl">
          <motion.form
            className="lg:col-span-3 space-y-4 sm:space-y-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block text-foreground">{t.firstName}</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block text-foreground">{t.lastName}</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block text-foreground">{t.email}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block text-foreground">{t.company}</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block text-foreground">{t.message}</label>
              <textarea name="message" rows={4} value={formData.message} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
            <button type="submit"
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 w-full sm:w-auto justify-center">
              <Send className="w-4 h-4" />
              {t.send}
            </button>
          </motion.form>

          <motion.div
            className="lg:col-span-2 space-y-6 sm:space-y-8 lg:pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t.info.map((item, i) => {
              const Icon = contactIcons[i];
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
