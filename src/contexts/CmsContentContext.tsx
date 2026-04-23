import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePageSection } from "@/contexts/PageSectionContext";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://luccibyey.com.tn/flowentra/api';

interface CmsContextType {
  cmsData: Record<string, Record<string, Record<string, string>>>; // section -> lang -> key -> value
  cmsTypes: Record<string, Record<string, string>>; // section -> key -> content_type
  hiddenSections: Set<string>; // section keys with is_active = 0
  loading: boolean;
  refresh: () => void;
}

const CmsContentContext = createContext<CmsContextType>({
  cmsData: {},
  cmsTypes: {},
  hiddenSections: new Set(),
  loading: false,
  refresh: () => {},
});

export const CmsContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cmsData, setCmsData] = useState<Record<string, Record<string, Record<string, string>>>>({});
  const [cmsTypes, setCmsTypes] = useState<Record<string, Record<string, string>>>({});
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const dataHashRef = useRef<string>("");
  const isFirstLoadRef = useRef(true);

  const fetchAll = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Cache-busting via query param only — avoid Cache-Control/Pragma headers
      // because they trigger CORS preflight rejections on the PHP backend.
      const res = await fetch(`${API_BASE}/content.php?action=get_all&_=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.success && json.data) {
        // API actually returns: { lang: { section: { key: value } } }
        // We need: { section: { lang: { key: value } } }
        const transformed: Record<string, Record<string, Record<string, string>>> = {};
        for (const [lang, sections] of Object.entries(json.data as Record<string, Record<string, Record<string, string>>>)) {
          for (const [section, keys] of Object.entries(sections)) {
            if (!transformed[section]) transformed[section] = {};
            if (!transformed[section][lang]) transformed[section][lang] = {};
            for (const [key, value] of Object.entries(keys)) {
              transformed[section][lang][key] = value as string;
            }
          }
        }

        // Detect actual change: hash payload, compare with previous
        const newHash = JSON.stringify(transformed);
        const changed = newHash !== dataHashRef.current;

        if (changed) {
          dataHashRef.current = newHash;
          setCmsData(transformed);
          if (json.types && typeof json.types === "object") {
            setCmsTypes(json.types);
          }

          // Toast only on subsequent updates (not initial load), and only for admins
          const isAdmin = !!localStorage.getItem("admin_token");
          if (!isFirstLoadRef.current && isAdmin) {
            toast.success("Content updated", {
              description: "Latest changes are now live on this page.",
              duration: 2500,
            });
          }
        }
        isFirstLoadRef.current = false;
      }
    } catch {
      // Silently fail — components fall back to hardcoded i18n
    } finally {
      setLoading(false);
    }

    // Fetch section visibility (separate, non-blocking — failure leaves all visible)
    try {
      const r = await fetch(`${API_BASE}/content.php?action=sections_status&_=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        if (j.success && Array.isArray(j.data)) {
          const hidden = new Set<string>(
            j.data.filter((s: any) => Number(s.is_active) === 0).map((s: any) => s.section_key)
          );
          setHiddenSections(hidden);
        }
      }
    } catch {
      // ignore — keep current visibility map
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Live preview: listen for postMessage from admin SectionEditor iframe parent
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || e.data.type !== "cms_live_preview") return;
      const { section, lang, key, value } = e.data as {
        section: string; lang: string; key: string; value: string;
      };
      if (!section || !lang || !key) return;
      setCmsData((prev) => {
        const sectionData = prev[section] || {};
        const langData = sectionData[lang] || {};
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [lang]: { ...langData, [key]: value },
          },
        };
      });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Auto-refresh: tab focus + cross-tab BroadcastChannel + interval polling
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchAll(false);
    };
    const handleFocus = () => fetchAll(false);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cms_updated_at") fetchAll(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    // BroadcastChannel for instant same-browser cross-tab sync
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("cms_updates");
      channel.onmessage = () => fetchAll(false);
    }

    // Poll every 15s while tab is visible — catches edits from other devices
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchAll(false);
    }, 15000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      channel?.close();
      clearInterval(interval);
    };
  }, [fetchAll]);

  return (
    <CmsContentContext.Provider value={{ cmsData, cmsTypes, hiddenSections, loading, refresh: fetchAll }}>
      {children}
    </CmsContentContext.Provider>
  );
};

export function useSectionVisibility() {
  return useContext(CmsContentContext).hiddenSections;
}

// Legacy fallback list — used when the backend doesn't yet return a `types` map
// (e.g. older PHP deployment). Once the new content.php is live, cmsTypes wins.
const LEGACY_JSON_KEYS = new Set([
  "items", "plans", "logos", "nodes", "stats",
  "features", "competitors", "competitorSupport", "info",
  "bulletPoints", "products", "customLinks",
  "product", "solutions", "resources",
]);

/**
 * Hook to get CMS content for a section + language, with fallback to defaults.
 * Usage: const content = useCmsSection("hero", lang, defaultValues);
 */
export function useCmsSection<T extends Record<string, any>>(
  section: string,
  lang: string,
  defaults: T
): T {
  const { cmsData, cmsTypes } = useContext(CmsContentContext);
  const pageCtx = usePageSection();
  // When inside a CustomPage, prefer that page's instance content for this
  // section type. If no per-page content exists yet, fall back to the global
  // section content so newly-added sections still render with sane defaults.
  const isMatchingType = pageCtx && pageCtx.sectionType === section;
  const perPage = isMatchingType ? cmsData[pageCtx!.instanceKey]?.[lang] : undefined;
  const sectionData = perPage || cmsData[section]?.[lang];

  if (!sectionData) return defaults;

  // Type lookup falls back to the global section's type map when reading a
  // per-page instance (instance keys inherit field types from the section type).
  const typeMap =
    (isMatchingType ? cmsTypes[pageCtx!.instanceKey] : undefined) ||
    cmsTypes[section] ||
    {};

  // Merge CMS values over defaults
  const merged = { ...defaults } as any;
  for (const [key, value] of Object.entries(sectionData)) {
    if (value && value.trim()) {
      const isJson = typeMap[key] === "json" || LEGACY_JSON_KEYS.has(key);
      if (isJson) {
        try {
          merged[key] = JSON.parse(value);
        } catch {
          // Keep default if JSON is invalid
        }
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

export function useCmsRaw() {
  return useContext(CmsContentContext);
}
