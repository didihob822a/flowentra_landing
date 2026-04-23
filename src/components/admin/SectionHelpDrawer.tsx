import { HelpCircle, X, BookOpen } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { findDocForSection, DocContent, DOCS } from "./docsData";

interface Props {
  sectionKey: string;
}

const SectionHelpDrawer = ({ sectionKey }: Props) => {
  const [open, setOpen] = useState(false);
  const doc = findDocForSection(sectionKey) || DOCS.find((d) => d.id === "getting-started")!;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
          title="Open contextual help for this section"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          ? Help
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col gap-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent text-left space-y-1">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4 text-primary" />
              Help · {doc.title}
            </SheetTitle>
            <SheetClose className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </SheetClose>
          </div>
          <SheetDescription className="text-xs">
            Contextual guide for the section you're editing. All text below is in English.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <DocContent doc={doc} />

          <div className="mt-8 pt-5 border-t border-border text-[11px] text-muted-foreground/70">
            Need the full documentation?{" "}
            <a
              href="/admin?section=__docs"
              className="font-semibold text-primary hover:underline"
            >
              Open Documentation →
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SectionHelpDrawer;
