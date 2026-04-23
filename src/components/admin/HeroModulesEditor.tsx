import { useRef, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import IconPicker from "./IconPicker";

interface HeroModule {
  icon: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (json: string) => void;
  langLabel: string;
  isRtl?: boolean;
}

const parse = (v: string): HeroModule[] => {
  try {
    const p = JSON.parse(v);
    if (Array.isArray(p)) return p;
  } catch {}
  return [];
};

const HeroModulesEditor = ({ value, onChange, langLabel, isRtl }: Props) => {
  const modules = parse(value);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // dropZone: index where the blue line appears (insert *before* this index)
  const [dropZone, setDropZone] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const update = (next: HeroModule[]) => onChange(JSON.stringify(next, null, 2));

  const setModule = (i: number, mod: HeroModule) => {
    const next = [...modules];
    next[i] = mod;
    update(next);
  };

  const addModule = () => update([...modules, { icon: "Layers", label: "" }]);
  const removeModule = (i: number) => update(modules.filter((_, j) => j !== i));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, i: number) => {
    setDragIdx(i);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.35";
    });
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    setDragIdx(null);
    setDropZone(null);
    dragNode.current = null;
  };

  // Compute which gap the cursor is closest to
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, i: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIdx === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    // If above midpoint → insert before this item, else after
    const zone = e.clientY < midY ? i : i + 1;
    // Don't show indicator at the dragged item's original position
    if (zone === dragIdx || zone === dragIdx + 1) {
      setDropZone(null);
    } else {
      setDropZone(zone);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragIdx === null || dropZone === null) return;
    const next = [...modules];
    const [moved] = next.splice(dragIdx, 1);
    // Adjust target index since we removed an item
    const target = dropZone > dragIdx ? dropZone - 1 : dropZone;
    next.splice(target, 0, moved);
    update(next);
    setDragIdx(null);
    setDropZone(null);
  };

  const handleListDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // When dragging past the last item, show drop zone at end
    if (dragIdx === null) return;
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (e.clientY > rect.bottom - 8) {
      const zone = modules.length;
      if (zone === dragIdx || zone === dragIdx + 1) {
        setDropZone(null);
      } else {
        setDropZone(zone);
      }
    }
  };

  const DropIndicator = () => (
    <div className="flex items-center gap-1.5 py-0.5">
      <div className="w-2 h-2 rounded-full bg-primary border-2 border-primary shadow-sm shadow-primary/40" />
      <div className="flex-1 h-0.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
      <div className="w-2 h-2 rounded-full bg-primary border-2 border-primary shadow-sm shadow-primary/40" />
    </div>
  );

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground font-medium">
          {langLabel} — {modules.length} module{modules.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={addModule}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div ref={listRef} onDragOver={handleListDragOver} onDrop={handleDrop} className="space-y-0">
        {modules.map((mod, i) => (
          <div key={`${i}-${mod.icon}-${mod.label}`}>
            {/* Drop indicator BEFORE this item */}
            {dropZone === i && <DropIndicator />}

            <div
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, i)}
              className={`flex items-center gap-2 rounded-lg border p-2 my-0.5 transition-all duration-150 ${
                dragIdx === i
                  ? "border-primary/30 bg-primary/5 opacity-40"
                  : "border-border bg-background hover:border-border/80"
              }`}
            >
              {/* Drag handle */}
              <div
                className="flex items-center justify-center w-6 h-8 rounded-md cursor-grab active:cursor-grabbing hover:bg-muted/60 transition-colors shrink-0 touch-none"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {/* Icon picker */}
              <IconPicker
                value={mod.icon}
                onChange={(name) => setModule(i, { ...mod, icon: name })}
              />

              {/* Label */}
              <input
                type="text"
                value={mod.label}
                onChange={(e) => setModule(i, { ...mod, label: e.target.value })}
                dir={isRtl ? "rtl" : "ltr"}
                placeholder="Module label…"
                className="flex-1 px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeModule(i)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drop indicator AFTER last item */}
            {i === modules.length - 1 && dropZone === modules.length && <DropIndicator />}
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <p className="text-[10px] text-muted-foreground/60 text-center py-3">
          No modules yet — click Add to start.
        </p>
      )}
    </div>
  );
};

export default HeroModulesEditor;
