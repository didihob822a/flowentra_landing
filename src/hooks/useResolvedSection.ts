import { useCmsSection } from "@/contexts/CmsContentContext";
import { usePageSection } from "@/contexts/PageSectionContext";

/**
 * Drop-in replacement for useCmsSection that automatically reads from a
 * per-page instance_key when rendered inside a CustomPage, and falls back
 * to the global section key everywhere else.
 *
 * Usage:
 *   const content = useResolvedSection("hero", lang, defaults);
 */
export function useResolvedSection<T extends Record<string, any>>(
  baseSection: string,
  lang: string,
  defaults: T
): T {
  const ctx = usePageSection();
  const sectionKey = ctx?.instanceKey || baseSection;
  return useCmsSection(sectionKey, lang, defaults);
}
