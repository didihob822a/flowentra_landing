import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description: string;
  /** Optional keywords list (kept short — most engines ignore but harmless) */
  keywords?: string;
  /** Absolute URL or path of the social preview image */
  image?: string;
  /** Override canonical URL (defaults to current path on flowentra.com) */
  canonical?: string;
  /** og:type — "website" | "article" | "product" ... */
  type?: string;
  /** Optional JSON-LD structured data object */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Hide page from search engines */
  noindex?: boolean;
}

const SITE_URL = "https://flowentra.com";
const DEFAULT_IMAGE = "https://flowentra.com/og-image.png";
const SITE_NAME = "Flowentra";

/**
 * Per-page SEO component.
 * - Sets a unique <title> and meta description (truncated to safe lengths)
 * - Emits canonical, Open Graph, and Twitter Card tags
 * - Optionally injects JSON-LD structured data
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  canonical,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const { pathname } = useLocation();
  const url = canonical ?? `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  const ogImage = image ?? DEFAULT_IMAGE;

  // Keep title under ~60 chars and description under ~160 chars for SERPs
  const safeTitle =
    title.length > 60 ? title.slice(0, 57).trimEnd() + "…" : title;
  const fullTitle = safeTitle.includes(SITE_NAME)
    ? safeTitle
    : `${safeTitle} | ${SITE_NAME}`;
  const safeDescription =
    description.length > 160
      ? description.slice(0, 157).trimEnd() + "…"
      : description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@flowentra" />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
