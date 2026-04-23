import { useState, useEffect } from "react";
import { adminMedia, type MediaFile } from "@/services/adminApi";
import { toast } from "sonner";
import { X, Trash2, Image as ImageIcon, FolderOpen } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { SkeletonList, EmptyState, ErrorState } from "@/components/admin/ui/adminUx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  category?: 'hero' | 'logo' | 'icon' | 'integration' | 'screenshot' | 'general';
}

const categories = [
  { key: '', label: 'All' },
  { key: 'hero', label: 'Hero Backgrounds' },
  { key: 'logo', label: 'Logos' },
  { key: 'icon', label: 'Icons' },
  { key: 'integration', label: 'Integrations' },
  { key: 'screenshot', label: 'Screenshots' },
  { key: 'general', label: 'General' },
];

const MediaLibrary = ({ isOpen, onClose, onSelect, category: initialCategory }: Props) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [showUploader, setShowUploader] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await adminMedia.list(selectedCategory || undefined);
      setFiles(result.data || []);
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load media library");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedCategory]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this image?')) return;

    try {
      await adminMedia.delete(id);
      setFiles(files.filter(f => f.id !== id));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUploadComplete = (file: MediaFile) => {
    setFiles([file, ...files]);
    setShowUploader(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-foreground">Media Library</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
          {/* Category filter */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {showUploader ? 'Cancel' : 'Upload New'}
          </button>
        </div>

        {/* Uploader panel */}
        {showUploader && (
          <div className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
            <ImageUploader
              category={(selectedCategory as any) || 'general'}
              onSelect={handleUploadComplete}
              label="Upload new image"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <SkeletonList variant="card" rows={10} />
          ) : loadError ? (
            <ErrorState
              title="Couldn't load media"
              message={loadError}
              onRetry={loadFiles}
              retrying={loading}
            />
          ) : files.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No images found"
              description="Upload your first image above to get started."
            />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => { onSelect(file); onClose(); }}
                  className="group relative aspect-square rounded-xl border border-border bg-muted/30 overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <img
                    src={file.thumb_url || file.image_url}
                    alt={file.alt_text || file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] text-primary-foreground truncate">{file.original_name}</p>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 hover:opacity-90 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Category badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-foreground/80 text-primary-foreground">
                    {file.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
