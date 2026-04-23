import { useState, useEffect } from "react";
import { ChevronRight, Eye } from "lucide-react";
import { resolveMegaIcon } from "./megaMenuIcons";
import type { MegaConfig } from "./MegaMenuBuilder";

interface Props {
  config: MegaConfig;
  /** When the active edited tab changes, sync preview highlight to it. */
  syncTabId?: string | null;
}

/**
 * Live mini-preview of a mega-menu — renders the SAME markup as Navbar.tsx
 * (renderMegaPanel), at a slightly reduced scale, so admins see exactly what
 * visitors will see while editing.
 */
const MegaMenuPreview = ({ config, syncTabId }: Props) => {
  const [activeTab, setActiveTab] = useState<string | null>(
    syncTabId || config.tabs[0]?.id || null
  );

  // Keep the preview tab in sync with the editor's active tab.
  useEffect(() => {
    if (syncTabId && config.tabs.some((t) => t.id === syncTabId)) {
      setActiveTab(syncTabId);
    } else if (!config.tabs.some((t) => t.id === activeTab)) {
      setActiveTab(config.tabs[0]?.id ?? null);
    }
  }, [syncTabId, config.tabs, activeTab]);

  if (!config.tabs.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Eye className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-[11px] text-muted-foreground">
          Add a tab to see the live preview here.
        </p>
      </div>
    );
  }

  const currentTab = config.tabs.find((t) => t.id === activeTab) || config.tabs[0];

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
      {/* Browser-style header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400/70" />
          <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
          <span className="w-2 h-2 rounded-full bg-green-400/70" />
        </div>
        <div className="flex items-center gap-1.5 mx-auto text-[10px] text-muted-foreground">
          <Eye className="w-3 h-3" />
          Live preview — exactly as visitors see it
        </div>
      </div>

      {/* Mega panel (mirrors Navbar.renderMegaPanel) */}
      <div className="bg-card">
        <div className="flex">
          {/* Left sidebar (tabs) */}
          <div className="w-[180px] shrink-0 border-r border-border bg-muted/20 p-2 flex flex-col gap-0.5">
            {config.tabs.map((tab) => {
              const Icon = resolveMegaIcon(tab.icon);
              const isActive = (activeTab || config.tabs[0]?.id) === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onMouseEnter={() => setActiveTab(tab.id)}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span className="flex-1 text-left truncate">
                    {tab.label || <em className="opacity-60">untitled</em>}
                  </span>
                  <ChevronRight
                    className={`w-3 h-3 transition-transform ${isActive ? "translate-x-0.5" : ""}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right content (items) */}
          <div className="flex-1 p-3 min-h-[180px]">
            {currentTab && currentTab.items.length > 0 ? (
              <div className="grid grid-cols-2 gap-0.5">
                {currentTab.items.map((item, i) => {
                  const Icon = resolveMegaIcon(item.icon);
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" strokeWidth={1.7} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-foreground leading-tight truncate">
                          {item.label || <em className="opacity-60">label</em>}
                        </div>
                        {item.desc && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground/60 italic">
                No items yet in this tab
              </div>
            )}

            {currentTab?.footer && (
              <div className="mt-2 mx-1 text-center py-2 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer">
                {currentTab.footer.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenuPreview;
