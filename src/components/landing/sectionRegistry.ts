import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import Features from "@/components/landing/Features";
import ProductShowcase from "@/components/landing/ProductShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Metrics from "@/components/landing/Metrics";
import IndustryVerticals from "@/components/landing/IndustryVerticals";
import IntegrationsShowcase from "@/components/landing/IntegrationsShowcase";
import Pricing from "@/components/landing/Pricing";
import ComparisonTable from "@/components/landing/ComparisonTable";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import ContactSection from "@/components/landing/ContactSection";
import CTABanner from "@/components/landing/CTABanner";
import DemoPreview from "@/components/landing/DemoPreview";

export interface SectionDef {
  type: string;
  label: string;
  Component: React.ComponentType;
}

/**
 * Sections that can be added to a custom page via the page builder.
 * Type matches both the section_type stored in flowentra_page_sections
 * and the global CMS section key (so per-page content overrides the
 * matching global section's content).
 */
export const PAGE_SECTION_REGISTRY: SectionDef[] = [
  { type: "hero", label: "Hero", Component: Hero },
  { type: "trustedBy", label: "Trusted By", Component: TrustedBy },
  { type: "features", label: "Features", Component: Features },
  { type: "productShowcase", label: "Product Showcase", Component: ProductShowcase },
  { type: "howItWorks", label: "How It Works", Component: HowItWorks },
  { type: "demo", label: "Demo Preview", Component: DemoPreview },
  { type: "metrics", label: "Metrics", Component: Metrics },
  { type: "industryVerticals", label: "Industry Verticals", Component: IndustryVerticals },
  { type: "integrations", label: "Integrations", Component: IntegrationsShowcase },
  { type: "pricing", label: "Pricing", Component: Pricing },
  { type: "comparisonTable", label: "Comparison Table", Component: ComparisonTable },
  { type: "testimonials", label: "Testimonials", Component: Testimonials },
  { type: "faq", label: "FAQ", Component: FAQ },
  { type: "contact", label: "Contact", Component: ContactSection },
  { type: "ctaBanner", label: "CTA Banner", Component: CTABanner },
];

export const getSectionDef = (type: string) =>
  PAGE_SECTION_REGISTRY.find((s) => s.type === type);
