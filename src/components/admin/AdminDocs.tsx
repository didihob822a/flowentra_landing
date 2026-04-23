import { useState, useMemo } from "react";
import { BookOpen, Search, ChevronRight, Eye } from "lucide-react";
import { DOCS, GROUPS, DocContent } from "./docsData";

const AdminDocs = ({ onJumpToSection }: { onJumpToSection?: (sectionKey: string) => void }) => {
  const [activeId, setActiveId] = useState(DOCS[0].id);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCS;
    return DOCS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.intro.toLowerCase().includes(q) ||
        d.subsections?.some(
          (s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
        ) ||
        d.fields?.some(
          (f) => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)
        )
    );
  }, [query]);

  const active = DOCS.find((d) => d.id === activeId) || DOCS[0];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Admin Documentation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete English guide to everything editable in the Flowentra CMS.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the docs (e.g. 'price', 'icon', 'language')..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Body: TOC + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* TOC */}
        <aside className="border-r border-border bg-muted/20 p-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {GROUPS.map((group) => {
            const items = filtered.filter((d) => d.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items.map((doc) => {
                    const Icon = doc.icon;
                    const isActive = activeId === doc.id;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setActiveId(doc.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 truncate">{doc.title}</span>
                        {isActive && <ChevronRight className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!filtered.length && (
            <p className="text-xs text-muted-foreground/60 text-center py-6">
              No docs match "{query}"
            </p>
          )}
        </aside>

        {/* Content */}
        <article className="p-6 sm:p-8 max-h-[calc(100vh-280px)] overflow-y-auto">
          <DocContent doc={active} onJumpToSection={onJumpToSection} />
          <div className="mt-8 pt-5 border-t border-border text-[11px] text-muted-foreground/70 flex items-center gap-2">
            <Eye className="w-3 h-3" />
            Tip: every CMS section also has a "? Help" button at the top — opens this same content in a side drawer while you edit.
          </div>
        </article>
      </div>
    </div>
  );
};

export default AdminDocs;
