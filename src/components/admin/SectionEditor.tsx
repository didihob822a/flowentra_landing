import { useState, useEffect, useCallback, useRef } from "react";
import { adminContent, type CmsField, type MediaFile } from "@/services/adminApi";
import { toast } from "sonner";
import { Save, RefreshCw, Globe, AlertCircle, ImageIcon, Eye, EyeOff, Info, ChevronDown, ChevronUp, Monitor, Tablet, Smartphone, ExternalLink, Maximize2, Minimize2, Crosshair } from "lucide-react";
import ImageUploader from "./ImageUploader";
import MediaLibrary from "./MediaLibrary";
import FlagIcon from "@/components/FlagIcon";
import MegaMenuBuilder from "./MegaMenuBuilder";
import SectionHelpDrawer from "./SectionHelpDrawer";
import HeroModulesEditor from "./HeroModulesEditor";
import { pagesApi } from "@/services/adminPagesApi";
import { PAGE_SECTION_REGISTRY } from "@/components/landing/sectionRegistry";

interface Props {
  sectionKey: string;
  lang: string;
  allLanguages: { code: string; label: string; flag?: string }[];
  onLangChange?: (code: string) => void;
}

// Section visual descriptions for context
const sectionInfo: Record<string, { description: string; previewHint: string; anchor: string }> = {
  nav: {
    description: "Navigation bar at the top of every page. Controls menu links and call-to-action buttons.",
    previewHint: "Top of the page — always visible",
    anchor: "#",
  },
  navMega: {
    description: "Mega-menu under Product, Solutions, and Resources. Add/rename tabs, items, descriptions, icons, and links — no code required.",
    previewHint: "Hover Product / Solutions / Resources in the top nav",
    anchor: "#",
  },
  hero: {
    description: "The first thing visitors see. Contains the main headline, subtitle, CTAs, and background image.",
    previewHint: "Full-width banner at the very top",
    anchor: "#hero",
  },
  trustedBy: {
    description: "Logos of companies that trust your product. Builds credibility with visitors.",
    previewHint: "Logo strip below the hero",
    anchor: "#trusted",
  },
  features: {
    description: "Core product features displayed as cards. Each card has a title and description.",
    previewHint: "Feature grid with icons",
    anchor: "#features",
  },
  productShowcase: {
    description: "Detailed product highlights with screenshots. Shows what the product looks like in action.",
    previewHint: "Product screenshots with descriptions",
    anchor: "#product",
  },
  howItWorks: {
    description: "Step-by-step process showing how to get started with the product.",
    previewHint: "Numbered steps section",
    anchor: "#how-it-works",
  },
  metrics: {
    description: "Key statistics and numbers that demonstrate the product's impact.",
    previewHint: "Animated counters section",
    anchor: "#metrics",
  },
  industryVerticals: {
    description: "Industries and sectors that the product serves. Helps visitors identify if the product is for them.",
    previewHint: "Industry cards with icons",
    anchor: "#industries",
  },
  integrations: {
    description: "Third-party tools and services that integrate with your product.",
    previewHint: "Integration logos and descriptions",
    anchor: "#integrations",
  },
  pricing: {
    description: "Pricing plans and features comparison. Critical for conversion.",
    previewHint: "Pricing cards with plan details",
    anchor: "#pricing",
  },
  comparisonTable: {
    description: "Side-by-side feature comparison between your product and competitors.",
    previewHint: "Comparison table with checkmarks",
    anchor: "#comparison",
  },
  testimonials: {
    description: "Customer reviews and quotes. Social proof that builds trust.",
    previewHint: "Quote cards with names and roles",
    anchor: "#testimonials",
  },
  faq: {
    description: "Frequently asked questions. Reduces support load and addresses objections.",
    previewHint: "Expandable accordion questions",
    anchor: "#faq",
  },
  contact: {
    description: "Contact information and form section for visitor inquiries.",
    previewHint: "Contact form with info cards",
    anchor: "#contact",
  },
  ctaBanner: {
    description: "Final call-to-action banner before the footer. Last push for conversion.",
    previewHint: "Full-width colored banner",
    anchor: "#cta",
  },
  footer: {
    description: "Page footer with links, copyright, and company information.",
    previewHint: "Bottom of every page",
    anchor: "#footer",
  },
  demo: {
    description: "Interactive demo previews showing workflow automation and analytics dashboards.",
    previewHint: "Device frame with live demo content",
    anchor: "#demo",
  },
};

const defaultFieldSchemas: Record<string, CmsField[]> = {
  nav: [
    { field_key: "features", field_label: "Features Link", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "pricing", field_label: "Pricing Link", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "demo", field_label: "Demo Link", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "testimonials", field_label: "Testimonials Link", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "faq", field_label: "FAQ Link", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "cta", field_label: "CTA Button", field_type: "text", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 1 },
    { field_key: "signup", field_label: "Sign Up Button", field_type: "text", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 1 },
    { field_key: "contact", field_label: "Contact Link Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 8, placeholder: null, is_required: 0 },
    { field_key: "discover", field_label: "Discover Button (top-right desktop CTA)", field_type: "text", is_array: 0, array_max_items: null, sort_order: 9, placeholder: null, is_required: 0 },
    { field_key: "languageLabel", field_label: "Mobile 'Language' Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 10, placeholder: null, is_required: 0 },
    { field_key: "requestDemo", field_label: "Mobile 'Request Demo' Button", field_type: "text", is_array: 0, array_max_items: null, sort_order: 11, placeholder: null, is_required: 0 },
  ],
  hero: [
    { field_key: "heroBackground", field_label: "Hero Background Image", field_type: "image", is_array: 0, array_max_items: null, sort_order: 0, placeholder: null, is_required: 0 },
    { field_key: "headline", field_label: "Headline", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "headlineSub", field_label: "Headline Subtitle", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "subtext", field_label: "Subtext", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "tagline", field_label: "Tagline (small text under subtext)", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 0 },
    { field_key: "cta", field_label: "Primary CTA", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "ctaSecondary", field_label: "Secondary CTA", field_type: "text", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 1 },
    { field_key: "trustLine", field_label: "Trust Line", field_type: "text", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 0 },
    { field_key: "appScreenshot", field_label: "App Screenshot", field_type: "image", is_array: 0, array_max_items: null, sort_order: 8, placeholder: null, is_required: 0 },
    { field_key: "screenshotPlaceholder", field_label: "Screenshot Placeholder Text", field_type: "text", is_array: 0, array_max_items: null, sort_order: 9, placeholder: null, is_required: 0 },
    { field_key: "browserBarUrl", field_label: "Browser Bar URL Text", field_type: "text", is_array: 0, array_max_items: null, sort_order: 10, placeholder: null, is_required: 0 },
    { field_key: "heroModules", field_label: "Module Switcher (JSON array of {icon, label})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 11, placeholder: '[{"icon":"LayoutDashboard","label":"Dashboard"},{"icon":"Users","label":"Team Management"}]', is_required: 0 },
  ],
  features: [
    { field_key: "sectionLabel", field_label: "Section Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "items", field_label: "Feature Items (JSON array of {title, desc})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
  ],
  pricing: [
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "currency", field_label: "Currency", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "monthly", field_label: "Monthly Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "cta", field_label: "CTA Button Text", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "popular", field_label: "Popular Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 0 },
    { field_key: "plans", field_label: "Plans (JSON array of {name, price, features[], popular?})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 1 },
  ],
  faq: [
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "items", field_label: "FAQ Items (JSON array of {q, a})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
  ],
  testimonials: [
    { field_key: "sectionLabel", field_label: "Section Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "items", field_label: "Testimonials (JSON array of {name, role, quote})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
  ],
  howItWorks: [
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "items", field_label: "Steps (JSON array of {title, desc})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
  ],
  metrics: [
    { field_key: "sectionLabel", field_label: "Section Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Section Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 0 },
    { field_key: "items", field_label: "Metrics (JSON array of {value, suffix, label})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
  ],
  productShowcase: [
    { field_key: "label", field_label: "Section Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "items", field_label: "Showcase Items (JSON array of {tag, title, desc})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "browserBarHost", field_label: "Browser Bar Host (e.g. 'app.flowentra.io')", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 0 },
    { field_key: "screenshotPrefix", field_label: "Screenshot Caption Prefix (e.g. 'Screenshot')", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 0 },
  ],
  industryVerticals: [
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "items", field_label: "Industries (JSON array of {title, desc})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
  ],
  integrations: [
    { field_key: "label", field_label: "Section Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "comingSoon", field_label: "'More Coming Soon' Text", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 0 },
    { field_key: "items", field_label: "Integration Names (JSON array of strings)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 0 },
  ],
  comparisonTable: [
    { field_key: "label", field_label: "Section Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "productName", field_label: "Your Product Name (column header)", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 0 },
    { field_key: "featureColumnLabel", field_label: "Feature Column Header", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 0 },
    { field_key: "features", field_label: "Features List (JSON array of strings)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "competitors", field_label: "Competitor Names (JSON array of strings)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 0 },
    { field_key: "competitorSupport", field_label: "Competitor Support Matrix (JSON object: {\"Name\": [true,false,...]})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 0 },
  ],
  contact: [
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "firstName", field_label: "First Name Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "lastName", field_label: "Last Name Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "email", field_label: "Email Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "company", field_label: "Company Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 1 },
    { field_key: "message", field_label: "Message Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 1 },
    { field_key: "send", field_label: "Send Button Text", field_type: "text", is_array: 0, array_max_items: null, sort_order: 8, placeholder: null, is_required: 1 },
    { field_key: "info", field_label: "Contact Info (JSON array of {label, value})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 9, placeholder: null, is_required: 1 },
  ],
  ctaBanner: [
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "cta", field_label: "Primary CTA", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "ctaSecondary", field_label: "Secondary CTA", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "note", field_label: "Note Text", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 0 },
    { field_key: "bulletPoints", field_label: "Bullet Points (JSON array of strings)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 0 },
  ],
  footer: [
    { field_key: "desc", field_label: "Description", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "copyright", field_label: "Copyright", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "tagline", field_label: "Tagline", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 0 },
    { field_key: "about", field_label: "About Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "support", field_label: "Support Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "integrations", field_label: "Integrations Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 1 },
    { field_key: "legal", field_label: "Legal Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 1 },
    { field_key: "contact", field_label: "Contact Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 8, placeholder: null, is_required: 1 },
    { field_key: "product", field_label: "Product Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 9, placeholder: null, is_required: 1 },
    { field_key: "company", field_label: "Company Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 10, placeholder: null, is_required: 1 },
    { field_key: "resources", field_label: "Resources Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 11, placeholder: null, is_required: 1 },
    { field_key: "privacy", field_label: "Privacy Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 12, placeholder: null, is_required: 1 },
    { field_key: "terms", field_label: "Terms Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 13, placeholder: null, is_required: 1 },
    { field_key: "security", field_label: "Security Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 14, placeholder: null, is_required: 1 },
    { field_key: "status", field_label: "Status Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 15, placeholder: null, is_required: 1 },
    { field_key: "docs", field_label: "Docs Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 16, placeholder: null, is_required: 1 },
    { field_key: "blog", field_label: "Blog Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 17, placeholder: null, is_required: 1 },
    { field_key: "careers", field_label: "Careers Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 18, placeholder: null, is_required: 1 },
    { field_key: "partners", field_label: "Partners Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 19, placeholder: null, is_required: 1 },
    { field_key: "releases", field_label: "Releases Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 20, placeholder: null, is_required: 1 },
  ],
  navMega: [
    { field_key: "productLabel", field_label: "Product Menu Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "solutionsLabel", field_label: "Solutions Menu Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "resourcesLabel", field_label: "Resources Menu Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "product", field_label: "Product Mega Menu (JSON)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "solutions", field_label: "Solutions Mega Menu (JSON)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "resources", field_label: "Resources Mega Menu (JSON)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 1 },
  ],
  trustedBy: [
    { field_key: "title", field_label: "Section Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 1 },
    { field_key: "logos", field_label: "Company Names (JSON array of strings)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
  ],
  demo: [
    { field_key: "sectionLabel", field_label: "Eyebrow Label (e.g. 'Live Demo')", field_type: "text", is_array: 0, array_max_items: null, sort_order: 1, placeholder: null, is_required: 0 },
    { field_key: "title", field_label: "Title", field_type: "text", is_array: 0, array_max_items: null, sort_order: 2, placeholder: null, is_required: 1 },
    { field_key: "subtitle", field_label: "Subtitle", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 3, placeholder: null, is_required: 1 },
    { field_key: "workflow", field_label: "Workflow Tab Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 4, placeholder: null, is_required: 1 },
    { field_key: "workflowDesc", field_label: "Workflow Description", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 5, placeholder: null, is_required: 1 },
    { field_key: "analytics", field_label: "Analytics Tab Label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 6, placeholder: null, is_required: 1 },
    { field_key: "analyticsDesc", field_label: "Analytics Description", field_type: "textarea", is_array: 0, array_max_items: null, sort_order: 7, placeholder: null, is_required: 1 },
    { field_key: "deviceDesktop", field_label: "Device Switcher · Desktop label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 8, placeholder: null, is_required: 0 },
    { field_key: "deviceTablet", field_label: "Device Switcher · Tablet label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 9, placeholder: null, is_required: 0 },
    { field_key: "deviceMobile", field_label: "Device Switcher · Mobile label", field_type: "text", is_array: 0, array_max_items: null, sort_order: 10, placeholder: null, is_required: 0 },
    { field_key: "browserBarUrl", field_label: "Browser Bar URL (inside the device frame)", field_type: "text", is_array: 0, array_max_items: null, sort_order: 11, placeholder: null, is_required: 0 },
    { field_key: "screenshotNote", field_label: "Footer Note (small grey text below the device)", field_type: "text", is_array: 0, array_max_items: null, sort_order: 12, placeholder: null, is_required: 0 },
    { field_key: "nodes", field_label: "Workflow Nodes (JSON: {trigger, condition, action, email, log})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 13, placeholder: null, is_required: 1 },
    { field_key: "stats", field_label: "Stats Labels (JSON: {revenue, users, completion})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 14, placeholder: null, is_required: 1 },
    { field_key: "barChart", field_label: "Analytics Bar Chart Heights (JSON array of numbers 0-100)", field_type: "json", is_array: 0, array_max_items: null, sort_order: 15, placeholder: null, is_required: 0 },
    { field_key: "analyticsStats", field_label: "Analytics Stat Cards (JSON array of {label, value})", field_type: "json", is_array: 0, array_max_items: null, sort_order: 16, placeholder: null, is_required: 0 },
  ],
};

const sectionImageCategory: Record<string, 'hero' | 'logo' | 'icon' | 'integration' | 'screenshot' | 'general'> = {
  hero: 'hero',
  integrations: 'integration',
  productShowcase: 'screenshot',
  nav: 'logo',
  footer: 'logo',
};

const fieldHelpText: Record<string, Record<string, string>> = {
  hero: {
    headline: "Main headline visitors see first. Keep it punchy and benefit-driven.",
    headlineSub: "Small text above the headline. Often a category or tagline.",
    subtext: "Supporting paragraph below the headline. Explain the value proposition.",
    cta: "Primary action button text (e.g., 'Start Free Trial')",
    ctaSecondary: "Secondary action button text (e.g., 'Watch Demo')",
    heroBackground: "Background image for the hero. Recommended: 1920×1080, dark image works best.",
    appScreenshot: "Product screenshot shown in the hero. Recommended: 1200×800.",
    trustLine: "Small trust indicator text (e.g., 'Trusted by 500+ companies')",
    screenshotPlaceholder: "Text shown inside the screenshot placeholder (e.g., 'Your app screenshot here')",
    browserBarUrl: "Fake URL shown in the browser chrome bar (e.g., 'app.flowentra.io')",
    heroModules: "Module switcher buttons (JSON array). Each item: {\"icon\":\"IconName\",\"label\":\"Label\"}. Icons use Lucide names like LayoutDashboard, Users, FileText, BarChart3, Zap, Shield, Settings, Brain, etc. Editable per language — change the label for each language.",
  },
  pricing: {
    plans: 'Array format: [{"name":"Starter","price":"29","features":["Feature 1","Feature 2"],"popular":false}]',
  },
  faq: {
    items: 'Array format: [{"q":"Your question?","a":"Your answer here."}]',
  },
  testimonials: {
    items: 'Array format: [{"name":"John Doe","role":"CEO at Company","quote":"Great product!"}]',
  },
  features: {
    items: 'Array format: [{"title":"Feature Name","desc":"Feature description here."}]',
  },
  metrics: {
    title: "Heading above the metrics (e.g., 'What our customers achieve')",
    items: 'Array format: [{"value":60,"suffix":"%","label":"Less manual work"}]',
  },
  contact: {
    firstName: "Label for the first name input field",
    lastName: "Label for the last name input field",
    send: "Text for the submit/send button",
    info: 'Array format: [{"label":"Email","value":"contact@flowentra.io"}]',
  },
  comparisonTable: {
    featureColumnLabel: "Header text for the feature column (e.g., 'Feature')",
    competitors: 'Array format: ["Odoo","Salesforce","HubSpot"]',
    competitorSupport: 'Object format: {"Odoo":[true,false,true,...],"Salesforce":[true,false,...]}',
  },
  integrations: {
    comingSoon: "Text shown below integrations (e.g., '+ more coming soon')",
    items: 'Array format: ["Gmail","Outlook","Telegram","Stripe"]',
  },
  trustedBy: {
    logos: 'Array format: ["Company A","Company B","Company C"]',
  },
  navMega: {
    product: 'JSON: { "tabs": [{ "id":"modules","label":"Modules","icon":"Layers", "items":[{"label":"Field Service","desc":"Manage field service.","icon":"Wrench","href":"#features","isRoute":false}] }] }',
    solutions: 'Same shape as product. Tabs may include optional "footer": {"label":"Find your industry","href":"#industries"}',
    resources: 'Same shape as product. icon names must match Lucide icons (Layers, Wrench, FolderKanban, LayoutDashboard, MapPin, Brain, ShieldCheck, BarChart3, Smartphone, Globe, Snowflake, Zap, Building2, Eye, SprayCan, Settings2, Sun, Wifi, CircuitBoard, Play, HelpCircle, BookOpen, MessageCircle, Handshake, HeadphonesIcon).',
  },
  howItWorks: {
    items: 'Array format: [{"title":"Choose Your Plan","desc":"Start with a 14-day free trial."}]',
  },
  productShowcase: {
    items: 'Array format: [{"tag":"Dashboard","title":"Real-time analytics","desc":"Track KPIs..."}]',
  },
  industryVerticals: {
    items: 'Array format: [{"title":"Financial Services","desc":"Compliance, client management..."}]',
  },
  ctaBanner: {
    bulletPoints: 'Array format: ["14-day free trial","No credit card required","Cancel anytime"]',
  },
  demo: {
    nodes: 'Object format: {"trigger":"Trigger","condition":"Condition","action":"Action","email":"Email Notify","log":"Log Result"}',
    stats: 'Object format: {"revenue":"Revenue","users":"Users","completion":"Completion"}',
  },
};

// Type for multi-language values: { "en": { "headline": "...", ... }, "fr": { "headline": "...", ... } }
type MultiLangValues = Record<string, Record<string, string>>;

const SectionEditor = ({ sectionKey, lang, allLanguages, onLangChange }: Props) => {
  const [fields, setFields] = useState<CmsField[]>([]);
  // Multi-language values: langCode -> { fieldKey -> value }
  const [allValues, setAllValues] = useState<MultiLangValues>({});
  const [originalAllValues, setOriginalAllValues] = useState<MultiLangValues>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<string>("");
  // ---------- Preview preferences (persisted per-section with global fallback) ----------
  // Schema:
  //   admin_section_preview_open            -> "0" | "1"   (global — same for all sections)
  //   admin_section_preview_device_global   -> device      (fallback when no per-section value)
  //   admin_section_preview_expanded_global -> "0" | "1"   (fallback when no per-section value)
  //   admin_section_preview_device:<key>    -> device      (per-section)
  //   admin_section_preview_expanded:<key>  -> "0" | "1"   (per-section)
  type Device = "desktop" | "tablet" | "mobile";
  const readPerSection = <T,>(key: string, globalKey: string, fallback: T, parse: (v: string) => T | null): T => {
    try {
      const perSection = sectionKey ? localStorage.getItem(`${key}:${sectionKey}`) : null;
      if (perSection !== null) { const p = parse(perSection); if (p !== null) return p; }
      const global = localStorage.getItem(globalKey);
      if (global !== null) { const p = parse(global); if (p !== null) return p; }
    } catch {}
    return fallback;
  };

  const [showPreview, setShowPreview] = useState<boolean>(() => {
    try { return localStorage.getItem("admin_section_preview_open") !== "0"; } catch { return true; }
  });
  const [previewDevice, setPreviewDevice] = useState<Device>(() =>
    readPerSection<Device>(
      "admin_section_preview_device",
      "admin_section_preview_device_global",
      "desktop",
      (v) => (v === "desktop" || v === "tablet" || v === "mobile" ? v : null),
    )
  );
  const [previewExpanded, setPreviewExpanded] = useState<boolean>(() =>
    readPerSection<boolean>(
      "admin_section_preview_expanded",
      "admin_section_preview_expanded_global",
      false,
      (v) => (v === "1" ? true : v === "0" ? false : null),
    )
  );
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Re-hydrate per-section preferences whenever the active section changes
  useEffect(() => {
    if (!sectionKey) return;
    setPreviewDevice(
      readPerSection<Device>(
        "admin_section_preview_device",
        "admin_section_preview_device_global",
        "desktop",
        (v) => (v === "desktop" || v === "tablet" || v === "mobile" ? v : null),
      )
    );
    setPreviewExpanded(
      readPerSection<boolean>(
        "admin_section_preview_expanded",
        "admin_section_preview_expanded_global",
        false,
        (v) => (v === "1" ? true : v === "0" ? false : null),
      )
    );
    // Reset reload counter so the preview starts fresh on each section
    setPreviewReloadKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  // Persist: open flag (global), device + expanded (both per-section AND as new global default)
  useEffect(() => {
    try { localStorage.setItem("admin_section_preview_open", showPreview ? "1" : "0"); } catch {}
  }, [showPreview]);
  useEffect(() => {
    try {
      localStorage.setItem("admin_section_preview_device_global", previewDevice);
      if (sectionKey) localStorage.setItem(`admin_section_preview_device:${sectionKey}`, previewDevice);
    } catch {}
  }, [previewDevice, sectionKey]);
  useEffect(() => {
    try {
      const val = previewExpanded ? "1" : "0";
      localStorage.setItem("admin_section_preview_expanded_global", val);
      if (sectionKey) localStorage.setItem(`admin_section_preview_expanded:${sectionKey}`, val);
    } catch {}
  }, [previewExpanded, sectionKey]);


  const [collapsedJsonFields, setCollapsedJsonFields] = useState<Set<string>>(new Set());

  const info = sectionInfo[sectionKey];

  const loadData = useCallback(async () => {
    if (!sectionKey) return;
    setLoading(true);
    try {
      let fieldData: CmsField[];
      try {
        fieldData = await adminContent.getFields(sectionKey);
        if (!fieldData || fieldData.length === 0) throw new Error("No fields");
      } catch {
        fieldData = defaultFieldSchemas[sectionKey] || [];
      }
      // Merge any extra fields from the default schema that the backend doesn't know about yet
      const defaults = defaultFieldSchemas[sectionKey] || [];
      const existingKeys = new Set(fieldData.map(f => f.field_key));
      for (const df of defaults) {
        if (!existingKeys.has(df.field_key)) {
          fieldData.push(df);
        }
      }
      setFields(fieldData);

      // Load content for ALL languages in parallel
      const langResults: MultiLangValues = {};
      const promises = allLanguages.map(async (l) => {
        try {
          const contentData = await adminContent.getSectionContent(sectionKey, l.code);
          const vals: Record<string, string> = {};
          Object.entries(contentData).forEach(([key, item]) => {
            vals[key] = item.value;
          });
          langResults[l.code] = vals;
        } catch {
          langResults[l.code] = {};
        }
      });
      await Promise.all(promises);

      setAllValues(langResults);
      setOriginalAllValues(JSON.parse(JSON.stringify(langResults)));
    } finally {
      setLoading(false);
      setHasChanges(false);
    }
  }, [sectionKey, allLanguages]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Push live preview updates into the iframe via postMessage
  const pushLivePreview = useCallback((langCode: string, fieldKey: string, fieldValue: string) => {
    try {
      const frame = previewIframeRef.current;
      if (!frame?.contentWindow) return;
      frame.contentWindow.postMessage({
        type: "cms_live_preview",
        section: sectionKey,
        lang: langCode,
        key: fieldKey,
        value: fieldValue,
      }, "*");
    } catch {}
  }, [sectionKey]);

  const handleChange = (langCode: string, key: string, value: string) => {
    setAllValues((prev) => {
      const next = { ...prev, [langCode]: { ...(prev[langCode] || {}), [key]: value } };
      setHasChanges(JSON.stringify(next) !== JSON.stringify(originalAllValues));
      return next;
    });
    pushLivePreview(langCode, key, value);
  };

  // Scroll to + highlight + focus a specific field row. Optionally switch language first.
  const jumpToField = (fieldKey: string, targetLang?: string) => {
    const doScroll = () => {
      const el = document.getElementById(`field-row-${fieldKey}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-destructive", "ring-offset-2", "ring-offset-background");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-destructive", "ring-offset-2", "ring-offset-background");
      }, 1800);
      el.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
    };
    if (targetLang && targetLang !== lang && onLangChange) {
      onLangChange(targetLang);
      // Wait for re-render before scrolling/focusing
      window.setTimeout(doScroll, 120);
    } else {
      doScroll();
    }
  };

  const handleSave = async (force = false) => {
    // Validation removed — admins can save/publish regardless of missing required fields.


    setSaving(true);
    try {
      // Build bulk items for ALL languages + track which fields actually changed
      const items: { section: string; key: string; lang: string; value: string; type: string }[] = [];
      const changedByLang: Record<string, Set<string>> = {};
      for (const l of allLanguages) {
        const langVals = allValues[l.code] || {};
        const origVals = originalAllValues[l.code] || {};
        for (const field of fields) {
          const newVal = langVals[field.field_key] || "";
          const oldVal = origVals[field.field_key] || "";
          if (newVal !== oldVal) {
            if (!changedByLang[l.code]) changedByLang[l.code] = new Set();
            changedByLang[l.code].add(field.field_key);
          }
          items.push({
            section: sectionKey,
            key: field.field_key,
            lang: l.code,
            value: newVal,
            type: field.field_type === "json" ? "json" : field.field_type === "number" ? "number" : "text",
          });
        }
      }

      await adminContent.saveBulk(items);
      setOriginalAllValues(JSON.parse(JSON.stringify(allValues)));
      setHasChanges(false);

      // Notify any open landing-page tab to refetch immediately
      const ts = String(Date.now());
      let storageOk = false;
      let broadcastOk = false;
      try { localStorage.setItem("cms_updated_at", ts); storageOk = true; } catch {}
      try {
        if (typeof BroadcastChannel !== "undefined") {
          const ch = new BroadcastChannel("cms_updates");
          ch.postMessage({ section: sectionKey, ts });
          ch.close();
          broadcastOk = true;
        }
      } catch {}

      // Auto-reload live preview iframe so admins see changes instantly
      setPreviewReloadKey(k => k + 1);

      // Build human-readable summary of what changed
      const changedFieldKeys = new Set<string>();
      const changedLangs: string[] = [];
      for (const [code, set] of Object.entries(changedByLang)) {
        if (set.size > 0) {
          changedLangs.push(code.toUpperCase());
          set.forEach(k => changedFieldKeys.add(k));
        }
      }

      const totalChanges = Object.values(changedByLang).reduce((sum, s) => sum + s.size, 0);
      const syncStatus =
        broadcastOk && storageOk
          ? "Live sync: ✓ broadcast + storage"
          : storageOk
          ? "Live sync: ✓ storage only (no BroadcastChannel)"
          : "Live sync: ✗ failed — other tabs may not refresh";

      // Resolve which public pages use this section (landing + custom pages)
      let pagesLine = "";
      try {
        const isGlobalSectionType = PAGE_SECTION_REGISTRY.some(s => s.type === sectionKey);
        const publishedPages = await pagesApi.listPublished();
        const slugs: string[] = [];
        // Landing page (/) shows every global section unless hidden
        if (isGlobalSectionType) slugs.push("/");
        for (const p of publishedPages) {
          const matches = (p.sections || []).some(sec =>
            isGlobalSectionType
              ? sec.section_type === sectionKey
              : sec.instance_key === sectionKey
          );
          if (matches) slugs.push(`/p/${p.slug}`);
        }
        pagesLine = slugs.length
          ? `Appears on: ${slugs.slice(0, 4).join(", ")}${slugs.length > 4 ? ` +${slugs.length - 4} more` : ""}`
          : "Appears on: no published pages yet";
      } catch {
        pagesLine = "Appears on: (page lookup failed)";
      }

      if (totalChanges === 0) {
        toast.success("✅ Saved — no changes detected", {
          description: syncStatus,
          duration: 3000,
        });
      } else {
        const langList = changedLangs.join(", ").toUpperCase();
        toast.success(`✅ ${totalChanges} change${totalChanges > 1 ? "s" : ""} saved`, {
          description: `${langList} • ${syncStatus}`,
          duration: 3500,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleJsonCollapse = (key: string) => {
    setCollapsedJsonFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!sectionKey) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Info className="w-8 h-8 mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium">Select a section to start editing</p>
        <p className="text-xs text-muted-foreground/50 mt-1">Choose from the sidebar on the left</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  // Helper: is this field type language-independent (images are shared across languages)
  const isLangIndependent = (fieldType: string) => fieldType === "image";

  // Per-language completeness: only count translatable fields (skip images)
  const translatableFields = fields.filter(f => !isLangIndependent(f.field_type));
  const requiredTranslatableFields = translatableFields.filter(f => f.is_required);
  const fieldCount = fields.length;
  const primaryVals = allValues[lang] || {};
  const filledCount = fields.filter(f => primaryVals[f.field_key]?.trim()).length;

  const langCompleteness = allLanguages.map(l => {
    const vals = allValues[l.code] || {};
    const filled = translatableFields.filter(f => vals[f.field_key]?.trim()).length;
    const requiredMissing = requiredTranslatableFields.filter(f => !vals[f.field_key]?.trim()).length;
    return {
      code: l.code,
      label: l.label,
      filled,
      total: translatableFields.length,
      requiredMissing,
      complete: filled === translatableFields.length,
    };
  });

  const renderFieldInput = (
    field: CmsField,
    langCode: string,
    langLabel: string,
    isRtl: boolean
  ) => {
    const val = allValues[langCode]?.[field.field_key] || "";

    if (field.field_type === "image") {
      // Images render only once (not per language)
      return null;
    }

    if (field.field_type === "textarea" || field.field_type === "rich_text") {
      return (
        <textarea
          value={val}
          onChange={(e) => handleChange(langCode, field.field_key, e.target.value)}
          rows={2}
          dir={isRtl ? "rtl" : "ltr"}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
          placeholder={`${langLabel}: ${field.placeholder || `Enter ${field.field_label.toLowerCase()}...`}`}
        />
      );
    }

    if (field.field_type === "json") {
      // Special visual editor for heroModules
      if (field.field_key === "heroModules") {
        return (
          <HeroModulesEditor
            value={val}
            onChange={(json) => handleChange(langCode, field.field_key, json)}
            langLabel={langLabel}
            isRtl={isRtl}
          />
        );
      }

      const isCollapsed = collapsedJsonFields.has(`${field.field_key}_${langCode}`);
      return (
        <div>
          <button
            type="button"
            onClick={() => {
              setCollapsedJsonFields(prev => {
                const next = new Set(prev);
                const k = `${field.field_key}_${langCode}`;
                if (next.has(k)) next.delete(k); else next.add(k);
                return next;
              });
            }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground mb-1 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
          {!isCollapsed && (
            <textarea
              value={val}
              onChange={(e) => handleChange(langCode, field.field_key, e.target.value)}
              rows={6}
              dir="ltr"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
              placeholder={`${langLabel}: Enter valid JSON...`}
            />
          )}
          {val && (() => {
            try {
              const parsed = JSON.parse(val);
              const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
              return (
                <p className="text-[10px] mt-0.5">
                  <span className="text-green-600">✓ Valid</span>
                  <span className="text-muted-foreground ml-1.5">{count} {Array.isArray(parsed) ? 'items' : 'keys'}</span>
                </p>
              );
            } catch {
              return <p className="text-[10px] text-destructive mt-0.5">✗ Invalid JSON</p>;
            }
          })()}
        </div>
      );
    }

    if (field.field_type === "number") {
      return (
        <input
          type="number"
          value={val}
          onChange={(e) => handleChange(langCode, field.field_key, e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder={field.placeholder || "0"}
        />
      );
    }

    // Default: text input
    return (
      <input
        type="text"
        value={val}
        onChange={(e) => handleChange(langCode, field.field_key, e.target.value)}
        dir={isRtl ? "rtl" : "ltr"}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        placeholder={`${langLabel}: ${field.placeholder || `Enter ${field.field_label.toLowerCase()}...`}`}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl px-8 py-6 shadow-2xl">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Saving content…</p>
            <p className="text-xs text-muted-foreground">Please wait</p>
          </div>
        </div>
      )}
      {/* Section Info Card */}
      {info && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-bold text-foreground">{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/([A-Z])/g, ' $1')}</h2>
                <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">{sectionKey}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
              <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      {allLanguages.map(l => (
                        <FlagIcon key={l.code} country={l.code} className="w-4 h-3" />
                      ))}
                      All Languages
                    </span>
                  </div>
                <div className="text-xs text-muted-foreground">
                  {filledCount}/{fieldCount} fields filled ({allLanguages.find(l => l.code === lang)?.label})
                </div>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${fieldCount > 0 ? (filledCount / fieldCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Per-language completeness badges */}
              {translatableFields.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-semibold mr-1">
                    Translations
                  </span>
                  {langCompleteness.map(lc => {
                    const isComplete = lc.complete;
                    const hasMissingRequired = lc.requiredMissing > 0;
                    const tone = isComplete
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : hasMissingRequired
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                    return (
                      <span
                        key={lc.code}
                        title={
                          isComplete
                            ? `${lc.label}: complete (${lc.filled}/${lc.total})`
                            : hasMissingRequired
                              ? `${lc.label}: ${lc.requiredMissing} required field${lc.requiredMissing > 1 ? "s" : ""} missing`
                              : `${lc.label}: ${lc.total - lc.filled} optional field${lc.total - lc.filled > 1 ? "s" : ""} empty`
                        }
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase ${tone}`}
                      >
                        <FlagIcon country={lc.code} className="w-3 h-2" />
                        {lc.code}
                        <span className="font-mono normal-case opacity-80">
                          {lc.filled}/{lc.total}
                        </span>
                        {hasMissingRequired && (
                          <AlertCircle className="w-2.5 h-2.5" />
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SectionHelpDrawer sectionKey={sectionKey} />
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showPreview ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? "Hide Preview" : "Live Preview"}
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              Where this appears on the live site: <span className="font-medium text-muted-foreground">{info.previewHint}</span>
            </p>
          </div>
        </div>
      )}

      {/* Live Preview iframe — device-aware, auto-scrolls to section anchor, auto-reloads on save */}
      {showPreview && (() => {
        // Anchor like "#hero" (from sectionInfo). "nav"/"navMega" use "#" = top of page.
        const rawAnchor = info?.anchor || "";
        const hash = rawAnchor && rawAnchor !== "#" ? rawAnchor : "";
        // IMPORTANT: query string MUST come before the hash, otherwise it becomes part of the fragment.
        const previewUrl = `/?adminPreview=1&v=${previewReloadKey}${hash}`;
        const deviceSizes = {
          desktop: { w: 1440, label: "Desktop" },
          tablet: { w: 834, label: "Tablet" },
          mobile: { w: 390, label: "Mobile" },
        } as const;
        const device = deviceSizes[previewDevice];
        const frameHeight = previewExpanded ? 720 : 480;
        // Fit the device width into the available admin pane (~860px). Never scale up.
        const scale = Math.min(1, 860 / device.w);
        // Inner iframe must be taller by 1/scale so scaled content fills the visible frame area.
        const innerHeight = frameHeight / scale;
        return (
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-6 shadow-sm">
            <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Live Preview</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {info?.previewHint}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
                  {(["desktop", "tablet", "mobile"] as const).map(d => {
                    const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
                    const active = previewDevice === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPreviewDevice(d)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                          active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={deviceSizes[d].label}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden md:inline">{deviceSizes[d].label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const frame = previewIframeRef.current;
                    if (!frame) return;
                    if (!hash) {
                      try { frame.contentWindow?.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
                      return;
                    }
                    try {
                      const doc = frame.contentDocument;
                      const el = doc?.querySelector(hash) as HTMLElement | null;
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      } else {
                        setPreviewReloadKey((k) => k + 1);
                      }
                    } catch {
                      setPreviewReloadKey((k) => k + 1);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={hash ? `Jump to ${hash}` : "Scroll preview to top"}
                >
                  <Crosshair className="w-3 h-3" />
                  <span className="hidden md:inline">Jump</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewReloadKey(k => k + 1)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Reload preview"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden md:inline">Reload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewExpanded(e => !e)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={previewExpanded ? "Shrink preview" : "Expand preview"}
                >
                  {previewExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden md:inline">Open</span>
                </a>
              </div>
            </div>
            <div
              className="relative bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden"
              style={{ height: frameHeight }}
            >
              <div
                className="absolute top-0 left-1/2"
                style={{
                  width: device.w,
                  height: innerHeight,
                  transform: `translateX(-50%) scale(${scale})`,
                  transformOrigin: "top center",
                }}
              >
                <iframe
                  ref={previewIframeRef}
                  key={previewReloadKey}
                  src={previewUrl}
                  className="w-full h-full border-0 bg-background"
                  title={`Section Preview — ${device.label}`}
                  onLoad={() => {
                    // Same-origin iframe — safely scroll to anchor as a fallback if hash navigation didn't.
                    try {
                      const doc = previewIframeRef.current?.contentDocument;
                      if (doc && hash) {
                        const el = doc.querySelector(hash);
                        if (el) (el as HTMLElement).scrollIntoView({ block: "start" });
                      }
                    } catch {
                      /* cross-origin or not ready */
                    }
                  }}
                />
              </div>
            </div>
            <div className="px-3 py-1.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
              <span>
                Preview auto-reloads when you save. Device:{" "}
                <span className="font-medium text-foreground">{device.label}</span> ({device.w}px
                {scale < 1 ? ` · ${Math.round(scale * 100)}% scale` : ""})
              </span>
              {hasChanges && (
                <span className="text-amber-600 font-medium">Unsaved — save to refresh preview</span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Validation banner removed — admins can save/publish with any fields filled as needed. */}

      {/* Save Bar */}
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-muted/30 backdrop-blur-sm py-3 -mx-6 px-6 rounded-xl">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="flex items-center gap-1.5 text-xs font-medium animate-pulse text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved changes
            </span>
          )}
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving all languages..." : "Save All Languages"}
        </button>
      </div>

      {/* Language legend */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Languages:</span>
        {allLanguages.map(l => (
          <span key={l.code} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <FlagIcon country={l.code} className="w-4 h-3" />
            <span className="font-medium">{l.label}</span>
          </span>
        ))}
      </div>

      {/* Mega-menu visual builder (only for navMega section) */}
      {sectionKey === "navMega" && (
        <div className="mb-6">
          <MegaMenuBuilder
            values={allValues}
            lang={lang}
            setLang={() => {}}
            allLanguages={allLanguages}
            onFieldChange={handleChange}
            onCopyFromLang={(source, target, keys) => {
              keys.forEach((k) => {
                const v = allValues[source]?.[k] || "";
                handleChange(target, k, v);
              });
              toast.success(`Copied structure from ${source.toUpperCase()} to ${target.toUpperCase()}`);
            }}
          />
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {fields.map((field) => {
          // Hide raw JSON editors for navMega — handled by visual builder above
          if (sectionKey === "navMega" && field.field_type === "json") return null;
          const helpText = fieldHelpText[sectionKey]?.[field.field_key];
          const isImage = isLangIndependent(field.field_type);

          return (
            <div key={field.field_key} id={`field-row-${field.field_key}`} className="bg-card rounded-xl border border-border p-5 transition-all hover:border-primary/20 scroll-mt-24">
              {/* Field header */}
              <div className="flex items-start justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {field.field_label}
                  {field.is_required ? <span className="text-destructive text-xs">*</span> : <span className="text-[10px] text-muted-foreground/40 italic">optional</span>}
                </label>
                <div className="flex items-center gap-1.5">
                  {!isImage && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      {allLanguages.length} langs
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground/50 font-mono bg-muted px-1.5 py-0.5 rounded">{field.field_key}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    field.field_type === 'image' ? 'bg-blue-500/10 text-blue-600' :
                    field.field_type === 'json' ? 'bg-purple-500/10 text-purple-600' :
                    field.field_type === 'textarea' ? 'bg-green-500/10 text-green-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {field.field_type}
                  </span>
                </div>
              </div>

              {helpText && (
                <p className="text-[11px] text-muted-foreground/60 mb-3 leading-relaxed">{helpText}</p>
              )}

              {/* Image fields: shared across languages, rendered once */}
              {isImage ? (
                <div className="space-y-2">
                  <ImageUploader
                    category={sectionImageCategory[sectionKey] || 'general'}
                    section={sectionKey}
                    currentValue={allValues[lang]?.[field.field_key] || undefined}
                    onSelect={(file) => {
                      // Set image URL for ALL languages
                      for (const l of allLanguages) {
                        handleChange(l.code, field.field_key, file.image_url);
                      }
                    }}
                  />
                  {allValues[lang]?.[field.field_key] && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={allValues[lang]?.[field.field_key] || ""}
                        onChange={(e) => {
                          for (const l of allLanguages) {
                            handleChange(l.code, field.field_key, e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Image URL"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveImageField(field.field_key);
                          setMediaLibraryOpen(true);
                        }}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                        title="Browse Media Library"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!allValues[lang]?.[field.field_key] && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageField(field.field_key);
                        setMediaLibraryOpen(true);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Or browse Media Library
                    </button>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Images are shared across all languages
                  </p>
                </div>
              ) : (
                /* Text/textarea/json/number: show input for EACH language */
                <div className="space-y-2">
                  {allLanguages.map((l) => (
                    <div key={l.code} className="flex items-start gap-2">
                      {/* Language badge */}
                      <div className="shrink-0 mt-2.5 w-16 flex items-center gap-1.5">
                        <FlagIcon country={l.code} className="w-4 h-3" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">{l.code}</span>
                      </div>
                      {/* Input */}
                      <div className="flex-1">
                        {renderFieldInput(field, l.code, l.label, l.code === "ar")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button at bottom */}
      {fields.length > 4 && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => handleSave()}
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving all languages..." : "Save All Languages"}
          </button>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(file) => {
          if (activeImageField) {
            // Set for all languages
            for (const l of allLanguages) {
              handleChange(l.code, activeImageField, file.image_url);
            }
          }
        }}
        category={sectionImageCategory[sectionKey] || 'general'}
      />
    </div>
  );
};

export default SectionEditor;
