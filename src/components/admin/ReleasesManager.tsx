import { useState, useEffect } from "react";
import { releasesApi, type Release, type ReleaseItem } from "@/services/adminReleasesApi";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, Eye, EyeOff, ChevronDown, ChevronRight,
  Tag, Bug, Zap, Sparkles, RefreshCw, GripVertical,
} from "lucide-react";
import { SkeletonList, EmptyState, ErrorState } from "@/components/admin/ui/adminUx";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "ar", label: "AR" },
];

const TYPE_CONFIG = {
  feature: { label: "Feature", icon: Sparkles, color: "text-emerald-500 bg-emerald-500/10" },
  bugfix: { label: "Bug Fix", icon: Bug, color: "text-rose-400 bg-rose-400/10" },
  improvement: { label: "Improvement", icon: Zap, color: "text-blue-400 bg-blue-400/10" },
};

const ReleasesManager = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editLang, setEditLang] = useState("en");

  // New release form
  const [showNew, setShowNew] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => { loadReleases(); }, []);

  const loadReleases = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await releasesApi.list();
      setReleases(data);
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load releases");
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newVersion.trim()) { toast.error("Version is required"); return; }
    try {
      const result = await releasesApi.create({
        version: newVersion.trim(),
        release_date: newDate,
        is_published: 0,
        items: [],
      });
      toast.success(`Release v${newVersion} created`);
      setNewVersion("");
      setShowNew(false);
      setExpandedId(result.id);
      loadReleases();
    } catch (err: any) {
      toast.error(err.message || "Failed to create release");
    }
  };

  const handleDelete = async (id: number, version: string) => {
    if (!confirm(`Delete release v${version}? This cannot be undone.`)) return;
    try {
      await releasesApi.delete(id);
      toast.success("Release deleted");
      loadReleases();
    } catch { toast.error("Delete failed"); }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await releasesApi.togglePublish(id);
      setReleases(prev => prev.map(r => r.id === id ? { ...r, is_published: r.is_published ? 0 : 1 } : r));
      toast.success("Publish status updated");
    } catch { toast.error("Failed to toggle publish"); }
  };

  const handleAddItem = async (releaseId: number) => {
    try {
      await releasesApi.addItem({
        release_id: releaseId,
        item_type: "feature",
        texts: { en: "New change..." },
      });
      toast.success("Item added");
      loadReleases();
    } catch { toast.error("Failed to add item"); }
  };

  const handleUpdateItem = async (item: ReleaseItem) => {
    if (!item.id) return;
    try {
      await releasesApi.updateItem({
        id: item.id,
        item_type: item.item_type,
        texts: item.texts,
      });
      toast.success("Item updated");
    } catch { toast.error("Update failed"); }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await releasesApi.deleteItem(itemId);
      toast.success("Item removed");
      loadReleases();
    } catch { toast.error("Delete failed"); }
  };

  const handleUpdateRelease = async (release: Release) => {
    try {
      await releasesApi.update({
        id: release.id,
        version: release.version,
        release_date: release.release_date,
        date_translations: release.date_translations,
      });
      toast.success("Release updated");
    } catch { toast.error("Update failed"); }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <SkeletonList rows={4} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto">
        <ErrorState
          title="Couldn't load releases"
          message={loadError}
          onRetry={loadReleases}
          retrying={loading}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Release Notes</h2>
          <p className="text-sm text-muted-foreground">Manage version notes displayed on the /releases page</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadReleases} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Release
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 w-fit">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => setEditLang(l.code)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              editLang === l.code ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* New Release Form */}
      {showNew && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Create New Release</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Version</label>
              <input
                value={newVersion}
                onChange={e => setNewVersion(e.target.value)}
                placeholder="e.g. 2.5.0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Releases List */}
      {releases.length === 0 && !showNew && (
        <EmptyState
          icon={Tag}
          title="No releases yet"
          description="Create your first release to start publishing version notes."
          action={
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> New release
            </button>
          }
        />
      )}

      <div className="space-y-2">
        {releases.map(release => {
          const isExpanded = expandedId === release.id;
          return (
            <div key={release.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Release Header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : release.id)}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${release.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  v{release.version}
                </div>
                <span className="text-xs text-muted-foreground">{release.release_date}</span>
                <span className="text-[10px] text-muted-foreground/50">{release.items?.length || 0} items</span>
                <div className="flex-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleTogglePublish(release.id); }}
                  className={`p-1.5 rounded-lg transition-colors ${release.is_published ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                  title={release.is_published ? "Published — click to unpublish" : "Draft — click to publish"}
                >
                  {release.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(release.id, release.version); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Release meta */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Version</label>
                      <input
                        value={release.version}
                        onChange={e => setReleases(prev => prev.map(r => r.id === release.id ? { ...r, version: e.target.value } : r))}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Date Display ({editLang.toUpperCase()})</label>
                      <input
                        value={release.date_translations?.[editLang] || ""}
                        onChange={e => setReleases(prev => prev.map(r => r.id === release.id ? { ...r, date_translations: { ...r.date_translations, [editLang]: e.target.value } } : r))}
                        placeholder={`e.g. ${editLang === 'fr' ? '10 mars 2026' : 'March 10, 2026'}`}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <button onClick={() => handleUpdateRelease(release)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
                    <Save className="w-3 h-3" /> Save Release
                  </button>

                  {/* Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">Change Items</p>
                      <button
                        onClick={() => handleAddItem(release.id)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>

                    {(release.items || []).map((item, idx) => {
                      const typeConf = TYPE_CONFIG[item.item_type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.feature;
                      const TypeIcon = typeConf.icon;

                      return (
                        <div key={item.id || idx} className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 mt-2 shrink-0" />

                          {/* Type Selector */}
                          <select
                            value={item.item_type}
                            onChange={e => {
                              const updated = { ...item, item_type: e.target.value as any };
                              setReleases(prev => prev.map(r => r.id === release.id ? {
                                ...r, items: r.items.map((it, i) => i === idx ? updated : it)
                              } : r));
                            }}
                            className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground outline-none shrink-0"
                          >
                            <option value="feature">Feature</option>
                            <option value="bugfix">Bug Fix</option>
                            <option value="improvement">Improvement</option>
                          </select>

                          {/* Text Input */}
                          <input
                            value={item.texts?.[editLang] || ""}
                            onChange={e => {
                              const updated = { ...item, texts: { ...item.texts, [editLang]: e.target.value } };
                              setReleases(prev => prev.map(r => r.id === release.id ? {
                                ...r, items: r.items.map((it, i) => i === idx ? updated : it)
                              } : r));
                            }}
                            placeholder={`Description (${editLang.toUpperCase()})...`}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          />

                          {/* Save & Delete */}
                          <button
                            onClick={() => handleUpdateItem(item)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors shrink-0"
                            title="Save item"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => item.id && handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {(!release.items || release.items.length === 0) && (
                      <p className="text-xs text-muted-foreground/50 text-center py-4">No items yet. Add your first change item above.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReleasesManager;
