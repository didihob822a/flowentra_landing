import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Trash2, Edit3, ExternalLink, Eye, EyeOff, GripVertical,
  ChevronLeft, Save, Globe, Loader2, X, Layers, Copy, CopyPlus,
  Search, ArrowUp, ArrowDown, CheckSquare, Square, FileText,
} from "lucide-react";
import { pagesApi, type CmsPage, type PageSectionRow } from "@/services/adminPagesApi";
import { PAGE_SECTION_REGISTRY } from "@/components/landing/sectionRegistry";
import SectionEditor from "@/components/admin/SectionEditor";
import FlagIcon from "@/components/FlagIcon";
import { SkeletonList, EmptyState, ErrorState } from "@/components/admin/ui/adminUx";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const PagesManager = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSectionRow | null>(null);
  const [sectionLang, setSectionLang] = useState("en");
  const [deletingPage, setDeletingPage] = useState<CmsPage | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await pagesApi.list();
      setPages(data);
    } catch (e: any) {
      const msg = e?.message || "Failed to load pages — is the backend deployed?";
      setLoadError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter + select (must run before any early returns to keep hook order stable)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((p) => {
      if (statusFilter === "published" && !p.is_published) return false;
      if (statusFilter === "draft" && p.is_published) return false;
      if (!q) return true;
      return (
        p.slug.toLowerCase().includes(q) ||
        (p.title_en || "").toLowerCase().includes(q) ||
        (p.title_fr || "").toLowerCase().includes(q) ||
        (p.title_de || "").toLowerCase().includes(q) ||
        (p.title_ar || "").toLowerCase().includes(q)
      );
    });
  }, [pages, search, statusFilter]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };
  const toggleSelect = (id: number) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const bulkSetPublished = async (val: boolean) => {
    if (!selected.size) return;
    setBulkBusy(true);
    const res = await pagesApi.bulkPublish(Array.from(selected), val);
    setBulkBusy(false);
    if (res.success) {
      toast.success(`${val ? "Published" : "Unpublished"} ${selected.size} page${selected.size === 1 ? "" : "s"}`);
      setSelected(new Set());
      load();
    } else {
      toast.error(res.message || "Bulk update failed");
    }
  };

  // ----- Section editor sub-view -----
  if (editingSection && editing) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-muted/30 backdrop-blur-sm py-2 z-10 -mt-2">
          <button
            onClick={() => setEditingSection(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" /> Back to {editing.title_en || editing.slug}
          </button>
          <div className="flex items-center bg-card rounded-lg p-0.5 gap-0.5 border border-border">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setSectionLang(l.code)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sectionLang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FlagIcon country={l.code} className="w-4 h-3" />
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            Editing per-page content for <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">{editingSection.section_type}</code>{" "}
            on <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">/p/{editing.slug}</code>
          </div>
          <SectionEditor
            sectionKey={editingSection.instance_key}
            lang={sectionLang}
            allLanguages={LANGUAGES}
            onLangChange={setSectionLang}
          />
        </div>
      </div>
    );
  }

  // ----- Page editor sub-view -----
  if (editing) {
    return <PageEditor
      page={editing}
      onClose={() => { setEditing(null); load(); }}
      onEditSection={(s) => setEditingSection(s)}
    />;
  }

  // ----- Pages list -----
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build custom pages by composing existing sections. Each page lives at <code className="text-xs px-1.5 py-0.5 rounded bg-muted">/p/&lt;slug&gt;</code>.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> New page
        </button>
      </div>

      {/* Search + filters + bulk bar */}
      {!loading && !loadError && pages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or slug…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center bg-card rounded-lg p-0.5 gap-0.5 border border-border">
            {(["all", "published", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs">
              <span className="font-semibold text-primary">{selected.size} selected</span>
              <button
                onClick={() => bulkSetPublished(true)}
                disabled={bulkBusy}
                className="px-2 py-1 rounded bg-green-500/10 text-green-600 hover:bg-green-500/20 font-semibold disabled:opacity-50"
              >
                Publish
              </button>
              <button
                onClick={() => bulkSetPublished(false)}
                disabled={bulkBusy}
                className="px-2 py-1 rounded bg-muted text-foreground hover:bg-muted/70 font-semibold disabled:opacity-50"
              >
                Unpublish
              </button>
              <button onClick={() => setSelected(new Set())} className="p-1 rounded hover:bg-muted" title="Clear selection">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <SkeletonList rows={5} />
      ) : loadError ? (
        <ErrorState
          title="Couldn't load pages"
          message={loadError}
          onRetry={load}
          retrying={loading}
        />
      ) : pages.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No pages yet"
          description="Create your first custom page to get started."
          action={
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> New page
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No pages match your filters"
          description="Try clearing the search or switching the status filter."
          action={
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold hover:bg-muted/80"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3">
                  <button
                    onClick={toggleSelectAll}
                    className="text-muted-foreground hover:text-foreground"
                    title={allFilteredSelected ? "Deselect all" : "Select all"}
                  >
                    {allFilteredSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 font-semibold">Sections</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className={`hover:bg-muted/30 ${selected.has(p.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleSelect(p.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {selected.has(p.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.title_en || <em className="text-muted-foreground">Untitled</em>}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">/p/{p.slug}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.sections?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      p.is_published ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    }`}>
                      {p.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <a
                        href={`/p/${p.slug}${p.is_published ? "" : "?preview=1"}`}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title={p.is_published ? "Open page" : "Preview draft"}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => setEditing(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          const res = await pagesApi.duplicate(p.id);
                          if (res.success) {
                            toast.success(`Duplicated as /p/${res.data!.slug}`);
                            load();
                          } else {
                            toast.error(res.message || "Duplicate failed");
                          }
                        }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Duplicate"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingPage(p)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <CreatePageDialog onClose={() => setCreating(false)} onCreated={(p) => { setCreating(false); setEditing(p); load(); }} />}
      {deletingPage && (
        <DeletePageDialog
          page={deletingPage}
          onClose={() => setDeletingPage(null)}
          onDeleted={() => { setDeletingPage(null); load(); }}
        />
      )}
    </div>
  );
};

// ============================================================================
// Delete confirmation dialog (double-confirm: must type the slug)
// ============================================================================
const DeletePageDialog = ({ page, onClose, onDeleted }: {
  page: CmsPage;
  onClose: () => void;
  onDeleted: () => void;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sectionsCount = page.sections?.length || 0;
  const slugMatches = typed.trim() === page.slug;

  const confirmDelete = async () => {
    if (!slugMatches) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await pagesApi.remove(page.id);
      if (res.success) {
        toast.success(`Deleted "${page.title_en || page.slug}"`);
        onDeleted();
      } else {
        const msg = res.message || "The backend refused to delete this page.";
        setErrorMsg(msg);
        toast.error(msg, { duration: 6000 });
      }
    } catch (e: any) {
      const msg = e?.message || "Network error while deleting the page.";
      setErrorMsg(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground inline-flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            Delete page
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted" disabled={busy}><X className="w-4 h-4" /></button>
        </div>

        {step === 1 ? (
          <div className="p-5 space-y-4">
            <p className="text-sm text-foreground">
              You're about to delete <strong className="font-semibold">{page.title_en || page.slug}</strong>.
            </p>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-foreground space-y-1.5">
              <div className="font-semibold text-destructive">This will permanently remove:</div>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                <li>The page <code className="px-1 py-0.5 rounded bg-muted text-foreground">/p/{page.slug}</code></li>
                <li>{sectionsCount} section{sectionsCount === 1 ? "" : "s"} on this page</li>
                <li>All translated content (EN, FR, DE, AR) for these sections</li>
              </ul>
              <div className="pt-1.5 text-[11px] text-destructive/80">This action cannot be undone.</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted">Cancel</button>
              <button
                onClick={() => setStep(2)}
                className="px-3 py-1.5 text-sm rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-sm text-foreground">
              To confirm, type the slug <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">{page.slug}</code> below.
            </p>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={page.slug}
              disabled={busy}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-destructive/40"
            />
            {errorMsg && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <div className="font-semibold mb-0.5">Delete failed</div>
                <div className="text-destructive/90 break-words">{errorMsg}</div>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button onClick={() => { setStep(1); setErrorMsg(null); }} disabled={busy} className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted">
                Back
              </button>
              <div className="flex items-center gap-2">
                <button onClick={onClose} disabled={busy} className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted">Cancel</button>
                <button
                  onClick={confirmDelete}
                  disabled={!slugMatches || busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-destructive text-destructive-foreground font-semibold disabled:opacity-50 hover:bg-destructive/90"
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Create dialog
// ============================================================================
const CreatePageDialog = ({ onClose, onCreated }: { onClose: () => void; onCreated: (p: CmsPage) => void }) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !slug.trim()) return toast.error("Title and slug required");
    setBusy(true);
    try {
      const res = await pagesApi.create({ slug: slugify(slug), title_en: title });
      if (!res.success) throw new Error(res.message);
      const created = await pagesApi.list().then((all) => all.find((p) => p.id === res.data!.id));
      if (created) onCreated(created);
      else onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to create page");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Create new page</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Page title</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }}
              placeholder="Our Story"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">URL slug</label>
            <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden">
              <span className="text-xs text-muted-foreground px-3 bg-muted py-2">/p/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="our-story"
                className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/30">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={busy} className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 inline-flex items-center gap-1.5">
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Page editor (composer)
// ============================================================================
interface PageEditorProps {
  page: CmsPage;
  onClose: () => void;
  onEditSection: (s: PageSectionRow) => void;
}
const PageEditor = ({ page: initialPage, onClose, onEditSection }: PageEditorProps) => {
  const [page, setPage] = useState<CmsPage>(initialPage);
  const [savingMeta, setSavingMeta] = useState(false);
  const [adding, setAdding] = useState(false);
  const [metaLang, setMetaLang] = useState("en");

  const reload = async () => {
    const fresh = await pagesApi.getBySlug(page.slug);
    if (fresh) setPage(fresh);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = page.sections.findIndex((s) => s.id === active.id);
    const newIdx = page.sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(page.sections, oldIdx, newIdx);
    setPage({ ...page, sections: reordered });
    try {
      await pagesApi.reorder(page.id, reordered.map((s) => s.id));
    } catch {
      toast.error("Reorder failed");
      reload();
    }
  };

  const addSection = async (type: string) => {
    setAdding(false);
    const res = await pagesApi.addSection(page.id, type);
    if (res.success) {
      toast.success(`Added ${type}`);
      reload();
    } else {
      toast.error(res.message || "Add failed");
    }
  };

  const saveMeta = async () => {
    setSavingMeta(true);
    try {
      await pagesApi.update({
        id: page.id,
        slug: page.slug,
        title_en: page.title_en, title_fr: page.title_fr, title_de: page.title_de, title_ar: page.title_ar,
        meta_description_en: page.meta_description_en,
        meta_description_fr: page.meta_description_fr,
        meta_description_de: page.meta_description_de,
        meta_description_ar: page.meta_description_ar,
        is_published: page.is_published,
      });
      toast.success("Page saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingMeta(false);
    }
  };

  const togglePublish = async () => {
    const newVal = page.is_published ? 0 : 1;
    setPage({ ...page, is_published: newVal });
    await pagesApi.update({ id: page.id, is_published: newVal });
    toast.success(newVal ? "Page published" : "Page unpublished");
  };

  const titleField = `title_${metaLang}` as keyof CmsPage;
  const metaField = `meta_description_${metaLang}` as keyof CmsPage;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Back to all pages
        </button>
        <div className="flex items-center gap-2">
          <a
            href={`/p/${page.slug}${page.is_published ? "" : "?preview=1"}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" /> {page.is_published ? `/p/${page.slug}` : `Preview /p/${page.slug}`}
          </a>
          <button
            onClick={togglePublish}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              page.is_published ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {page.is_published ? "Published" : "Publish"}
          </button>
        </div>
      </div>

      {/* Meta editor */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Page details</h3>
          <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setMetaLang(l.code)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  metaLang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FlagIcon country={l.code} className="w-3.5 h-2.5" /> {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Title ({metaLang})</label>
            <input
              value={(page[titleField] as string) || ""}
              onChange={(e) => setPage({ ...page, [titleField]: e.target.value } as CmsPage)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Slug</label>
            <input
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: slugify(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Meta description ({metaLang})</label>
            <textarea
              value={(page[metaField] as string) || ""}
              onChange={(e) => setPage({ ...page, [metaField]: e.target.value } as CmsPage)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Used for SEO &amp; social sharing.</p>
          <button onClick={saveMeta} disabled={savingMeta} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {savingMeta ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save details
          </button>
        </div>
      </div>

      {/* Section composer */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Sections</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder. Click <Edit3 className="w-3 h-3 inline -mt-0.5" /> to edit content for this page.</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5" /> Add section
          </button>
        </div>

        {page.sections.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <Layers className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No sections yet — click "Add section" to start building.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={page.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {page.sections.map((s, idx) => (
                  <SortableSectionRow
                    key={s.id}
                    section={s}
                    index={idx}
                    total={page.sections.length}
                    onEdit={() => onEditSection(s)}
                    onToggle={async () => { await pagesApi.toggleVisible(s.id, !s.is_visible); reload(); }}
                    onMove={async (dir) => {
                      const newIdx = idx + dir;
                      if (newIdx < 0 || newIdx >= page.sections.length) return;
                      const reordered = arrayMove(page.sections, idx, newIdx);
                      setPage({ ...page, sections: reordered });
                      const res = await pagesApi.reorder(page.id, reordered.map((x) => x.id));
                      if (!res.success) { toast.error(res.message || "Reorder failed"); reload(); }
                    }}
                    onDuplicate={async () => {
                      const res = await pagesApi.duplicateSection(s.id);
                      if (res.success) { toast.success("Section duplicated"); reload(); }
                      else toast.error(res.message || "Duplicate failed");
                    }}
                    onDelete={async () => {
                      if (!confirm(`Remove this ${s.section_type} section? Per-page content for it will be deleted.`)) return;
                      const res = await pagesApi.removeSection(s.id);
                      if (res.success) { toast.success("Section removed"); reload(); }
                      else toast.error(res.message || "Remove failed");
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {adding && <AddSectionPicker onPick={addSection} onClose={() => setAdding(false)} />}
      </div>

      {/* Linking helper */}
      <LinkingHelper page={page} />
    </div>
  );
};

// ----- Sortable row -----
const SortableSectionRow = ({ section, index, total, onEdit, onToggle, onMove, onDuplicate, onDelete }: {
  section: PageSectionRow;
  index: number;
  total: number;
  onEdit: () => void;
  onToggle: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const def = PAGE_SECTION_REGISTRY.find((d) => d.type === section.section_type);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background ${section.is_visible ? "" : "opacity-60"}`}
    >
      <button {...attributes} {...listeners} className="touch-none cursor-grab text-muted-foreground hover:text-foreground p-1" title="Drag to reorder">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex flex-col -gap-1">
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 min-w-0 ml-1">
        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{index + 1}</span>
          {def?.label || section.section_type}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono truncate">{section.instance_key}</div>
      </div>
      <button onClick={onToggle} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title={section.is_visible ? "Hide" : "Show"}>
        {section.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
      <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit content">
        <Edit3 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDuplicate} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Duplicate section">
        <CopyPlus className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ----- Add picker -----
const AddSectionPicker = ({ onPick, onClose }: { onPick: (type: string) => void; onClose: () => void }) => {
  const [q, setQ] = useState("");
  const filtered = PAGE_SECTION_REGISTRY.filter((d) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return d.label.toLowerCase().includes(s) || d.type.toLowerCase().includes(s);
  });
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground inline-flex items-center gap-2">
            <Layers className="w-4 h-4" /> Add a section
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sections…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm text-muted-foreground">No sections match "{q}"</div>
          ) : filtered.map((def) => (
            <button
              key={def.type}
              onClick={() => onPick(def.type)}
              className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
            >
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                {def.label}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{def.type}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----- Linking helper -----
const LinkingHelper = ({ page }: { page: CmsPage }) => {
  const url = `/p/${page.slug}`;
  const copy = () => { navigator.clipboard.writeText(url); toast.success("Path copied"); };
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-bold text-foreground mb-1">Link this page</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Copy the path below, then paste it into a Mega Menu item, Footer link, or Navbar custom link in the matching CMS section.
      </p>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
        <Globe className="w-4 h-4 text-muted-foreground ml-1" />
        <code className="flex-1 text-sm text-foreground">{url}</code>
        <button onClick={copy} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-card hover:bg-background border border-border">
          <Copy className="w-3 h-3" /> Copy
        </button>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 mt-4">
        <a href="/admin?section=navMega" className="block p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-sm">
          <div className="font-semibold text-foreground">→ Mega Menu</div>
          <div className="text-[11px] text-muted-foreground">Add as a Solutions/Resources item</div>
        </a>
        <a href="/admin?section=nav" className="block p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-sm">
          <div className="font-semibold text-foreground">→ Navbar</div>
          <div className="text-[11px] text-muted-foreground">Add as a top-level link</div>
        </a>
        <a href="/admin?section=footer" className="block p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-sm">
          <div className="font-semibold text-foreground">→ Footer</div>
          <div className="text-[11px] text-muted-foreground">Add inside a footer column</div>
        </a>
      </div>
    </div>
  );
};

export default PagesManager;
