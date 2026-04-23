import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Link2,
  AlertCircle,
  Sparkles,
  Eye,
} from "lucide-react";
import IconPicker from "./IconPicker";
import { resolveMegaIcon } from "./megaMenuIcons";
import MegaMenuPreview from "./MegaMenuPreview";
import FlagIcon from "@/components/FlagIcon";
import { getDefaultMegaJson, getDefaultMegaConfig, type MegaMenuKey } from "./megaMenuDefaults";

// ─────────────────────────────────────────────────────────────────────
// Types — match Navbar.tsx RawMega / RawTab / RawTabItem
// ─────────────────────────────────────────────────────────────────────
export interface MegaItem {
  label: string;
  desc?: string;
  href: string;
  isRoute?: boolean;
  icon?: string;
}
export interface MegaTab {
  id: string;
  label: string;
  icon?: string;
  items: MegaItem[];
  footer?: { label: string; href: string };
}
export interface MegaConfig {
  tabs: MegaTab[];
}

const emptyConfig = (): MegaConfig => ({ tabs: [] });

const safeParse = (raw: string): MegaConfig => {
  if (!raw || !raw.trim()) return emptyConfig();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.tabs)) {
      return {
        tabs: parsed.tabs.map((t: any, i: number) => ({
          id: typeof t.id === "string" && t.id ? t.id : `tab-${i}-${Math.random().toString(36).slice(2, 7)}`,
          label: t.label ?? "",
          icon: t.icon,
          items: Array.isArray(t.items)
            ? t.items.map((it: any) => ({
                label: it.label ?? "",
                desc: it.desc,
                href: it.href ?? "#",
                isRoute: !!it.isRoute,
                icon: it.icon,
              }))
            : [],
          footer:
            t.footer && typeof t.footer.label === "string"
              ? { label: t.footer.label, href: t.footer.href ?? "#" }
              : undefined,
        })),
      };
    }
  } catch {
    /* fall through */
  }
  return emptyConfig();
};

const stringify = (cfg: MegaConfig): string => JSON.stringify(cfg);

// Stable per-item DnD ID (prefix with tab id so reordering scope is clear)
const itemDndId = (tabId: string, idx: number) => `${tabId}::${idx}`;

// ─────────────────────────────────────────────────────────────────────
// Sortable Tab row
// ─────────────────────────────────────────────────────────────────────
const SortableTab = ({
  tab,
  isActive,
  onClick,
  onDelete,
}: {
  tab: MegaTab;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tab.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const Icon = resolveMegaIcon(tab.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 rounded-lg border transition-colors ${
        isActive
          ? "bg-primary/10 border-primary/40"
          : "bg-card border-border hover:border-primary/20"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="px-1.5 py-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        title="Drag to reorder tab"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 px-2 py-2 flex-1 text-left text-xs font-medium"
      >
        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        <span className="truncate">{tab.label || <em className="text-muted-foreground">untitled tab</em>}</span>
        <span className="ml-auto text-[10px] text-muted-foreground/60">{tab.items.length}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="px-1.5 py-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete tab"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Sortable Item card
// ─────────────────────────────────────────────────────────────────────
const SortableItem = ({
  id,
  item,
  onChange,
  onDelete,
}: {
  id: string;
  item: MegaItem;
  onChange: (next: MegaItem) => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background border border-border rounded-lg p-3 space-y-2"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <IconPicker
          value={item.icon}
          onChange={(name) => onChange({ ...item, icon: name })}
        />

        <div className="flex-1 grid grid-cols-1 gap-2">
          <input
            type="text"
            value={item.label}
            onChange={(e) => onChange({ ...item, label: e.target.value })}
            placeholder="Item label (e.g., Field Service)"
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="text"
            value={item.desc ?? ""}
            onChange={(e) => onChange({ ...item, desc: e.target.value })}
            placeholder="Short description (optional)"
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="mt-1 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 pl-6">
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          {item.isRoute ? <ExternalLink className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
          <span className="text-[10px] font-medium uppercase tracking-wide">
            {item.isRoute ? "Page" : "Anchor"}
          </span>
        </div>
        <input
          type="text"
          value={item.href}
          onChange={(e) => onChange({ ...item, href: e.target.value })}
          placeholder={item.isRoute ? "/about" : "#features"}
          className="flex-1 px-2.5 py-1 rounded-lg border border-border bg-background text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={!!item.isRoute}
            onChange={(e) => onChange({ ...item, isRoute: e.target.checked })}
            className="w-3 h-3"
          />
          Internal page
        </label>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Main builder for a single mega menu (Product / Solutions / Resources)
// ─────────────────────────────────────────────────────────────────────
interface MenuBuilderProps {
  raw: string; // current JSON string
  onChange: (next: string) => void; // emit serialized JSON
}

const MenuBuilder = ({ raw, onChange }: MenuBuilderProps) => {
  const config = useMemo(() => safeParse(raw), [raw]);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    config.tabs[0]?.id || null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const update = (next: MegaConfig) => onChange(stringify(next));

  // ── Tab operations
  const addTab = () => {
    const id = `tab-${Date.now().toString(36)}`;
    const next: MegaConfig = {
      tabs: [...config.tabs, { id, label: "New Tab", icon: "Layers", items: [] }],
    };
    update(next);
    setActiveTabId(id);
  };

  const deleteTab = (id: string) => {
    const next: MegaConfig = { tabs: config.tabs.filter((t) => t.id !== id) };
    update(next);
    if (activeTabId === id) setActiveTabId(next.tabs[0]?.id || null);
  };

  const updateTab = (id: string, patch: Partial<MegaTab>) => {
    update({
      tabs: config.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const handleTabDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = config.tabs.findIndex((t) => t.id === active.id);
    const newIndex = config.tabs.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    update({ tabs: arrayMove(config.tabs, oldIndex, newIndex) });
  };

  // ── Item operations on the active tab
  const activeTab = config.tabs.find((t) => t.id === activeTabId) || null;

  const addItem = () => {
    if (!activeTab) return;
    updateTab(activeTab.id, {
      items: [
        ...activeTab.items,
        { label: "New item", desc: "", href: "#", icon: "Layers", isRoute: false },
      ],
    });
  };

  const updateItem = (idx: number, next: MegaItem) => {
    if (!activeTab) return;
    const items = activeTab.items.slice();
    items[idx] = next;
    updateTab(activeTab.id, { items });
  };

  const deleteItem = (idx: number) => {
    if (!activeTab) return;
    updateTab(activeTab.id, {
      items: activeTab.items.filter((_, i) => i !== idx),
    });
  };

  const handleItemDragEnd = (e: DragEndEvent) => {
    if (!activeTab) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = activeTab.items.map((_, i) => itemDndId(activeTab.id, i));
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    updateTab(activeTab.id, {
      items: arrayMove(activeTab.items, oldIndex, newIndex),
    });
  };

  // ── Footer (optional CTA at the bottom of a tab)
  const setFooter = (label: string, href: string) => {
    if (!activeTab) return;
    if (!label && !href) {
      updateTab(activeTab.id, { footer: undefined });
    } else {
      updateTab(activeTab.id, { footer: { label, href } });
    }
  };

  return (
    <div className="bg-muted/20 rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_360px]">
        {/* ── Left: Tabs list ── */}
        <div className="border-r border-border bg-card/50 p-3 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Tabs ({config.tabs.length})
            </span>
            <button
              type="button"
              onClick={addTab}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <Plus className="w-3 h-3" /> Add tab
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
            <SortableContext items={config.tabs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {config.tabs.map((tab) => (
                  <SortableTab
                    key={tab.id}
                    tab={tab}
                    isActive={tab.id === activeTabId}
                    onClick={() => setActiveTabId(tab.id)}
                    onDelete={() => deleteTab(tab.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {config.tabs.length === 0 && (
            <p className="text-[11px] text-muted-foreground/60 text-center py-4">
              No tabs yet. Click <span className="text-primary font-medium">"Add tab"</span> to start.
            </p>
          )}
        </div>

        {/* ── Right: Active tab editor ── */}
        <div className="p-4">
          {!activeTab ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
              <AlertCircle className="w-6 h-6 mb-2 text-muted-foreground/40" />
              <p className="text-xs">Select or create a tab on the left to edit its items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab meta */}
              <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                <IconPicker
                  value={activeTab.icon}
                  onChange={(name) => updateTab(activeTab.id, { icon: name })}
                />
                <input
                  type="text"
                  value={activeTab.label}
                  onChange={(e) => updateTab(activeTab.id, { label: e.target.value })}
                  placeholder="Tab label (e.g., Modules)"
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Items ({activeTab.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
                  <SortableContext
                    items={activeTab.items.map((_, i) => itemDndId(activeTab.id, i))}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {activeTab.items.map((item, idx) => (
                        <SortableItem
                          key={itemDndId(activeTab.id, idx)}
                          id={itemDndId(activeTab.id, idx)}
                          item={item}
                          onChange={(next) => updateItem(idx, next)}
                          onDelete={() => deleteItem(idx)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {activeTab.items.length === 0 && (
                  <p className="text-[11px] text-muted-foreground/60 text-center py-6">
                    No items yet in this tab.
                  </p>
                )}
              </div>

              {/* Footer CTA */}
              <div className="pt-3 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Footer link (optional)
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="text"
                    value={activeTab.footer?.label ?? ""}
                    onChange={(e) => setFooter(e.target.value, activeTab.footer?.href ?? "")}
                    placeholder="Label (e.g., Find your industry)"
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="text"
                    value={activeTab.footer?.href ?? ""}
                    onChange={(e) => setFooter(activeTab.footer?.label ?? "", e.target.value)}
                    placeholder="Link (e.g., #industries)"
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Live preview ── */}
        <div className="border-t xl:border-t-0 xl:border-l border-border bg-card/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Live preview
            </span>
            <span className="text-[10px] text-muted-foreground/70 italic">
              auto-updates
            </span>
          </div>
          <MegaMenuPreview config={config} syncTabId={activeTabId} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Top-level: 3 menus (product / solutions / resources) for current language
// ─────────────────────────────────────────────────────────────────────
const MENU_KEYS: Array<{ key: "product" | "solutions" | "resources"; label: string; color: string }> = [
  { key: "product", label: "Product menu", color: "text-blue-600" },
  { key: "solutions", label: "Solutions menu", color: "text-purple-600" },
  { key: "resources", label: "Resources menu", color: "text-emerald-600" },
];

interface MegaMenuBuilderProps {
  /** Per-language map: { en: { product: jsonStr, solutions: jsonStr, resources: jsonStr }, fr: {...}, ... } */
  values: Record<string, Record<string, string>>;
  lang: string;
  setLang: (code: string) => void;
  allLanguages: { code: string; label: string }[];
  onFieldChange: (langCode: string, fieldKey: string, value: string) => void;
  onCopyFromLang?: (sourceLang: string, targetLang: string, fieldKeys: string[]) => void;
}

const MegaMenuBuilder = ({
  values,
  lang,
  setLang,
  allLanguages,
  onFieldChange,
  onCopyFromLang,
}: MegaMenuBuilderProps) => {
  const [openMenu, setOpenMenu] = useState<"product" | "solutions" | "resources">("product");
  const langValues = values[lang] || {};

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-foreground">Mega-menu builder</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Add tabs, items, icons and links — drag to reorder. Saved per language.
          </p>
        </div>

        {/* Language switcher */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
          {allLanguages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                lang === l.code
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FlagIcon country={l.code} className="w-4 h-3" />
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Copy-from-language helper */}
      {onCopyFromLang && allLanguages.length > 1 && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <span>Copy structure from:</span>
          {allLanguages
            .filter((l) => l.code !== lang)
            .map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() =>
                  onCopyFromLang(
                    l.code,
                    lang,
                    MENU_KEYS.map((m) => m.key)
                  )
                }
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border hover:border-primary/50 hover:text-foreground transition-colors"
              >
                <FlagIcon country={l.code} className="w-3.5 h-2.5" /> {l.code.toUpperCase()}
              </button>
            ))}
          <span className="ml-auto text-muted-foreground/60 italic">
            (overwrites current language for all 3 menus)
          </span>
        </div>
      )}

      {/* Menu accordion */}
      <div className="space-y-3">
        {MENU_KEYS.map(({ key, label, color }) => {
          const isOpen = openMenu === key;
          const raw = langValues[key] || "";
          const parsed = safeParse(raw);
          const tabCount = parsed.tabs.length;
          const itemCount = parsed.tabs.reduce((sum, t) => sum + t.items.length, 0);
          const isEmpty = tabCount === 0;
          const defaultsCfg = getDefaultMegaConfig(key as MegaMenuKey, lang);
          const defaultTabCount = defaultsCfg.tabs.length;
          const defaultItemCount = defaultsCfg.tabs.reduce((s, t) => s + t.items.length, 0);

          const loadDefaults = () => {
            if (
              !isEmpty &&
              !window.confirm(
                `Replace the current "${label}" content with the default template?\n\nThis will overwrite ${tabCount} tab(s) and ${itemCount} item(s) for the ${lang.toUpperCase()} language.`
              )
            ) {
              return;
            }
            onFieldChange(lang, key, getDefaultMegaJson(key as MegaMenuKey, lang));
          };

          return (
            <div key={key} className="border border-border rounded-xl overflow-hidden bg-background">
              <div className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors text-left">
                <button
                  type="button"
                  onClick={() => setOpenMenu(isOpen ? ("" as any) : key)}
                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-sm font-bold ${color} shrink-0`}>{label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {key}
                  </span>
                  {isEmpty ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      <Eye className="w-2.5 h-2.5" />
                      Showing default ({defaultTabCount} tabs · {defaultItemCount} items)
                    </span>
                  ) : (
                    <span className="ml-2 text-[11px] text-muted-foreground">
                      {tabCount} tab{tabCount === 1 ? "" : "s"} · {itemCount} item{itemCount === 1 ? "" : "s"}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={loadDefaults}
                  title={
                    isEmpty
                      ? "Load the default content shown to visitors as a starting template"
                      : "Replace current content with the default template"
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md border border-border hover:border-primary/50 hover:text-primary transition-colors shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  {isEmpty ? "Load default" : "Reset to default"}
                </button>
              </div>

              {isOpen && (
                <div className="p-3 border-t border-border space-y-3">
                  {isEmpty && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-foreground">
                      <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">
                          This menu is empty — visitors currently see the built-in default shown below.
                        </p>
                        <p className="mt-0.5 text-muted-foreground">
                          Click <span className="font-semibold text-primary">"Load default"</span> on
                          the right to start editing from the exact same content visitors see right now.
                        </p>
                      </div>
                    </div>
                  )}
                  <MenuBuilder
                    raw={raw || getDefaultMegaJson(key as MegaMenuKey, lang)}
                    onChange={(next) => onFieldChange(lang, key, next)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MegaMenuBuilder;
