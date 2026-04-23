import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminOverlay } from "@/contexts/AdminOverlayContext";
import { useSectionVisibility } from "@/contexts/CmsContentContext";

interface EditableSectionProps {
  sectionKey: string;
  children: React.ReactNode;
  label?: string;
}

const EditableSection = ({ sectionKey, children, label }: EditableSectionProps) => {
  const { isAdmin, overlaysEnabled, publicPreview } = useAdminOverlay();
  const hiddenSections = useSectionVisibility();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const isHidden = hiddenSections.has(sectionKey);

  // Public visitors (or admins simulating public): hidden section = nothing rendered.
  if (isHidden && (!isAdmin || publicPreview)) return null;

  // Admins always see content; if overlays disabled or in public preview, just render children.
  if (!isAdmin || !overlaysEnabled || publicPreview) return <>{children}</>;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/admin?section=${sectionKey}`);
  };

  return (
    <div
      className="relative group/editable"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-40 pointer-events-none rounded-lg"
            style={{
              boxShadow: isHidden
                ? "inset 0 0 0 2px hsl(var(--destructive) / 0.5)"
                : "inset 0 0 0 2px hsl(var(--primary) / 0.4)",
            }}
          />
        )}
      </AnimatePresence>

      {isHidden && (
        <div className="absolute top-3 left-3 z-50 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-bold uppercase tracking-wider shadow-lg">
          <EyeOff className="w-3 h-3" />
          Hidden from public
        </div>
      )}

      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -4 }}
            transition={{ duration: 0.15 }}
            onClick={handleEdit}
            className="absolute top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            Edit{label ? ` ${label}` : ""}
          </motion.button>
        )}
      </AnimatePresence>

      <div className={isHidden ? "opacity-50" : ""}>{children}</div>
    </div>
  );
};

export default EditableSection;
