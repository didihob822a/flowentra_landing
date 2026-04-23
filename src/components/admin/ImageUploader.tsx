import { useState, useRef } from "react";
import { adminMedia, type MediaFile } from "@/services/adminApi";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2, Trash2, Check } from "lucide-react";

interface Props {
  category?: 'hero' | 'logo' | 'icon' | 'integration' | 'screenshot' | 'general';
  section?: string;
  onSelect?: (file: MediaFile) => void;
  currentValue?: string;
  label?: string;
}

const ImageUploader = ({ category = 'general', section, onSelect, currentValue, label }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, GIF, WebP, or SVG');
      return;
    }

    // Validate size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum 20MB');
      return;
    }

    setUploading(true);

    try {
      const result = await adminMedia.upload(file, category, '', section);
      
      if (result.success && result.data) {
        setPreview(result.data.image_url);
        onSelect?.(result.data);
        toast.success('Image uploaded');
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearPreview = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-foreground block">{label}</label>}
      
      {preview ? (
        <div className="relative rounded-xl border border-border bg-card overflow-hidden group">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-contain bg-muted/30" 
          />
          <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-primary-foreground text-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Replace
            </button>
            <button
              onClick={clearPreview}
              className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/80 text-primary-foreground text-[10px]">
            <Check className="w-3 h-3" /> Uploaded
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
            ${dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }
            ${uploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF, WebP, SVG (max 20MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
