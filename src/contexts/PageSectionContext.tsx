import { createContext, useContext } from "react";

/**
 * When a landing section component is rendered inside a custom page,
 * this context tells it the per-page CMS instance_key to read content from.
 * On the regular landing page (/), the context is null and components fall
 * back to the global section key (e.g. "hero", "features").
 */
export interface PageSectionCtx {
  instanceKey: string; // e.g. "page_3_hero_1"
  sectionType: string; // e.g. "hero"
}

const Ctx = createContext<PageSectionCtx | null>(null);

export const PageSectionProvider = Ctx.Provider;
export const usePageSection = () => useContext(Ctx);
