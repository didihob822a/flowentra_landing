import {
  BookOpen, Globe, Image as ImageIcon, LayoutGrid, Type, Hash,
  History, ShieldCheck, Sparkles, Mail, BarChart3, Tag, Settings,
  Receipt, Eye, AlertCircle, CheckCircle2, Lightbulb, Pencil, ArrowRight,
  ShieldAlert, Loader2,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// Doc structure — shared by AdminDocs (full page) and SectionHelpDrawer
// ──────────────────────────────────────────────────────────────────────
export interface DocSubsection {
  title: string;
  body: string;
  tip?: string;
  warn?: string;
}
export interface DocSection {
  id: string;
  title: string;
  group: string;
  icon: React.ElementType;
  intro: string;
  fields?: { name: string; type: string; desc: string }[];
  steps?: string[];
  subsections?: DocSubsection[];
}

export const GROUPS = ["Basics", "Page Sections", "Admin Tools", "Reference"];

export const DOCS: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    group: "Basics",
    icon: BookOpen,
    intro:
      "Welcome to the Flowentra admin. This panel controls every piece of text, image, link, price, menu and color visible on the live website. Anything you save here goes live immediately — no code changes needed.",
    steps: [
      "Sign in at /admin with your admin email and password.",
      "On the left sidebar, pick a Page Section (Hero, Pricing, Footer…) — these match what visitors see on the homepage from top to bottom.",
      "Use the language switcher in the top bar (EN / FR / DE / AR) to edit one language at a time. Each language is stored separately.",
      "Edit a field, then click Save. If a required field is missing in any language, the editor blocks the save and shows you exactly which field — in which language — to fix (see 'Required-field validation' in the Reference group).",
      "Open the live site (top-left link) in another tab to verify.",
      "If something looks wrong, open Change History (clock icon, top right) to roll back.",
    ],
    subsections: [
      {
        title: "Sidebar groups explained",
        body:
          "Header & Navigation — top menu, hero banner.\n" +
          "Social Proof — trusted logos, testimonials, key metrics.\n" +
          "Product & Features — feature cards, screenshots, how-it-works steps, demo, industries, integrations.\n" +
          "Conversion — pricing plans, comparison table, CTA banner.\n" +
          "Support & Footer — FAQ, contact info, footer links.\n" +
          "Admin Tools — pricing/invoices, email manager, analytics, release notes, site settings.",
      },
      {
        title: "Top-bar buttons",
        body:
          "🌐 Language switcher — changes which language you are editing.\n" +
          "🕒 History — full change log; restore any previous version.\n" +
          "⬇️ Export — downloads ALL content as one JSON backup file.\n" +
          "⬆️ Import — restores content from a JSON backup (overwrites current).\n" +
          "🚪 Logout — ends your admin session.",
        tip: "Always click Export before doing big edits — you get a one-click rollback file.",
      },
    ],
  },
  {
    id: "languages",
    title: "Multi-language editing",
    group: "Basics",
    icon: Globe,
    intro:
      "The site supports four languages: English (EN), French (FR), German (DE) and Arabic (AR — right-to-left). Each language has its own copy of every piece of text. The visitor's browser language picks the version they see.",
    steps: [
      "Choose a section in the sidebar (e.g. Hero).",
      "In the top bar, click the language flag you want to edit.",
      "Edit the fields in that language — they only affect that language.",
      "Switch flag → edit again for the next language.",
      "If a language is left empty for a field, the site falls back to English automatically.",
    ],
    subsections: [
      {
        title: "100% of homepage text is editable",
        body:
          "Every visible string on the landing page is wired through the CMS — headline, sub-text, CTA labels, feature titles & descriptions, pricing labels, FAQ items, testimonials, footer links, even the trusted-by company names. If you spot text you can't find a field for, open this drawer on that section and check 'Editable fields' — it's listed.",
        tip: "Use the 'Save All Languages' button at the top of every section: it saves EN/FR/DE/AR in one click.",
      },
      {
        title: "Arabic (RTL)",
        body:
          "Arabic is right-to-left. When you edit Arabic text the input box flips automatically. On the live site the entire layout mirrors (menu on the right, text aligned right). Just translate the text — no extra work needed.",
        warn: "Don't paste English text into the Arabic field — visitors switching to Arabic will see broken layout.",
      },
    ],
  },

  // Page sections — keyed by sectionKey for drawer lookup
  {
    id: "hero",
    title: "Hero (top banner)",
    group: "Page Sections",
    icon: Sparkles,
    intro:
      "The Hero is the first thing visitors see — big headline, sub-text, two call-to-action buttons, animated gradient background, and the browser-mockup screenshot underneath.",
    fields: [
      { name: "headline", type: "Text", desc: "Main title. Keep under ~9 words for impact." },
      { name: "headlineSub", type: "Text", desc: "Small line under the headline (e.g. 'CRM · Field Service · Projects')." },
      { name: "subtext", type: "Textarea", desc: "One-paragraph value proposition under the headline." },
      { name: "tagline", type: "Textarea", desc: "Small grey paragraph under the subtext (e.g. 'Flowentra connects every function of your business…')." },
      { name: "cta", type: "Text", desc: "Primary button label (e.g. 'Request a Demo')." },
      { name: "ctaSecondary", type: "Text", desc: "Secondary button label (e.g. 'See features')." },
      { name: "trustLine", type: "Text", desc: "Small grey line under the buttons." },
      { name: "browserBarUrl", type: "Text", desc: "Fake URL shown in the browser mockup (e.g. 'app.flowentra.io')." },
      { name: "screenshotPlaceholder", type: "Text", desc: "Placeholder text inside the screenshot box." },
      { name: "appScreenshot", type: "Image", desc: "Optional real screenshot to replace the mockup." },
      { name: "heroModules", type: "JSON", desc: "Module switcher buttons. Array of {icon, label}. Icons: Lucide names (LayoutDashboard, Users, BarChart3, Zap, Shield, etc). Edit label per language." },
      { name: "heroBackground", type: "Image", desc: "Optional background image." },
    ],
    subsections: [
      {
        title: "Tips for a strong headline",
        body:
          "Lead with a benefit, not a feature.\n" +
          "Speak to the customer's outcome.\n" +
          "Keep it under 60 characters so it fits on mobile.",
        tip: "If you change the headline, also update the page title in Site Settings → SEO so search results match.",
      },
    ],
  },
  {
    id: "nav",
    title: "Top navigation",
    group: "Page Sections",
    icon: LayoutGrid,
    intro:
      "The top navigation bar — link labels and the right-side CTA buttons (desktop and mobile).",
    fields: [
      { name: "features", type: "Text", desc: "'Product' link label." },
      { name: "pricing", type: "Text", desc: "'Pricing' link label." },
      { name: "demo", type: "Text", desc: "'Demo' link label." },
      { name: "testimonials", type: "Text", desc: "'Testimonials' link label." },
      { name: "faq", type: "Text", desc: "'FAQ' link label." },
      { name: "contact", type: "Text", desc: "'Contact' link label (last item in the top nav)." },
      { name: "cta", type: "Text", desc: "Primary CTA button (e.g. 'Request Demo')." },
      { name: "signup", type: "Text", desc: "Secondary CTA button (e.g. 'Get Started')." },
      { name: "discover", type: "Text", desc: "Top-right desktop button label (defaults to 'Discover')." },
      { name: "languageLabel", type: "Text", desc: "Mobile menu language section header (e.g. 'Language')." },
      { name: "requestDemo", type: "Text", desc: "Mobile menu bottom CTA (e.g. 'Request Demo')." },
    ],
  },
  {
    id: "navMega",
    title: "Mega-menu (Product / Solutions / Resources)",
    group: "Page Sections",
    icon: LayoutGrid,
    intro:
      "Visual builder for the three big drop-down 'mega-menus'. Add tabs, items, icons, descriptions and links — no code needed.",
    steps: [
      "Open 'Nav Mega Menu' in the sidebar.",
      "Pick a language flag in the top bar.",
      "Expand one of the three menus (Product / Solutions / Resources).",
      "Click '+ Add tab' to create a new column on the left of the dropdown.",
      "Inside a tab, click '+ Add item' for each link card.",
      "For every item: pick an icon (200+ icons in 12 categories), set the label, an optional description, the link URL, and whether it's an internal page (/about) or anchor (#features).",
      "Drag tabs/items by their grip handle to reorder.",
      "Watch the Live preview on the right — it renders exactly what visitors see.",
      "Click Save when done.",
    ],
    subsections: [
      {
        title: "Internal page vs Anchor link",
        body:
          "Internal page — opens a real page on the site (e.g. /about, /pricing). Tick the 'Internal page' checkbox.\n" +
          "Anchor — scrolls to a section on the current page (e.g. #features, #faq). Untick the checkbox.",
        warn: "If you point an anchor to a section that doesn't exist (e.g. #foo), the click does nothing.",
      },
      {
        title: "Choosing icons",
        body:
          "Click the icon button next to any item — a picker opens with 200+ Lucide icons grouped into Business, People, Tech, Data, Files, Field & Map, Security, AI & Auto, UI, Facility, Health, Marketing. Type in the search box to filter.",
      },
    ],
  },
  {
    id: "trustedBy",
    title: "Trusted-by logos",
    group: "Page Sections",
    icon: ShieldCheck,
    intro:
      "Strip of customer/partner company names shown right under the hero, with a small heading.",
    fields: [
      { name: "title", type: "Text", desc: "Heading above the logos (e.g. 'They trust us')." },
      { name: "logos", type: "JSON list of strings", desc: "Array of company names — e.g. [\"Telnet\", \"BIAT\", \"Vermeg\"]." },
    ],
    subsections: [
      {
        title: "How to edit names",
        body:
          "The 'logos' field is a JSON array. Add or remove names — they appear as muted text in the strip. To switch to images instead, contact your developer (current design uses text for a cleaner look).",
      },
    ],
  },
  {
    id: "features",
    title: "Features (modules grid)",
    group: "Page Sections",
    icon: LayoutGrid,
    intro:
      "Grid of 12 module cards (e.g. CRM, Workflow, Dispatcher). Each card has an auto-assigned icon, a title and a short description.",
    fields: [
      { name: "title", type: "Text", desc: "Section title." },
      { name: "subtitle", type: "Text", desc: "One-line section subtitle." },
      { name: "items", type: "JSON list of {title, desc}", desc: "12 entries — order = display order." },
    ],
    subsections: [
      {
        title: "Why exactly 12 items?",
        body:
          "The grid is fixed at 12 module cards (3 columns × 4 rows on desktop). Add or remove items in the JSON, but keeping 12 looks best visually. Icons are assigned automatically in order.",
      },
    ],
  },
  {
    id: "productShowcase",
    title: "Product showcase",
    group: "Page Sections",
    icon: Sparkles,
    intro:
      "Detailed product highlights with screenshots — what the product looks like in action.",
    fields: [
      { name: "label", type: "Text", desc: "Small section label above the title." },
      { name: "title", type: "Text", desc: "Section title." },
      { name: "items", type: "JSON list of {tag, title, desc}", desc: "Each item is one showcase block." },
      { name: "browserBarHost", type: "Text", desc: "Hostname shown in each browser-mockup URL bar (e.g. 'app.flowentra.io')." },
      { name: "screenshotPrefix", type: "Text", desc: "Caption prefix shown inside the placeholder (e.g. 'Screenshot' → 'Screenshot — Dashboard')." },
    ],
  },
  {
    id: "howItWorks",
    title: "How it works (steps)",
    group: "Page Sections",
    icon: CheckCircle2,
    intro:
      "Step-by-step process showing how to get started with the product.",
    fields: [
      { name: "title", type: "Text", desc: "Section title." },
      { name: "items", type: "JSON list of {title, desc}", desc: "Each item is one numbered step. Order matters." },
    ],
  },
  {
    id: "metrics",
    title: "Metrics (animated counters)",
    group: "Page Sections",
    icon: BarChart3,
    intro:
      "Key statistics that demonstrate the product's impact. Numbers animate from 0 on scroll.",
    fields: [
      { name: "sectionLabel", type: "Text", desc: "Small label above the title (optional)." },
      { name: "title", type: "Text", desc: "Section title (optional)." },
      { name: "items", type: "JSON list of {value, suffix, label}", desc: "e.g. {\"value\": 2500, \"suffix\": \"+\", \"label\": \"Companies\"}." },
    ],
  },
  {
    id: "industryVerticals",
    title: "Industry verticals",
    group: "Page Sections",
    icon: LayoutGrid,
    intro:
      "Industries served — helps visitors identify if the product is for them.",
    fields: [
      { name: "title", type: "Text", desc: "Section title." },
      { name: "subtitle", type: "Text", desc: "Section subtitle." },
      { name: "items", type: "JSON list of {title, desc}", desc: "Each item is one industry card." },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    group: "Page Sections",
    icon: LayoutGrid,
    intro:
      "Third-party tools that integrate with the product.",
    fields: [
      { name: "label", type: "Text", desc: "Small section label." },
      { name: "title", type: "Text", desc: "Section title." },
      { name: "subtitle", type: "Textarea", desc: "Section subtitle." },
      { name: "comingSoon", type: "Text", desc: "'More coming soon' label." },
      { name: "items", type: "JSON list of strings", desc: "Integration names." },
    ],
  },
  {
    id: "pricing",
    title: "Pricing plans",
    group: "Page Sections",
    icon: Receipt,
    intro:
      "Three pricing cards (Basic, Professional, Enterprise) with per-user price, feature lists and a built-in calculator.",
    fields: [
      { name: "title", type: "Text", desc: "Section heading." },
      { name: "subtitle", type: "Text", desc: "Section description." },
      { name: "currency", type: "Text", desc: "e.g. 'TND', 'EUR'." },
      { name: "monthly", type: "Text", desc: "Monthly suffix (e.g. '/month')." },
      { name: "cta", type: "Text", desc: "Plan CTA button label." },
      { name: "popular", type: "Text", desc: "'Most Popular' badge label." },
      { name: "plans", type: "JSON list", desc: "Three plan objects — each {name, price/pricePerUser, features[], popular?}." },
    ],
    subsections: [
      {
        title: "Editing a price",
        body:
          "In the plans JSON, change `price` (or `pricePerUser`) to the new number (e.g. 39). The calculator multiplies this by the user count automatically.",
        warn: "Price must be a number or a numeric string ('39'). Don't write '39 TND' — the currency is added separately.",
      },
      {
        title: "Adding/removing features in a plan",
        body:
          "Each plan has a `features` array. Add a string for each line. Order = display order.",
      },
    ],
  },
  {
    id: "comparisonTable",
    title: "Comparison table",
    group: "Page Sections",
    icon: Hash,
    intro:
      "Side-by-side feature comparison between your product and competitors.",
    fields: [
      { name: "label", type: "Text", desc: "Small section label." },
      { name: "title", type: "Text", desc: "Section title." },
      { name: "productName", type: "Text", desc: "Your product name shown as the highlighted column header (defaults to 'Flowentra')." },
      { name: "featureColumnLabel", type: "Text", desc: "First column header (e.g. 'Feature')." },
      { name: "features", type: "JSON list of strings", desc: "Feature rows." },
      { name: "competitors", type: "JSON list of strings", desc: "Competitor column names." },
      { name: "competitorSupport", type: "JSON object", desc: "{\"CompetitorName\": [true, false, true, …]} — one boolean per feature row." },
    ],
  },
  {
    id: "testimonials",
    title: "Testimonials",
    group: "Page Sections",
    icon: Type,
    intro:
      "Customer reviews and quotes — social proof that builds trust.",
    fields: [
      { name: "sectionLabel", type: "Text", desc: "Small label above the title." },
      { name: "title", type: "Text", desc: "Section title." },
      { name: "subtitle", type: "Textarea", desc: "Section subtitle." },
      { name: "items", type: "JSON list of {name, role, quote}", desc: "Each item is one quote card." },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    group: "Page Sections",
    icon: AlertCircle,
    intro:
      "Frequently asked questions — reduces support load and addresses objections. Renders as an accordion.",
    fields: [
      { name: "title", type: "Text", desc: "Section title." },
      { name: "subtitle", type: "Textarea", desc: "Section subtitle." },
      { name: "items", type: "JSON list of {q, a}", desc: "q = question, a = answer." },
    ],
  },
  {
    id: "contact",
    title: "Contact section",
    group: "Page Sections",
    icon: Mail,
    intro:
      "Contact form labels, send button, and the info cards (phone, email, address).",
    fields: [
      { name: "title", type: "Text", desc: "Section title." },
      { name: "subtitle", type: "Textarea", desc: "Section subtitle." },
      { name: "firstName / lastName / email / company / message", type: "Text", desc: "Form field labels." },
      { name: "send", type: "Text", desc: "Submit button label." },
      { name: "info", type: "JSON list of {label, value}", desc: "Info cards (e.g. {\"label\":\"Email\",\"value\":\"hello@flowentra.io\"})." },
    ],
  },
  {
    id: "ctaBanner",
    title: "Final CTA banner",
    group: "Page Sections",
    icon: Tag,
    intro:
      "Full-width call-to-action banner above the footer. Last push for conversion.",
    fields: [
      { name: "title", type: "Text", desc: "Banner headline." },
      { name: "subtitle", type: "Textarea", desc: "Sub-text." },
      { name: "cta", type: "Text", desc: "Primary CTA label." },
      { name: "ctaSecondary", type: "Text", desc: "Secondary CTA label." },
      { name: "note", type: "Text", desc: "Small note under the buttons." },
      { name: "bulletPoints", type: "JSON list of strings", desc: "Optional bullet list." },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    group: "Page Sections",
    icon: LayoutGrid,
    intro:
      "Page footer — description, copyright, column labels and links.",
    fields: [
      { name: "desc", type: "Textarea", desc: "Short company description shown in the footer." },
      { name: "copyright", type: "Text", desc: "Copyright line." },
      { name: "tagline", type: "Text", desc: "Optional tagline." },
      { name: "about / support / integrations / legal / contact / product / company / resources", type: "Text", desc: "Column header labels." },
    ],
  },
  {
    id: "demo",
    title: "Demo preview",
    group: "Page Sections",
    icon: Eye,
    intro:
      "Interactive demo previews showing workflow automation and analytics dashboards inside a device frame. Every visible label, the device switcher, the URL bar, the bar-chart heights and the stat cards are now editable.",
    fields: [
      { name: "sectionLabel", type: "Text", desc: "Eyebrow label above the title (e.g. 'Live Demo')." },
      { name: "title / subtitle", type: "Text", desc: "Section title and subtitle." },
      { name: "workflow / workflowDesc / analytics / analyticsDesc", type: "Text", desc: "Tab labels and descriptions." },
      { name: "deviceDesktop / deviceTablet / deviceMobile", type: "Text", desc: "Labels of the 3 device-switcher buttons." },
      { name: "browserBarUrl", type: "Text", desc: "Fake URL shown in the device's browser bar." },
      { name: "screenshotNote", type: "Text", desc: "Small grey note shown under the device frame." },
      { name: "nodes", type: "JSON object", desc: "Workflow node labels {trigger, condition, action, email, log}." },
      { name: "stats", type: "JSON object", desc: "Analytics labels {revenue, users, completion}." },
      { name: "barChart", type: "JSON list of numbers", desc: "Heights of the analytics bars (0–100). e.g. [55, 72, 40, 88, …]." },
      { name: "analyticsStats", type: "JSON list of {label, value}", desc: "The 3 stat cards under the chart (e.g. {\"label\":\"Revenue\",\"value\":\"+24%\"})." },
    ],
  },

  // Admin tools
  {
    id: "media",
    title: "Media library (images)",
    group: "Admin Tools",
    icon: ImageIcon,
    intro:
      "Central place to upload, organize and reuse images. Every image field on the site accepts a Media Library URL.",
    steps: [
      "Open Site Settings → Media Library.",
      "Click 'Upload' and pick one or more files (PNG, JPG, SVG, WebP — max 5 MB each).",
      "Optional: assign a category (e.g. 'Logos', 'Screenshots').",
      "Hover an image and click the copy icon to copy its URL.",
      "Paste the URL into any image field in the CMS.",
    ],
    subsections: [
      {
        title: "Best practices",
        body:
          "Use SVG for logos (scales perfectly).\n" +
          "Use JPG for photos (smaller files).\n" +
          "Use PNG only when you need transparency.\n" +
          "Compress big images at tinypng.com before uploading.",
        tip: "Reuse the same URL across pages instead of uploading the same image twice.",
      },
    ],
  },
  {
    id: "email",
    title: "Email manager",
    group: "Admin Tools",
    icon: Mail,
    intro:
      "Configure SMTP, send broadcast campaigns, manage email templates and view sent history.",
    subsections: [
      {
        title: "SMTP setup",
        body:
          "Email Manager → SMTP Settings. Enter host, port, username, password and the 'From' address. Click 'Send test' before saving.",
        warn: "If SMTP is not configured, no contact-form submissions or campaigns will be delivered.",
      },
      {
        title: "Sending a campaign",
        body:
          "Email Manager → Campaigns → New → pick a template → choose recipients → send a test → click Send.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics dashboard",
    group: "Admin Tools",
    icon: BarChart3,
    intro:
      "Visitor counts, page views, top pages, country and source breakdowns — collected by the built-in tracker (no Google Analytics needed).",
  },
  {
    id: "pages",
    title: "Pages — custom page builder",
    group: "Admin Tools",
    icon: LayoutGrid,
    intro:
      "Build new pages by composing existing sections (Hero, Features, Pricing, FAQ, Testimonials, CTA, …). Each page lives at /p/<slug>, has its own SEO meta in 4 languages, and its own per-page content for every section you drop in.",
    steps: [
      "Open Pages → '+ New page'. Enter a title and slug (e.g. 'our-story' → /p/our-story).",
      "On the page editor, click '+ Add section' and pick the sections you want — Hero, Features, FAQ, etc.",
      "Drag sections by the grip handle to reorder. Click the eye icon to hide one without deleting it.",
      "Click the pencil ✎ on any section to open the standard Section Editor — your edits ONLY affect this page.",
      "Switch language tabs (EN / FR / DE / AR) to translate per-page content.",
      "When you're ready, click 'Publish' at the top right. The page is now live at /p/<slug>.",
    ],
    subsections: [
      {
        title: "How per-page content works",
        body:
          "Each section instance gets a unique key (e.g. page_3_hero_1) under the hood. Editing it does NOT change the same section on the homepage — only this page. If you don't customize a field, the page falls back to that section's homepage content so it always looks complete.",
      },
      {
        title: "Linking pages into navigation",
        body:
          "On the page editor, copy the /p/<slug> path. Then:\n" +
          "• Mega Menu — open Nav Mega Menu, add a new item, paste the URL.\n" +
          "• Top Navbar — open Nav, add the page to the 'Custom Nav Links' JSON: [{\"label\":\"Our Story\",\"href\":\"/p/our-story\"}].\n" +
          "• Footer — open Footer, add a link to the appropriate column.\n" +
          "Mobile menu mirrors all of the above automatically.",
        tip: "Use the linking helper buttons at the bottom of the page editor for one-click jumps to each editor.",
      },
      {
        title: "Drafts vs Published",
        body: "New pages are Drafts by default — invisible to visitors. Click 'Publish' when ready. Unpublishing keeps the page and its sections; only the public URL stops working.",
      },
    ],
  },
  {
    id: "releases",
    title: "Release notes",
    group: "Admin Tools",
    icon: Tag,
    intro:
      "Public changelog — every entry appears on /releases for visitors to read.",
    steps: [
      "Open Release Notes → '+ New release'.",
      "Set version (e.g. v2.4.0), date, and a short summary.",
      "Add bullet points under New / Improved / Fixed.",
      "Click Publish — the entry goes live immediately.",
    ],
  },
  {
    id: "settings",
    title: "Site settings",
    group: "Admin Tools",
    icon: Settings,
    intro:
      "Global settings: change your admin password, set SEO defaults, enable maintenance mode, manage admin users.",
    subsections: [
      { title: "SEO defaults", body: "Default page title, meta description, OpenGraph image, Twitter handle, favicon." },
      { title: "Maintenance mode", body: "Shows a 'We'll be back soon' page to all visitors. Admins can still log in to /admin.", warn: "Don't forget to turn it OFF when you're done!" },
      { title: "Admin users", body: "Add new admin accounts (Site Settings → Users → '+ Add user'). Each user has their own login and shows up in change history." },
    ],
  },
  {
    id: "history",
    title: "Change history & rollback",
    group: "Admin Tools",
    icon: History,
    intro:
      "Every save creates a history entry. See who changed what, when, and restore any previous version with one click.",
    steps: [
      "Click the clock icon (🕒) in the top bar.",
      "Filter by section, user or date.",
      "Click an entry to see a side-by-side diff.",
      "Click 'Restore' to replace the current content with that version.",
    ],
  },

  // Reference
  {
    id: "validation",
    title: "Required-field validation",
    group: "Reference",
    icon: ShieldAlert,
    intro:
      "The Section Editor blocks Save when required fields are missing — in ANY language, not just the one you're editing. This stops you from accidentally publishing a half-translated page.",
    steps: [
      "Click Save (or 'Save All Languages').",
      "If something is missing, a red banner appears at the top of the editor listing the exact field labels and the language each one is missing in (e.g. 'Headline — missing in FR, DE').",
      "Click 'Jump to first missing field' — the editor scrolls to and highlights it in the current language.",
      "Or click any language flag inside the banner to switch to that language and jump straight to its first missing field.",
      "Fill the field, click Save again. Repeat until the banner disappears.",
    ],
    subsections: [
      {
        title: "What counts as 'required'?",
        body:
          "Core fields that the live site needs to render correctly: headline / title / cta on Hero, plan name & price on Pricing, question & answer pairs on FAQ, etc. Optional fields (taglines, secondary buttons, screenshots) never block Save.",
        tip: "Empty languages still fall back to English on the live site — but validation makes sure you SEE the gap before publishing.",
      },
      {
        title: "Bypassing validation",
        body:
          "There is no override. If a field is genuinely optional but flagged as required, contact your developer — the rule lives in the section's editor schema, not in the database.",
        warn: "Don't paste a single space to 'fill' a field — validation trims whitespace and will still flag it.",
      },
    ],
  },
  {
    id: "loading-screen",
    title: "Landing-page loading screen",
    group: "Reference",
    icon: Loader2,
    intro:
      "First-time visitors of the homepage see a branded loading screen — the Flowentra logo with pulsing rings and three animated dots — while the page assets finish loading. It only shows once per browser session.",
    subsections: [
      {
        title: "When it appears",
        body:
          "Only on the landing page (/), and only the first time per session. Navigating between pages or coming back later in the same tab will NOT trigger it again.",
      },
      {
        title: "Customising it",
        body:
          "The logo is sourced from src/assets/flowentra-logo.png. Replace that file (same filename) to update the loader logo. Colours follow the design tokens (primary + accent), so changing the brand palette in Site Settings updates the dots and glow automatically.",
        tip: "To preview the loader during testing, open the site in a private/incognito window — sessionStorage is cleared.",
      },
      {
        title: "Minimum display time",
        body:
          "The loader stays visible for at least 1.4 seconds, even on fast connections, so the brand impression always lands. After that, it fades out as soon as the page finishes loading.",
      },
    ],
  },
  {
    id: "patterns",
    title: "Common patterns & field types",
    group: "Reference",
    icon: Hash,
    intro:
      "Quick reference for the field types you'll see in the editor.",
    subsections: [
      { title: "Text", body: "Plain text input. What you type is what visitors see. Line breaks are kept." },
      { title: "Toggle (on/off)", body: "Switch — used for things like 'Show banner' or 'Mark plan as popular'." },
      { title: "Image URL", body: "A URL pointing to a file in the Media Library. Click the small image icon next to the field to open the picker." },
      { title: "Link", body: "Internal route (/about), in-page anchor (#pricing) or full external URL (https://…)." },
      { title: "JSON list", body: "Ordered list of items (FAQ entries, pricing plans, etc.). Most JSON lists have a visual builder.", warn: "When editing raw JSON: keep quotes balanced and don't remove commas — or the section won't render." },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    group: "Reference",
    icon: AlertCircle,
    intro: "Common problems and fixes.",
    subsections: [
      { title: "I saved but the live site didn't update", body: "1. Hard-refresh the live page (Ctrl+Shift+R / Cmd+Shift+R).\n2. Make sure you saved in the right language (top-bar flag).\n3. Open Change History to confirm the save was recorded." },
      { title: "A section shows broken/empty", body: "Likely a JSON syntax error. Open Change History, restore the previous version, then try the edit again carefully." },
      { title: "Image doesn't appear", body: "Check the URL pastes correctly (no trailing space). Open the URL directly in your browser — if it doesn't load there, re-upload the file." },
      { title: "Forgot password", body: "Use the 'Forgot password' link on the login page. A reset email will be sent if SMTP is configured." },
    ],
  },
];

// Map sectionKey (used in CMS) → docId (used in DOCS) for contextual help lookup
export const SECTION_TO_DOC: Record<string, string> = {
  nav: "nav",
  navMega: "navMega",
  hero: "hero",
  trustedBy: "trustedBy",
  features: "features",
  productShowcase: "productShowcase",
  howItWorks: "howItWorks",
  metrics: "metrics",
  industryVerticals: "industryVerticals",
  integrations: "integrations",
  pricing: "pricing",
  comparisonTable: "comparisonTable",
  testimonials: "testimonials",
  faq: "faq",
  contact: "contact",
  ctaBanner: "ctaBanner",
  footer: "footer",
  demo: "demo",
};

export function findDocForSection(sectionKey: string): DocSection | undefined {
  const id = SECTION_TO_DOC[sectionKey];
  if (!id) return undefined;
  return DOCS.find((d) => d.id === id);
}

// Reverse map: docId → sectionKey (for "Go to editor" button)
export const DOC_TO_SECTION: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_TO_DOC).map(([k, v]) => [v, k])
);

// ──────────────────────────────────────────────────────────────────────
// Shared renderer — same look in full Docs page and Help drawer
// ──────────────────────────────────────────────────────────────────────
export const DocContent = ({
  doc,
  onJumpToSection,
}: {
  doc: DocSection;
  onJumpToSection?: (sectionKey: string) => void;
}) => {
  const sectionKey = DOC_TO_SECTION[doc.id];
  const canJump = !!sectionKey && !!onJumpToSection;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {doc.group}
        </span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-3">
        <doc.icon className="w-6 h-6 text-primary" />
        {doc.title}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{doc.intro}</p>

      {canJump && (
        <button
          onClick={() => onJumpToSection!(sectionKey)}
          className="mb-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Pencil className="w-3.5 h-3.5" />
          Open this section in the editor
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

      {doc.steps && doc.steps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Step by step
          </h3>
          <ol className="space-y-2">
            {doc.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {doc.fields && doc.fields.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Editable fields
          </h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Field</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.fields.map((f) => (
                  <tr key={f.name} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-mono text-[11px] text-foreground break-all">{f.name}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{f.type}</td>
                    <td className="px-3 py-2 text-muted-foreground">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {doc.subsections?.map((sub, i) => (
        <div key={i} className="mb-5">
          <h3 className="text-sm font-bold text-foreground mb-2">{sub.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{sub.body}</p>
          {sub.tip && (
            <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-semibold text-primary">Tip — </span>
                {sub.tip}
              </p>
            </div>
          )}
          {sub.warn && (
            <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-semibold text-destructive">Warning — </span>
                {sub.warn}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
