import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Check, CreditCard, Shield, ArrowLeft, Lock, Star, RefreshCw, BadgeCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import konnektIcon from "@/assets/integrations/konnekt.png";

// ──────────── i18n ────────────
const checkoutTranslations = {
  en: {
    back: "Back to Pricing",
    selectPlan: "Choose Your Plan",
    yourInfo: "Account Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Work Email",
    company: "Company Name",
    phone: "Phone Number (optional)",
    country: "Country",
    paymentInfo: "Payment Details",
    cardNumber: "Card Number",
    expiry: "Expiry",
    cvv: "CVV",
    cardHolder: "Name on Card",
    orderSummary: "Order Summary",
    plan: "Plan",
    billing: "Billing Cycle",
    monthlyBilling: "Monthly",
    annualBilling: "Annual",
    annualSave: "Save 20%",
    subtotal: "Subtotal",
    tax: "VAT (19%)",
    total: "Total due today",
    perMonth: "/mo",
    perYear: "/yr",
    subscribe: "Start Subscription",
    secure: "256-bit SSL secured",
    guarantee: "14-day money-back guarantee",
    noCC: "Cancel anytime. No hidden fees.",
    terms: "By subscribing you agree to our",
    termsLink: "Terms of Service",
    and: "and",
    privacyLink: "Privacy Policy",
    successTitle: "You're all set! 🎉",
    successMsg: "Your subscription is now active. Check your inbox for confirmation.",
    popular: "Most Popular",
    currency: "TND",
    countries: ["Tunisia", "Algeria", "Morocco", "Libya", "Egypt", "France", "Germany", "Other"],
    required: "Required",
    invalidEmail: "Enter a valid email",
    step1: "1. Your Info",
    step2: "2. Payment",
    trustTitle: "Trusted by 500+ businesses",
    moneyBack: "Money-back guarantee",
    cancelAnytime: "Cancel anytime",
    instantAccess: "Instant access",
    securedBy: "Secured by",
  },
  fr: {
    back: "Retour aux tarifs",
    selectPlan: "Choisissez votre plan",
    yourInfo: "Informations du compte",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email professionnel",
    company: "Nom de l'entreprise",
    phone: "Téléphone (optionnel)",
    country: "Pays",
    paymentInfo: "Informations de paiement",
    cardNumber: "Numéro de carte",
    expiry: "Expiration",
    cvv: "CVV",
    cardHolder: "Nom sur la carte",
    orderSummary: "Récapitulatif",
    plan: "Plan",
    billing: "Facturation",
    monthlyBilling: "Mensuelle",
    annualBilling: "Annuelle",
    annualSave: "Économisez 20%",
    subtotal: "Sous-total",
    tax: "TVA (19%)",
    total: "Total à payer",
    perMonth: "/mois",
    perYear: "/an",
    subscribe: "Démarrer l'abonnement",
    secure: "Chiffrement SSL 256 bits",
    guarantee: "Garantie 14 jours satisfait ou remboursé",
    noCC: "Résiliable à tout moment. Sans frais cachés.",
    terms: "En vous abonnant, vous acceptez nos",
    termsLink: "Conditions d'utilisation",
    and: "et",
    privacyLink: "Politique de confidentialité",
    successTitle: "C'est parti ! 🎉",
    successMsg: "Votre abonnement est actif. Vérifiez votre boîte mail.",
    popular: "Le plus populaire",
    currency: "TND",
    countries: ["Tunisie", "Algérie", "Maroc", "Libye", "Égypte", "France", "Allemagne", "Autre"],
    required: "Requis",
    invalidEmail: "Email invalide",
    step1: "1. Vos infos",
    step2: "2. Paiement",
    trustTitle: "Plus de 500 entreprises nous font confiance",
    moneyBack: "Garantie remboursement",
    cancelAnytime: "Résiliable à tout moment",
    instantAccess: "Accès instantané",
    securedBy: "Sécurisé par",
  },
  de: {
    back: "Zurück zu den Preisen",
    selectPlan: "Plan wählen",
    yourInfo: "Kontoinformationen",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "Geschäftliche E-Mail",
    company: "Firmenname",
    phone: "Telefon (optional)",
    country: "Land",
    paymentInfo: "Zahlungsdetails",
    cardNumber: "Kartennummer",
    expiry: "Ablauf",
    cvv: "CVV",
    cardHolder: "Name auf der Karte",
    orderSummary: "Bestellübersicht",
    plan: "Plan",
    billing: "Abrechnungszyklus",
    monthlyBilling: "Monatlich",
    annualBilling: "Jährlich",
    annualSave: "20% sparen",
    subtotal: "Zwischensumme",
    tax: "MwSt. (19%)",
    total: "Heute fälliger Betrag",
    perMonth: "/Mo",
    perYear: "/Jahr",
    subscribe: "Abonnement starten",
    secure: "256-Bit-SSL-gesichert",
    guarantee: "14-Tage-Geld-zurück-Garantie",
    noCC: "Jederzeit kündbar. Keine versteckten Gebühren.",
    terms: "Mit dem Abonnement akzeptieren Sie unsere",
    termsLink: "Nutzungsbedingungen",
    and: "und",
    privacyLink: "Datenschutzrichtlinie",
    successTitle: "Geschafft! 🎉",
    successMsg: "Ihr Abonnement ist aktiv. Prüfen Sie Ihren Posteingang.",
    popular: "Am beliebtesten",
    currency: "TND",
    countries: ["Tunesien", "Algerien", "Marokko", "Libyen", "Ägypten", "Frankreich", "Deutschland", "Andere"],
    required: "Pflichtfeld",
    invalidEmail: "Ungültige E-Mail",
    step1: "1. Ihre Daten",
    step2: "2. Zahlung",
    trustTitle: "Über 500 Unternehmen vertrauen uns",
    moneyBack: "Geld-zurück-Garantie",
    cancelAnytime: "Jederzeit kündbar",
    instantAccess: "Sofortiger Zugang",
    securedBy: "Gesichert durch",
  },
  ar: {
    back: "العودة إلى الأسعار",
    selectPlan: "اختر خطتك",
    yourInfo: "معلومات الحساب",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد المهني",
    company: "اسم الشركة",
    phone: "الهاتف (اختياري)",
    country: "الدولة",
    paymentInfo: "تفاصيل الدفع",
    cardNumber: "رقم البطاقة",
    expiry: "تاريخ الانتهاء",
    cvv: "CVV",
    cardHolder: "الاسم على البطاقة",
    orderSummary: "ملخص الطلب",
    plan: "الخطة",
    billing: "دورة الفوترة",
    monthlyBilling: "شهرية",
    annualBilling: "سنوية",
    annualSave: "وفّر 20%",
    subtotal: "المجموع الفرعي",
    tax: "ضريبة (19%)",
    total: "المبلغ المستحق اليوم",
    perMonth: "/شهر",
    perYear: "/سنة",
    subscribe: "ابدأ الاشتراك",
    secure: "مؤمّن بتشفير SSL 256 بت",
    guarantee: "ضمان استرداد الأموال 14 يومًا",
    noCC: "إلغاء في أي وقت. بدون رسوم مخفية.",
    terms: "بالاشتراك، أنت توافق على",
    termsLink: "شروط الخدمة",
    and: "و",
    privacyLink: "سياسة الخصوصية",
    successTitle: "تم بنجاح! 🎉",
    successMsg: "اشتراكك نشط الآن. تحقق من بريدك الإلكتروني.",
    popular: "الأكثر شعبية",
    currency: "د.ت",
    countries: ["تونس", "الجزائر", "المغرب", "ليبيا", "مصر", "فرنسا", "ألمانيا", "أخرى"],
    required: "مطلوب",
    invalidEmail: "بريد إلكتروني غير صالح",
    step1: "١. معلوماتك",
    step2: "٢. الدفع",
    trustTitle: "يثق بنا أكثر من 500 شركة",
    moneyBack: "ضمان استرداد الأموال",
    cancelAnytime: "إلغاء في أي وقت",
    instantAccess: "وصول فوري",
    securedBy: "مؤمّن بواسطة",
  },
};

// ──────────── Plans ────────────
const plans = [
  { id: "starter",      price: 49,  annualPrice: 470,  color: "hsl(var(--muted-foreground))" },
  { id: "professional", price: 149, annualPrice: 1430, popular: true, color: "hsl(var(--primary))" },
  { id: "enterprise",   price: 349, annualPrice: 3350, color: "hsl(var(--accent))" },
];

// ──────────── Card brand detector ────────────
const detectBrand = (num: string) => {
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]|^2[2-7]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  return null;
};

// ──────────── Trust badges ────────────
const TrustBadge = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-1.5 text-center">
    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
      {icon}
    </div>
    <span className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
  </div>
);

// ──────────── Main component ────────────
const Checkout = () => {
  const { lang, tr } = useLanguage();
  const ct = checkoutTranslations[lang as keyof typeof checkoutTranslations] || checkoutTranslations.en;
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get("plan") || "professional";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [annual, setAnnual] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardBrand, setCardBrand] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", company: "",
    phone: "", country: "", cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Format card number
    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
      setCardBrand(detectBrand(value));
    }
    // Format expiry
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    // CVV digits only
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 4);

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const required = ["firstName", "lastName", "email", "company", "country", "cardNumber", "expiry", "cvv", "cardHolder"];
    required.forEach((f) => { if (!form[f as keyof typeof form].trim()) newErrors[f] = ct.required; });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = ct.invalidEmail;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    toast.success(ct.successTitle);
  };

  const activePlan = plans.find((p) => p.id === selectedPlan) || plans[1];
  const planNames = tr.pricing.plans;
  const planIndex = plans.findIndex((p) => p.id === selectedPlan);
  const planName = planNames[planIndex]?.name || selectedPlan;
  const planFeatures = planNames[planIndex]?.features || [];
  const price = annual ? activePlan.annualPrice : activePlan.price;
  const tax = Math.round(price * 0.19);
  const total = price + tax;

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/40 ${
      err ? "border-destructive ring-1 ring-destructive/20" : "border-border"
    }`;
  const labelCls = "text-xs font-semibold mb-1.5 block text-foreground/70 uppercase tracking-wide";

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-primary" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-extrabold mb-3 tracking-tight">{ct.successTitle}</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">{ct.successMsg}</p>

            <div className="bg-card border border-border rounded-2xl p-6 text-left mb-8 space-y-3">
              {[
                { label: ct.plan, value: planName },
                { label: ct.billing, value: annual ? ct.annualBilling : ct.monthlyBilling },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                <span>{ct.total}</span>
                <span className="text-primary">{total} {ct.currency}{annual ? ct.perYear : ct.perMonth}</span>
              </div>
            </div>

            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
              <ArrowLeft className="w-4 h-4" /> {ct.back}
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Top bar */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-10">
          <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
            <Link to="/pricing" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> {ct.back}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-primary/60" />
              <span>{ct.secure}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
          <div className="max-w-6xl mx-auto">

            {/* Plan selector */}
            <div className="mb-10">
              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-4 mb-7">
                <span className={`text-sm font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
                  {ct.monthlyBilling}
                </span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${annual ? "bg-primary" : "bg-border"}`}
                  aria-label="Toggle billing cycle"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${annual ? "translate-x-6" : "translate-x-0"}`} />
                </button>
                <span className={`text-sm font-medium transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                  {ct.annualBilling}
                </span>
                <AnimatePresence>
                  {annual && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full"
                    >
                      {ct.annualSave}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans.map((plan, i) => {
                  const name = planNames[i]?.name || plan.id;
                  const features = planNames[i]?.features || [];
                  const isActive = selectedPlan === plan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isActive
                          ? "border-primary bg-primary/[0.04] shadow-lg shadow-primary/10"
                          : "border-border bg-card hover:border-primary/30 hover:bg-card"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full uppercase tracking-wider whitespace-nowrap shadow-md">
                          {ct.popular}
                        </span>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-bold text-sm">{name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isActive ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {isActive && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-2xl font-extrabold">{annual ? plan.annualPrice : plan.price}</span>
                        <span className="text-xs text-muted-foreground ml-1">{ct.currency}{annual ? ct.perYear : ct.perMonth}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {features.slice(0, 3).map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-primary shrink-0" strokeWidth={2.5} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

              {/* ── Form (left 3/5) ── */}
              <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">

                {/* Section 1: Your Info */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                    <h2 className="font-semibold text-sm">{ct.yourInfo}</h2>
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{ct.firstName} *</label>
                      <input name="firstName" value={form.firstName} onChange={handleChange} className={inputCls(errors.firstName)} placeholder="John" />
                      {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>{ct.lastName} *</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} className={inputCls(errors.lastName)} placeholder="Doe" />
                      {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>{ct.email} *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls(errors.email)} placeholder="john@company.com" />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>{ct.company} *</label>
                      <input name="company" value={form.company} onChange={handleChange} className={inputCls(errors.company)} placeholder="Acme Inc." />
                      {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>{ct.phone}</label>
                      <input name="phone" value={form.phone} onChange={handleChange} className={inputCls()} placeholder="+216 XX XXX XXX" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>{ct.country} *</label>
                      <select name="country" value={form.country} onChange={handleChange} className={inputCls(errors.country)}>
                        <option value="">—</option>
                        {ct.countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.country && <p className="text-xs text-destructive mt-1">{errors.country}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Payment */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                      <h2 className="font-semibold text-sm">{ct.paymentInfo}</h2>
                    </div>
                    {/* Card brand logos (SVG inline) */}
                    <div className="flex items-center gap-2">
                      {/* Visa */}
                      <svg viewBox="0 0 38 24" className="h-5 w-auto opacity-60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                        <path d="M14.5 16.5H12.3L13.7 7.5H15.9L14.5 16.5Z" fill="white"/>
                        <path d="M21.5 7.7C21.1 7.5 20.4 7.3 19.5 7.3C17.4 7.3 15.9 8.4 15.9 10C15.9 11.2 17 11.9 17.8 12.3C18.6 12.7 18.9 13 18.9 13.4C18.9 14 18.2 14.3 17.5 14.3C16.5 14.3 16 14.2 15.1 13.8L14.8 13.6L14.5 15.7C15 15.9 15.9 16.1 16.9 16.1C19.1 16.1 20.6 15 20.6 13.3C20.6 12.4 20.1 11.7 18.9 11.1C18.2 10.7 17.8 10.5 17.8 10.1C17.8 9.7 18.2 9.4 18.9 9.4C19.5 9.4 19.9 9.5 20.3 9.7L20.5 9.8L21.5 7.7Z" fill="white"/>
                        <path d="M24.5 13.5C24.7 13 25.4 11.1 25.4 11.1C25.4 11.1 25.6 10.5 25.7 10.1L25.9 11C25.9 11 26.4 13.1 26.5 13.5H24.5ZM27.1 7.5H25.3C24.8 7.5 24.4 7.6 24.2 8.1L21.2 16.5H23.4L23.8 15.3H26.5L26.7 16.5H28.7L27.1 7.5Z" fill="white"/>
                        <path d="M12.5 7.5L10.4 13.3L10.2 12.3C9.8 11 8.6 9.6 7.3 8.8L9.2 16.5H11.5L15 7.5H12.5Z" fill="white"/>
                        <path d="M8.5 7.5H5L4.9 7.7C7.7 8.4 9.6 10 10.2 12.3L9.5 8.1C9.3 7.6 9 7.5 8.5 7.5Z" fill="#F2AE14"/>
                      </svg>
                      {/* MC */}
                      <svg viewBox="0 0 38 24" className="h-5 w-auto opacity-60" xmlns="http://www.w3.org/2000/svg">
                        <rect width="38" height="24" rx="4" fill="#252525"/>
                        <circle cx="15" cy="12" r="6" fill="#EB001B"/>
                        <circle cx="23" cy="12" r="6" fill="#F79E1B"/>
                        <path d="M19 7.5C20.4 8.5 21.3 10.1 21.3 12C21.3 13.9 20.4 15.5 19 16.5C17.6 15.5 16.7 13.9 16.7 12C16.7 10.1 17.6 8.5 19 7.5Z" fill="#FF5F00"/>
                      </svg>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className={labelCls}>{ct.cardNumber} *</label>
                      <div className="relative">
                        <input
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          className={inputCls(errors.cardNumber) + " pr-12"}
                          inputMode="numeric"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {cardBrand ? (
                            <span className="text-xs font-bold text-primary">{cardBrand}</span>
                          ) : (
                            <CreditCard className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                      {errors.cardNumber && <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>{ct.expiry} *</label>
                        <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className={inputCls(errors.expiry)} inputMode="numeric" />
                        {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>{ct.cvv} *</label>
                        <div className="relative">
                          <input name="cvv" value={form.cvv} onChange={handleChange} placeholder="•••" className={inputCls(errors.cvv)} inputMode="numeric" type="password" />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                        </div>
                        {errors.cvv && <p className="text-xs text-destructive mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>{ct.cardHolder} *</label>
                      <input name="cardHolder" value={form.cardHolder} onChange={handleChange} placeholder="John Doe" className={inputCls(errors.cardHolder)} />
                      {errors.cardHolder && <p className="text-xs text-destructive mt-1">{errors.cardHolder}</p>}
                    </div>

                    {/* SSL notice */}
                    <div className="flex items-center gap-2.5 bg-muted/50 border border-border rounded-xl px-4 py-3 mt-2">
                      <Lock className="w-4 h-4 text-primary/60 shrink-0" />
                      <p className="text-xs text-muted-foreground">{ct.secure}. Your data is never stored.</p>
                    </div>
                  </div>
                </div>

                {/* Mobile submit */}
                <div className="lg:hidden">
                  <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    {ct.subscribe}
                  </button>
                  <p className="text-center text-xs text-muted-foreground mt-3">{ct.noCC}</p>
                </div>
              </form>

              {/* ── Order Summary (right 2/5) ── */}
              <div className="lg:col-span-2">
                <div className="sticky top-36 space-y-4">

                  {/* Summary card */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                      <h2 className="font-semibold text-sm">{ct.orderSummary}</h2>
                    </div>
                    <div className="p-6">
                      {/* Selected plan highlight */}
                      <div className="flex items-center justify-between mb-5 pb-5 border-b border-border">
                        <div>
                          <p className="font-bold text-sm">{planName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{annual ? ct.annualBilling : ct.monthlyBilling}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{price}</p>
                          <p className="text-xs text-muted-foreground">{ct.currency}{annual ? ct.perYear : ct.perMonth}</p>
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="space-y-2 mb-5 pb-5 border-b border-border">
                        {planFeatures.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Price breakdown */}
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{ct.subtotal}</span>
                          <span>{price} {ct.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{ct.tax}</span>
                          <span>{tax} {ct.currency}</span>
                        </div>
                        <div className="border-t border-border pt-3 mt-1 flex justify-between font-bold text-base">
                          <span>{ct.total}</span>
                          <span className="text-primary">{total} {ct.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA (desktop) */}
                  <div className="hidden lg:block">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector("form")?.requestSubmit();
                      }}
                      className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                    >
                      <Lock className="w-4 h-4" />
                      {ct.subscribe}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <p className="text-center text-xs text-muted-foreground mt-3">{ct.noCC}</p>
                  </div>

                  {/* Trust badges */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="grid grid-cols-3 gap-3">
                      <TrustBadge icon={<RefreshCw className="w-4 h-4" />} label={ct.moneyBack} />
                      <TrustBadge icon={<Shield className="w-4 h-4" />} label={ct.cancelAnytime} />
                      <TrustBadge icon={<Star className="w-4 h-4" />} label={ct.instantAccess} />
                    </div>
                  </div>

                  {/* Secured by Stripe */}
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{ct.securedBy}</span>
                    <div className="bg-primary rounded px-2 py-0.5 flex items-center">
                      <img src={konnektIcon} alt="Konnekt" className="h-4" />
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
                    {ct.terms}{" "}
                    <Link to="/terms" className="text-primary hover:underline">{ct.termsLink}</Link>
                    {" "}{ct.and}{" "}
                    <Link to="/privacy" className="text-primary hover:underline">{ct.privacyLink}</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
