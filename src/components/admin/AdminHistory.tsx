import { useState, useEffect } from "react";
import { adminContent, type ChangeLogEntry } from "@/services/adminApi";
import { Clock } from "lucide-react";
import { SkeletonList, EmptyState, ErrorState } from "@/components/admin/ui/adminUx";

interface Props {
  section?: string;
}

const AdminHistory = ({ section }: Props) => {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminContent.getHistory(section, 100);
      setEntries(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load history");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonList rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState
          title="Couldn't load history"
          message={error}
          onRetry={loadHistory}
          retrying={loading}
        />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={Clock}
          title="No changes recorded yet"
          description="As you edit content, every change will appear here for auditing and rollback."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-2">
      {entries.map((entry, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{entry.section}</span>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{entry.content_key}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{entry.lang.toUpperCase()}</span>
            </div>
            <div className="flex gap-4 text-xs mt-2">
              {entry.old_value && (
                <div className="flex-1">
                  <p className="text-muted-foreground/50 mb-0.5">Before:</p>
                  <p className="text-muted-foreground line-through truncate">{entry.old_value}</p>
                </div>
              )}
              <div className="flex-1">
                <p className="text-muted-foreground/50 mb-0.5">After:</p>
                <p className="text-foreground truncate">{entry.new_value}</p>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium text-foreground">{entry.changed_by_name}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(entry.changed_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminHistory;
