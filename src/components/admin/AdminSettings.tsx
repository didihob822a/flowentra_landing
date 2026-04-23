import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Shield, Lock, Unlock, Save, Eye, EyeOff, Key, Globe, Palette,
  Search, Share2, FileCode, Tag, Image, Link, Twitter, Facebook,
  Monitor, Bot, MapPin, BarChart3, Code, ChevronDown, ChevronUp,
  Info, ExternalLink, CheckCircle
} from "lucide-react";

// ==================== TYPES & STORAGE ====================

interface SeoSettings {
  // Basic
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  canonicalUrl: string;
  faviconUrl: string;
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogSiteName: string;
  ogType: string;
  ogLocale: string;
  // Twitter
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  // Robots
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsNoArchive: boolean;
  robotsNoSnippet: boolean;
  // Schema / JSON-LD
  schemaType: string;
  schemaName: string;
  schemaDescription: string;
  schemaUrl: string;
  schemaEmail: string;
  schemaPriceLow: string;
  schemaPriceHigh: string;
  schemaCurrency: string;
  // Analytics
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSearchConsoleId: string;
  // Sitemap
  sitemapEnabled: boolean;
  sitemapChangeFreq: string;
  sitemapPriority: string;
}

interface SiteSettings {
  passwordProtectionEnabled: boolean;
  accessPassword: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  seo: SeoSettings;
}

const SETTINGS_KEY = "flowentra_site_settings";

function getDefaultSeo(): SeoSettings {
  return {
    siteTitle: "Flowentra",
    siteDescription: "Enterprise-grade business management platform",
    siteKeywords: "CRM, automation, analytics, AI, business management",
    canonicalUrl: "https://flowentra.com",
    faviconUrl: "",
    ogTitle: "Flowentra",
    ogDescription: "All-in-one business management platform with CRM, automation, analytics, and AI.",
    ogImage: "",
    ogSiteName: "Flowentra",
    ogType: "website",
    ogLocale: "fr_FR",
    twitterCard: "summary_large_image",
    twitterSite: "@flowentra",
    twitterCreator: "@flowentra",
    twitterTitle: "Flowentra",
    twitterDescription: "",
    twitterImage: "",
    robotsIndex: true,
    robotsFollow: true,
    robotsNoArchive: false,
    robotsNoSnippet: false,
    schemaType: "SoftwareApplication",
    schemaName: "Flowentra",
    schemaDescription: "All-in-one business management platform with CRM, automation, analytics, and AI.",
    schemaUrl: "https://flowentra.com",
    schemaEmail: "support@flowentra.com",
    schemaPriceLow: "49",
    schemaPriceHigh: "349",
    schemaCurrency: "TND",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    googleSearchConsoleId: "",
    sitemapEnabled: true,
    sitemapChangeFreq: "weekly",
    sitemapPriority: "0.8",
  };
}

function getDefaultSettings(): SiteSettings {
  return {
    passwordProtectionEnabled: true,
    accessPassword: "Flowentra2026",
    maintenanceMode: false,
    maintenanceMessage: "We're performing scheduled maintenance. Please check back soon.",
    seo: getDefaultSeo(),
  };
}

function loadSettings(): SiteSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old format
      if (!parsed.seo) {
        return {
          ...getDefaultSettings(),
          passwordProtectionEnabled: parsed.passwordProtectionEnabled ?? true,
          accessPassword: parsed.accessPassword ?? "Flowentra2026",
          maintenanceMode: parsed.maintenanceMode ?? false,
          maintenanceMessage: parsed.maintenanceMessage ?? "",
          seo: {
            ...getDefaultSeo(),
            siteTitle: parsed.siteTitle || "Flowentra",
            siteDescription: parsed.siteDescription || "",
          },
        };
      }
      return { ...getDefaultSettings(), ...parsed, seo: { ...getDefaultSeo(), ...parsed.seo } };
    }
    return getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
}

function saveSettings(settings: SiteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("flowentra_settings_changed", { detail: settings }));
}

export function getSiteSettings(): SiteSettings {
  return loadSettings();
}

// ==================== COLLAPSIBLE SECTION ====================

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
  defaultOpen = false,
  badge,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              {badge && (
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border/50 pt-4">{children}</div>}
    </div>
  );
};

// ==================== INPUT HELPERS ====================

const FieldInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  rows?: number;
}) => (
  <div>
    <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
      />
    )}
    {hint && <p className="text-[10px] text-muted-foreground/60 mt-1">{hint}</p>}
  </div>
);

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  </div>
);

// ==================== COMPONENT ====================

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(loadSettings());
  const [showPassword, setShowPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [original, setOriginal] = useState<SiteSettings>(loadSettings());

  const update = (updates: Partial<SiteSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    setHasChanges(JSON.stringify(next) !== JSON.stringify(original));
  };

  const updateSeo = (updates: Partial<SeoSettings>) => {
    update({ seo: { ...settings.seo, ...updates } });
  };

  const handleSave = () => {
    saveSettings(settings);
    setOriginal({ ...settings });
    setHasChanges(false);
    toast.success("Settings saved successfully");
  };

  const seo = settings.seo;

  // SEO score
  const seoChecks = [
    { label: "Title set", ok: seo.siteTitle.length > 0 && seo.siteTitle.length < 60 },
    { label: "Description set", ok: seo.siteDescription.length > 0 && seo.siteDescription.length < 160 },
    { label: "Keywords set", ok: seo.siteKeywords.length > 0 },
    { label: "Canonical URL", ok: seo.canonicalUrl.startsWith("https://") },
    { label: "OG Image set", ok: seo.ogImage.length > 0 },
    { label: "Twitter card", ok: seo.twitterCard.length > 0 },
    { label: "Schema.org data", ok: seo.schemaType.length > 0 },
    { label: "Indexing enabled", ok: seo.robotsIndex },
  ];
  const seoScore = Math.round((seoChecks.filter(c => c.ok).length / seoChecks.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Save Bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-muted/30 backdrop-blur-sm py-3 -mx-6 px-6 rounded-xl">
        <h2 className="text-base font-bold">Site Settings & SEO</h2>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          {hasChanges ? "Save Changes" : "Saved"}
        </button>
      </div>

      {/* SEO Score Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              seoScore >= 80 ? "bg-green-500/10 text-green-600" :
              seoScore >= 50 ? "bg-amber-500/10 text-amber-600" :
              "bg-destructive/10 text-destructive"
            }`}>
              {seoScore}
            </div>
            <div>
              <h3 className="text-sm font-bold">SEO Health Score</h3>
              <p className="text-[11px] text-muted-foreground">
                {seoScore >= 80 ? "Great! Most SEO settings are configured" :
                 seoScore >= 50 ? "Good start, but some fields need attention" :
                 "Several SEO settings need to be configured"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {seoChecks.map(c => (
            <div key={c.label} className="flex items-center gap-1.5 text-xs">
              <CheckCircle className={`w-3 h-3 ${c.ok ? "text-green-500" : "text-muted-foreground/30"}`} />
              <span className={c.ok ? "text-foreground" : "text-muted-foreground/50"}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password Protection */}
      <SettingsSection icon={Lock} title="Password Protection" description="Require a password to access the landing page" defaultOpen={false}>
        <ToggleRow
          label="Enable Password"
          description="Visitors must enter a password to view the site"
          checked={settings.passwordProtectionEnabled}
          onChange={v => update({ passwordProtectionEnabled: v })}
        />
        {settings.passwordProtectionEnabled && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Access Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={settings.accessPassword}
                onChange={e => update({ accessPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter access password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* Maintenance Mode */}
      <SettingsSection icon={Shield} title="Maintenance Mode" description="Display a maintenance page instead of site content">
        <ToggleRow
          label="Enable Maintenance"
          description="Show maintenance page to all visitors"
          checked={settings.maintenanceMode}
          onChange={v => update({ maintenanceMode: v })}
        />
        {settings.maintenanceMode && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <FieldInput
              label="Maintenance Message"
              value={settings.maintenanceMessage}
              onChange={v => update({ maintenanceMessage: v })}
              placeholder="We're performing scheduled maintenance..."
              rows={2}
            />
          </div>
        )}
      </SettingsSection>

      {/* Basic SEO */}
      <SettingsSection icon={Search} title="Basic SEO" description="Title, description, keywords, and canonical URL" defaultOpen={true} badge="Important">
        <div className="space-y-4">
          <FieldInput
            label="Page Title"
            value={seo.siteTitle}
            onChange={v => updateSeo({ siteTitle: v })}
            placeholder="Flowentra — All-in-One Business Platform"
            hint={`${seo.siteTitle.length}/60 characters ${seo.siteTitle.length > 60 ? "⚠️ Too long" : "✓"}`}
          />
          <FieldInput
            label="Meta Description"
            value={seo.siteDescription}
            onChange={v => updateSeo({ siteDescription: v })}
            placeholder="Manage your entire business from one platform..."
            rows={2}
            hint={`${seo.siteDescription.length}/160 characters ${seo.siteDescription.length > 160 ? "⚠️ Too long" : "✓"}`}
          />
          <FieldInput
            label="Keywords"
            value={seo.siteKeywords}
            onChange={v => updateSeo({ siteKeywords: v })}
            placeholder="CRM, automation, analytics, AI, business management"
            hint="Comma-separated keywords for search engines"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldInput
              label="Canonical URL"
              value={seo.canonicalUrl}
              onChange={v => updateSeo({ canonicalUrl: v })}
              placeholder="https://flowentra.com"
              hint="Primary URL to avoid duplicate content issues"
            />
            <FieldInput
              label="Favicon URL"
              value={seo.faviconUrl}
              onChange={v => updateSeo({ faviconUrl: v })}
              placeholder="https://yourdomain.com/favicon.png"
              hint="Browser tab icon (32x32 PNG recommended)"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Open Graph */}
      <SettingsSection icon={Share2} title="Open Graph (Facebook / LinkedIn)" description="Control how your site appears when shared on social media">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldInput label="OG Title" value={seo.ogTitle} onChange={v => updateSeo({ ogTitle: v })} placeholder="Flowentra" />
            <FieldInput label="OG Site Name" value={seo.ogSiteName} onChange={v => updateSeo({ ogSiteName: v })} placeholder="Flowentra" />
          </div>
          <FieldInput
            label="OG Description"
            value={seo.ogDescription}
            onChange={v => updateSeo({ ogDescription: v })}
            placeholder="All-in-one business management platform..."
            rows={2}
          />
          <FieldInput
            label="OG Image URL"
            value={seo.ogImage}
            onChange={v => updateSeo({ ogImage: v })}
            placeholder="https://flowentra.com/og-image.jpg"
            hint="Recommended: 1200×630px. This image shows in social media previews"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">OG Type</label>
              <select
                value={seo.ogType}
                onChange={e => updateSeo({ ogType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="product">Product</option>
              </select>
            </div>
            <FieldInput label="OG Locale" value={seo.ogLocale} onChange={v => updateSeo({ ogLocale: v })} placeholder="fr_FR" hint="e.g. fr_FR, en_US, ar_TN" />
          </div>

          {/* Preview Card */}
          {(seo.ogTitle || seo.ogDescription) && (
            <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
              <p className="text-[10px] font-semibold text-muted-foreground px-3 py-2 border-b border-border/50">Social Preview</p>
              <div className="p-3">
                {seo.ogImage && (
                  <div className="w-full h-32 bg-muted rounded-lg mb-2 overflow-hidden">
                    <img src={seo.ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                  </div>
                )}
                <p className="text-xs font-bold text-foreground truncate">{seo.ogTitle || seo.siteTitle}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{seo.ogDescription || seo.siteDescription}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">{seo.canonicalUrl}</p>
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Twitter */}
      <SettingsSection icon={Twitter} title="Twitter / X Cards" description="Control how your site appears when shared on X (Twitter)">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Card Type</label>
              <select
                value={seo.twitterCard}
                onChange={e => updateSeo({ twitterCard: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="summary_large_image">Large Image</option>
                <option value="summary">Summary</option>
                <option value="app">App</option>
              </select>
            </div>
            <FieldInput label="Twitter Site" value={seo.twitterSite} onChange={v => updateSeo({ twitterSite: v })} placeholder="@flowentra" />
          </div>
          <FieldInput label="Twitter Creator" value={seo.twitterCreator} onChange={v => updateSeo({ twitterCreator: v })} placeholder="@flowentra" />
          <FieldInput label="Twitter Title" value={seo.twitterTitle} onChange={v => updateSeo({ twitterTitle: v })} placeholder="Flowentra" hint="Leave empty to use OG title" />
          <FieldInput label="Twitter Description" value={seo.twitterDescription} onChange={v => updateSeo({ twitterDescription: v })} placeholder="" hint="Leave empty to use OG description" />
          <FieldInput label="Twitter Image" value={seo.twitterImage} onChange={v => updateSeo({ twitterImage: v })} placeholder="" hint="Leave empty to use OG image" />
        </div>
      </SettingsSection>

      {/* Robots */}
      <SettingsSection icon={Bot} title="Robots & Crawling" description="Control how search engines crawl and index your site">
        <div className="space-y-2">
          <ToggleRow label="Allow Indexing" description="Let search engines index your pages" checked={seo.robotsIndex} onChange={v => updateSeo({ robotsIndex: v })} />
          <ToggleRow label="Allow Following Links" description="Let search engines follow links on your pages" checked={seo.robotsFollow} onChange={v => updateSeo({ robotsFollow: v })} />
          <ToggleRow label="No Archive" description="Prevent search engines from caching pages" checked={seo.robotsNoArchive} onChange={v => updateSeo({ robotsNoArchive: v })} />
          <ToggleRow label="No Snippet" description="Prevent search engines from showing text snippets" checked={seo.robotsNoSnippet} onChange={v => updateSeo({ robotsNoSnippet: v })} />

          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground mb-2">Generated robots meta tag:</p>
            <code className="text-xs bg-muted px-3 py-2 rounded-lg block font-mono text-foreground">
              {`<meta name="robots" content="${seo.robotsIndex ? 'index' : 'noindex'}, ${seo.robotsFollow ? 'follow' : 'nofollow'}${seo.robotsNoArchive ? ', noarchive' : ''}${seo.robotsNoSnippet ? ', nosnippet' : ''}" />`}
            </code>
          </div>
        </div>
      </SettingsSection>

      {/* Schema / JSON-LD */}
      <SettingsSection icon={FileCode} title="Structured Data (JSON-LD)" description="Schema.org markup for rich search results">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Schema Type</label>
            <select
              value={seo.schemaType}
              onChange={e => updateSeo({ schemaType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="SoftwareApplication">Software Application</option>
              <option value="Organization">Organization</option>
              <option value="WebApplication">Web Application</option>
              <option value="Product">Product</option>
              <option value="Service">Service</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldInput label="Name" value={seo.schemaName} onChange={v => updateSeo({ schemaName: v })} placeholder="Flowentra" />
            <FieldInput label="URL" value={seo.schemaUrl} onChange={v => updateSeo({ schemaUrl: v })} placeholder="https://flowentra.com" />
          </div>
          <FieldInput label="Description" value={seo.schemaDescription} onChange={v => updateSeo({ schemaDescription: v })} placeholder="..." rows={2} />
          <FieldInput label="Contact Email" value={seo.schemaEmail} onChange={v => updateSeo({ schemaEmail: v })} placeholder="support@flowentra.com" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FieldInput label="Price Low" value={seo.schemaPriceLow} onChange={v => updateSeo({ schemaPriceLow: v })} placeholder="49" />
            <FieldInput label="Price High" value={seo.schemaPriceHigh} onChange={v => updateSeo({ schemaPriceHigh: v })} placeholder="349" />
            <FieldInput label="Currency" value={seo.schemaCurrency} onChange={v => updateSeo({ schemaCurrency: v })} placeholder="TND" />
          </div>

          <div className="mt-2 pt-3 border-t border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground mb-2">Generated JSON-LD preview:</p>
            <pre className="text-[10px] bg-muted px-3 py-2 rounded-lg font-mono text-foreground overflow-x-auto max-h-40 overflow-y-auto">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": seo.schemaType,
  name: seo.schemaName,
  description: seo.schemaDescription,
  url: seo.schemaUrl,
  ...(seo.schemaType === "SoftwareApplication" ? {
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
  } : {}),
  author: {
    "@type": "Organization",
    name: seo.schemaName,
    url: seo.schemaUrl,
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: seo.schemaEmail },
  },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: seo.schemaPriceLow,
    highPrice: seo.schemaPriceHigh,
    priceCurrency: seo.schemaCurrency,
  },
}, null, 2)}
            </pre>
          </div>
        </div>
      </SettingsSection>

      {/* Analytics & Tracking */}
      <SettingsSection icon={BarChart3} title="Analytics & Tracking" description="Google Analytics, Tag Manager, and Search Console">
        <div className="space-y-4">
          <FieldInput
            label="Google Analytics ID"
            value={seo.googleAnalyticsId}
            onChange={v => updateSeo({ googleAnalyticsId: v })}
            placeholder="G-XXXXXXXXXX"
            hint="Google Analytics 4 measurement ID"
          />
          <FieldInput
            label="Google Tag Manager ID"
            value={seo.googleTagManagerId}
            onChange={v => updateSeo({ googleTagManagerId: v })}
            placeholder="GTM-XXXXXXX"
            hint="Container ID for Tag Manager"
          />
          <FieldInput
            label="Google Search Console Verification"
            value={seo.googleSearchConsoleId}
            onChange={v => updateSeo({ googleSearchConsoleId: v })}
            placeholder="verification-code"
            hint="HTML tag verification code"
          />
        </div>
      </SettingsSection>

      {/* Sitemap */}
      <SettingsSection icon={MapPin} title="Sitemap Settings" description="Configure sitemap generation for search engines">
        <div className="space-y-3">
          <ToggleRow label="Sitemap Enabled" description="Auto-generate sitemap.xml for search engines" checked={seo.sitemapEnabled} onChange={v => updateSeo({ sitemapEnabled: v })} />
          {seo.sitemapEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/50">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Change Frequency</label>
                <select
                  value={seo.sitemapChangeFreq}
                  onChange={e => updateSeo({ sitemapChangeFreq: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <FieldInput label="Priority" value={seo.sitemapPriority} onChange={v => updateSeo({ sitemapPriority: v })} placeholder="0.8" hint="0.0 to 1.0" />
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Status Summary */}
      <div className="bg-muted/50 border border-border rounded-xl p-5">
        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">Current Status</h4>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.passwordProtectionEnabled ? "bg-amber-500" : "bg-green-500"}`} />
            Password: {settings.passwordProtectionEnabled ? "Enabled" : "Disabled"}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.maintenanceMode ? "bg-destructive" : "bg-green-500"}`} />
            Maintenance: {settings.maintenanceMode ? "ON" : "OFF"}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${seo.robotsIndex ? "bg-green-500" : "bg-amber-500"}`} />
            Indexing: {seo.robotsIndex ? "ON" : "OFF"}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${seoScore >= 80 ? "bg-green-500" : seoScore >= 50 ? "bg-amber-500" : "bg-destructive"}`} />
            SEO Score: {seoScore}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
