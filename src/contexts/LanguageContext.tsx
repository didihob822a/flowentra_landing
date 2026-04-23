import React, { createContext, useContext, useState, useCallback } from "react";
import { Lang, t, Translations, languages } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: Translations;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>("fr");

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    const langConfig = languages.find((l) => l.code === newLang);
    document.documentElement.dir = langConfig?.dir || "ltr";
    document.documentElement.lang = newLang;
  }, []);

  const tr = t(lang);
  const dir = languages.find((l) => l.code === lang)?.dir || "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
