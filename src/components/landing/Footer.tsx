import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsSection } from "@/contexts/CmsContentContext";
import { Link } from "react-router-dom";
import logo from "@/assets/flowentra-logo.png";

const Footer = () => {
  const { tr, lang } = useLanguage();
  const cms = useCmsSection("footer", lang, tr.footer as Record<string, any>) as Record<string, any>;
  const f = { ...tr.footer, ...cms } as typeof tr.footer;

  const columns = [
    {
      title: f.product,
      links: [
        { label: tr.nav.features, href: "/#features" },
        { label: tr.nav.pricing, href: "/pricing" },
        { label: tr.nav.demo, href: "/#demo" },
        { label: f.integrations, href: "/integrations" },
        { label: f.docs, href: "/docs" },
      ],
    },
    {
      title: f.company,
      links: [
        { label: f.about, href: "/about" },
        { label: f.careers, href: "/careers" },
        { label: f.partners, href: "/partners" },
        { label: f.blog, href: "/blog" },
        { label: f.contact, href: "/contact" },
      ],
    },
    {
      title: f.resources,
      links: [
        { label: f.support, href: "/support" },
        { label: f.docs, href: "/docs" },
        { label: f.status, href: "/status" },
        { label: tr.nav.faq, href: "/#faq" },
        { label: f.releases, href: "/releases" },
      ],
    },
    {
      title: f.legal,
      links: [
        { label: f.privacy, href: "/privacy" },
        { label: f.terms, href: "/terms" },
        { label: f.security, href: "/security" },
      ],
    },
  ];

  const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("/#");

  return (
    <footer className="section-dark">
      <div className="container mx-auto px-5 sm:px-4 lg:px-8 pt-14 sm:pt-20 pb-8 sm:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 mb-12 sm:mb-16">
          <div className="col-span-2">
            <img src={logo} alt="Flowentra" className="h-8 sm:h-9 mb-4 sm:mb-5 brightness-0 invert" />
            <p className="text-xs sm:text-sm text-surface-dark-foreground/50 leading-relaxed mb-5 sm:mb-6 max-w-xs">
              {f.desc}
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              {[
                "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
                "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
                "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z",
              ].map((path, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-surface-dark-foreground/40 hover:bg-white/10 hover:text-surface-dark-foreground/70 transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-[10px] sm:text-xs uppercase tracking-widest text-surface-dark-foreground/70 mb-4 sm:mb-5">
                {col.title}
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {isInternal(link.href) ? (
                      <Link
                        to={link.href}
                        className="text-xs sm:text-sm text-surface-dark-foreground/40 hover:text-surface-dark-foreground/80 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-xs sm:text-sm text-surface-dark-foreground/40 hover:text-surface-dark-foreground/80 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 sm:pt-8">
          <p className="text-[10px] sm:text-xs text-surface-dark-foreground/30">
            {f.copyright}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-[10px] sm:text-xs text-surface-dark-foreground/40 hover:text-surface-dark-foreground/70 transition-colors underline underline-offset-2">
              {f.privacy}
            </Link>
            <Link to="/terms" className="text-[10px] sm:text-xs text-surface-dark-foreground/40 hover:text-surface-dark-foreground/70 transition-colors underline underline-offset-2">
              {f.terms}
            </Link>
          </div>
          <p className="text-[10px] sm:text-xs text-surface-dark-foreground/20 italic">
            {f.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
