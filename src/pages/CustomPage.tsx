import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import EditableSection from "@/components/landing/EditableSection";
import { pagesApi, type CmsPage } from "@/services/adminPagesApi";
import { getSectionDef } from "@/components/landing/sectionRegistry";
import { PageSectionProvider } from "@/contexts/PageSectionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const CustomPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const previewMode = searchParams.get("preview") === "1";
  const { lang } = useLanguage();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    pagesApi
      .getBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        // In preview mode, allow drafts to render
        if (!data || (!data.is_published && !previewMode)) {
          setNotFound(true);
        } else {
          setPage(data);
        }
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug, previewMode]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-3">Page not found</h1>
          <p className="text-muted-foreground">The page <code>/p/{slug}</code> does not exist or isn't published.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const title = (page as any)[`title_${lang}`] || page.title_en || page.slug;
  const meta = (page as any)[`meta_description_${lang}`] || page.meta_description_en || "";
  const visibleSections = (page.sections || []).filter((s) => s.is_visible).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>{title}</title>
        {meta && <meta name="description" content={meta} />}
        <meta property="og:title" content={title} />
        {meta && <meta property="og:description" content={meta} />}
      </Helmet>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[20%] -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute top-[55%] -right-40 w-[700px] h-[700px] rounded-full bg-accent/8 blur-[160px]" />
      </div>

      <EditableSection sectionKey="nav" label="Nav">
        <Navbar />
      </EditableSection>

      {previewMode && !page.is_published && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-600 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur">
          Draft preview — not visible to public
        </div>
      )}

      <main className="pt-20">
        {visibleSections.length === 0 && (
          <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
              <p>This page has no sections yet. Add sections from the admin Pages manager.</p>
            </motion.div>
          </div>
        )}

        {visibleSections.map((s) => {
          const def = getSectionDef(s.section_type);
          if (!def) return null;
          const Cmp = def.Component;
          return (
            <PageSectionProvider
              key={s.id}
              value={{ instanceKey: s.instance_key, sectionType: s.section_type }}
            >
              <EditableSection sectionKey={s.instance_key} label={def.label}>
                <Cmp />
              </EditableSection>
            </PageSectionProvider>
          );
        })}
      </main>

      <EditableSection sectionKey="footer" label="Footer">
        <Footer />
      </EditableSection>
    </div>
  );
};

export default CustomPage;
