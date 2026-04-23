import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import { ICON_CATEGORIES, MEGA_ICONS, MEGA_ICON_NAMES, resolveMegaIcon } from "./megaMenuIcons";

interface Props {
  value?: string;
  onChange: (name: string) => void;
  className?: string;
}

const IconPicker = ({ value, onChange, className }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const Current = resolveMegaIcon(value);

  const visibleNames = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source =
      activeCat === "all"
        ? MEGA_ICON_NAMES
        : Object.keys(ICON_CATEGORIES.find((c) => c.id === activeCat)?.icons ?? {});
    if (!q) return source;
    return source.filter((n) => n.toLowerCase().includes(q));
  }, [query, activeCat]);

  return (
    <div className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors text-xs"
        title="Choose icon"
      >
        <Current className="w-4 h-4 text-primary" />
        <span className="font-mono text-[11px] text-muted-foreground">
          {value || "Layers"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-[380px] bg-card border border-border rounded-xl shadow-2xl p-3">
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${MEGA_ICON_NAMES.length} icons...`}
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                  activeCat === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                All
              </button>
              {ICON_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                    activeCat === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-8 gap-1 max-h-[280px] overflow-y-auto pr-1">
              {visibleNames.map((name) => {
                const Icon = MEGA_ICONS[name];
                const active = value === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    title={name}
                    className={`relative aspect-square rounded-lg flex items-center justify-center transition-colors ${
                      active
                        ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                        : "hover:bg-muted text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {active && (
                      <Check className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-primary" />
                    )}
                  </button>
                );
              })}
              {visibleNames.length === 0 && (
                <p className="col-span-8 text-center text-xs text-muted-foreground py-6">
                  No icon matches "{query}"
                </p>
              )}
            </div>

            <p className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground text-center">
              {visibleNames.length} of {MEGA_ICON_NAMES.length} icons
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default IconPicker;
