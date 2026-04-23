import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/flowentra-logo.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const FAQ_RESPONSES: { keywords: string[]; en: string; fr: string }[] = [
  {
    keywords: ["price", "pricing", "cost", "tarif", "prix", "coût"],
    en: "We offer 3 plans: Starter (49 TND/mo), Professional (149 TND/mo), and Enterprise (349 TND/mo). All include a 14-day free trial. Visit our pricing section for details!",
    fr: "Nous proposons 3 plans : Starter (49 TND/mois), Professionnel (149 TND/mois) et Entreprise (349 TND/mois). Tous incluent un essai gratuit de 14 jours.",
  },
  {
    keywords: ["demo", "démo", "try", "essai", "test"],
    en: "You can start a free 14-day trial with full access to all features — no credit card required. Click 'Start Free Trial' to begin!",
    fr: "Vous pouvez commencer un essai gratuit de 14 jours avec accès complet — sans carte bancaire. Cliquez sur 'Essai Gratuit' !",
  },
  {
    keywords: ["feature", "module", "fonctionnalit", "what can", "que fait"],
    en: "Flowentra includes CRM, Workflow Engine, Analytics, Invoicing, Inventory, Smart Assistant, Website Builder, and much more — all in one platform.",
    fr: "Flowentra comprend CRM, Moteur de Workflows, Analytique, Facturation, Inventaire, Assistant Intelligent, et bien plus — le tout dans une seule plateforme.",
  },
  {
    keywords: ["support", "help", "aide", "contact"],
    en: "Our support team is available 24/7 for Enterprise clients and during business hours for other plans. You can also reach us at contact@flowentra.com.",
    fr: "Notre support est disponible 24/7 pour les clients Entreprise et aux heures ouvrables pour les autres plans. Contactez-nous à contact@flowentra.com.",
  },
  {
    keywords: ["integrat", "api", "connect", "intégrat"],
    en: "Flowentra integrates with Gmail, Outlook, Slack, Zapier, and 100+ other tools. We also provide a comprehensive REST API for custom integrations.",
    fr: "Flowentra s'intègre avec Gmail, Outlook, Slack, Zapier et plus de 100 autres outils. Nous fournissons aussi une API REST complète.",
  },
  {
    keywords: ["secur", "gdpr", "iso", "sécurit", "data", "donnée"],
    en: "Flowentra is ISO 27001 certified, GDPR compliant, and SOC 2 Type II audited. All data is encrypted at rest and in transit.",
    fr: "Flowentra est certifié ISO 27001, conforme GDPR et audité SOC 2 Type II. Toutes les données sont chiffrées au repos et en transit.",
  },
  {
    keywords: ["migrat", "import", "transfer"],
    en: "Yes! We support data migration from all major CRM and ERP platforms. Our team provides white-glove migration support.",
    fr: "Oui ! Nous supportons la migration depuis toutes les principales plateformes CRM et ERP avec un accompagnement dédié.",
  },
];

const getResponse = (message: string, lang: string): string => {
  const lower = message.toLowerCase();
  for (const entry of FAQ_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return lang === "fr" ? entry.fr : entry.en;
    }
  }
  return lang === "fr"
    ? "Merci pour votre question ! Pour une assistance plus détaillée, contactez-nous à contact@flowentra.com ou explorez notre documentation."
    : "Thanks for your question! For more detailed assistance, feel free to reach out at contact@flowentra.com or explore our documentation.";
};

const ChatAssistant = () => {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isFr = lang === "fr";

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (open && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: isFr
            ? "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
            : "Hi there! How can I help you today?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = (text?: string) => {
    const value = (text || input).trim();
    if (!value) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    if (inputRef.current) inputRef.current.style.height = "auto";

    setTimeout(() => {
      const response = getResponse(value, lang);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTyping(false);
    }, 900 + Math.random() * 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            onClick={() => setOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-7 sm:right-7 z-50 flex items-center gap-2 pl-3.5 pr-4 sm:pl-4 sm:pr-5 py-2.5 sm:py-3 rounded-full bg-foreground text-background shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-transform"
            style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.8 }}
            aria-label="Open chat"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">{isFr ? "Aide" : "Help"}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="fixed inset-0 sm:inset-auto sm:bottom-7 sm:right-7 z-[60] w-full sm:w-[380px] h-[100dvh] sm:h-[520px] bg-background sm:border sm:border-border sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border shrink-0 bg-background" style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}>
                <img src={logo} alt="Flowentra" className="h-5 sm:h-6" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-tight">Flowentra</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    {isFr ? "En ligne" : "Online"}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors active:bg-muted/80 -mr-1 sm:mr-0"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5 overscroll-contain -webkit-overflow-scrolling-touch">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`flex gap-2.5 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-foreground shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-[10px] font-bold text-background tracking-tight">FE</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] sm:max-w-[80%] text-[13px] leading-relaxed ${
                        msg.role === "assistant"
                          ? "text-foreground"
                          : "bg-foreground text-background rounded-2xl rounded-br-md px-4 py-3"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="bg-muted/60 rounded-2xl rounded-tl-md px-4 py-3">
                          <p>{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-2">{msg.time}</p>
                        </div>
                      ) : (
                        <>
                          <p>{msg.content}</p>
                          <p className="text-[10px] text-background/40 mt-1.5">{msg.time}</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}

                {typing && (
                  <motion.div className="flex gap-2.5 sm:gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-7 h-7 rounded-full bg-foreground shrink-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-background tracking-tight">FE</span>
                    </div>
                    <div className="bg-muted/60 rounded-2xl rounded-tl-md px-4 py-3 flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border shrink-0 bg-background" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
                <div className="flex items-end gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary/25 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isFr ? "Écrivez votre message..." : "Write a message..."}
                    rows={1}
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed py-1 max-h-[120px]"
                    style={{ fontSize: "16px" }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-20 shrink-0 mb-0.5 active:scale-95"
                    aria-label="Send"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="14" x2="8" y2="2" />
                      <polyline points="3,6 8,2 13,6" />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/30 text-center mt-1.5 sm:mt-2">
                  {isFr ? "Propulsé par Flowentra" : "Powered by Flowentra"}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
