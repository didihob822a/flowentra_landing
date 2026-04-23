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
  ChevronLeft, Save, Globe, Loader2, X, Layers, Copy,
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
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 font-semibold">Sections</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
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
                      {p.is_published && (
                        <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Open page">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => setEditing(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete "${p.title_en || p.slug}"? This removes all per-page content.`)) return;
                          await pagesApi.remove(p.id);
                          toast.success("Page deleted");
                          load();
                        }}
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
          {page.is_published ? (
            <a href={`/p/${page.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> /p/{page.slug}
            </a>
          ) : null}
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
                {page.sections.map((s) => (
                  <SortableSectionRow
                    key={s.id}
                    section={s}
                    onEdit={() => onEditSection(s)}
                    onToggle={async () => { await pagesApi.toggleVisible(s.id, !s.is_visible); reload(); }}
                    onDelete={async () => {
                      if (!confirm(`Remove this ${s.section_type} section? Per-page content for it will be deleted.`)) return;
                      await pagesApi.removeSection(s.id);
                      toast.success("Section removed");
                      reload();
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
const SortableSectionRow = ({ section, onEdit, onToggle, onDelete }: {
  section: PageSectionRow;
  onEdit: () => void;
  onToggle: () => void;
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background ${section.is_visible ? "" : "opacity-60"}`}
    >
      <button {...attributes} {...listeners} className="touch-none cursor-grab text-muted-foreground hover:text-foreground p-1">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{def?.label || section.section_type}</div>
        <div className="text-[10px] text-muted-foreground font-mono truncate">{section.instance_key}</div>
      </div>
      <button onClick={onToggle} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title={section.is_visible ? "Hide" : "Show"}>
        {section.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
      <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit content">
        <Edit3 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ----- Add picker -----
const AddSectionPicker = ({ onPick, onClose }: { onPick: (type: string) => void; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-2xl rounded-xl bg-card border border-border shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-bold text-foreground">Add a section</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
        {PAGE_SECTION_REGISTRY.map((def) => (
          <button
            key={def.type}
            onClick={() => onPick(def.type)}
            className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div className="text-sm font-semibold text-foreground">{def.label}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{def.type}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

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
