import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Send, Users, FileText, Settings, Plus, Trash2, Save,
  Upload, Eye, Clock, CheckCircle, XCircle, Loader2, TestTube,
  Bold, Italic, Link, Image, List, AlignLeft, AlignCenter, Type,
  Palette, MailPlus, SendHorizonal, Smartphone, Monitor,
  LayoutTemplate, Heading1, Heading2, Minus, Square, Columns,
  ArrowUp, ArrowDown, Copy, Code, Undo2, MousePointerClick,
  Paintbrush, Wand2, GripVertical
} from "lucide-react";
import { adminEmail, type EmailTemplate, type EmailContact, type EmailCampaign } from "@/services/adminEmailApi";

// ==================== BLOCK-BASED EMAIL BUILDER ====================

interface EmailBlock {
  id: string;
  type: "header" | "text" | "image" | "button" | "divider" | "spacer" | "columns" | "hero" | "social" | "footer";
  content: Record<string, string>;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Pre-built starter templates
const STARTER_TEMPLATES: { name: string; icon: string; description: string; blocks: EmailBlock[] }[] = [
  {
    name: "Welcome Email",
    icon: "👋",
    description: "Onboarding email for new users",
    blocks: [
      { id: generateId(), type: "hero", content: { title: "Welcome to {{company}}!", subtitle: "We're excited to have you on board.", bgColor: "#0f172a", textColor: "#ffffff" } },
      { id: generateId(), type: "text", content: { text: "<p>Hi {{name}},</p><p>Thank you for signing up! Here are a few things to get you started:</p><ul><li>Explore the dashboard</li><li>Set up your first workflow</li><li>Connect your integrations</li></ul>" } },
      { id: generateId(), type: "button", content: { text: "Get Started →", url: "https://", bgColor: "#2563eb", textColor: "#ffffff", align: "center" } },
      { id: generateId(), type: "divider", content: { color: "#e5e7eb" } },
      { id: generateId(), type: "text", content: { text: "<p style='color:#6b7280;font-size:13px'>Need help? Reply to this email or visit our <a href='#'>support center</a>.</p>" } },
    ],
  },
  {
    name: "Newsletter",
    icon: "📰",
    description: "Weekly/monthly newsletter layout",
    blocks: [
      { id: generateId(), type: "header", content: { text: "Monthly Update", logoUrl: "", align: "center" } },
      { id: generateId(), type: "hero", content: { title: "What's New This Month", subtitle: "Product updates, tips, and highlights", bgColor: "#1e40af", textColor: "#ffffff" } },
      { id: generateId(), type: "text", content: { text: "<h2>🚀 New Features</h2><p>We've been busy building amazing things for you. Here's what's new:</p>" } },
      { id: generateId(), type: "image", content: { url: "https://placehold.co/560x280/e2e8f0/64748b?text=Feature+Screenshot", alt: "New feature", width: "100%" } },
      { id: generateId(), type: "text", content: { text: "<h2>💡 Tips & Tricks</h2><p>Did you know you can automate your entire workflow in just 3 clicks? <a href='#'>Learn how →</a></p>" } },
      { id: generateId(), type: "button", content: { text: "Read Full Update", url: "https://", bgColor: "#2563eb", textColor: "#ffffff", align: "center" } },
      { id: generateId(), type: "divider", content: { color: "#e5e7eb" } },
      { id: generateId(), type: "social", content: { twitter: "https://twitter.com/", linkedin: "https://linkedin.com/", website: "https://" } },
    ],
  },
  {
    name: "Promotional",
    icon: "🎉",
    description: "Sale or promotion announcement",
    blocks: [
      { id: generateId(), type: "hero", content: { title: "🔥 Special Offer", subtitle: "Limited time only — save up to 50%", bgColor: "#dc2626", textColor: "#ffffff" } },
      { id: generateId(), type: "text", content: { text: "<p>Hi {{name}},</p><p>For a limited time, enjoy exclusive discounts on all plans. Upgrade now and unlock the full potential of your business.</p>" } },
      { id: generateId(), type: "columns", content: { left: "<div style='text-align:center;padding:16px;background:#fef2f2;border-radius:8px'><p style='font-size:32px;font-weight:bold;color:#dc2626;margin:0'>50%</p><p style='color:#6b7280;margin:4px 0 0'>OFF Starter</p></div>", right: "<div style='text-align:center;padding:16px;background:#eff6ff;border-radius:8px'><p style='font-size:32px;font-weight:bold;color:#2563eb;margin:0'>30%</p><p style='color:#6b7280;margin:4px 0 0'>OFF Enterprise</p></div>" } },
      { id: generateId(), type: "button", content: { text: "Claim Your Discount", url: "https://", bgColor: "#dc2626", textColor: "#ffffff", align: "center" } },
      { id: generateId(), type: "text", content: { text: "<p style='text-align:center;color:#6b7280;font-size:12px'>Offer expires in 48 hours. Terms apply.</p>" } },
    ],
  },
  {
    name: "Announcement",
    icon: "📢",
    description: "Product update or company news",
    blocks: [
      { id: generateId(), type: "header", content: { text: "Product Update", logoUrl: "", align: "left" } },
      { id: generateId(), type: "text", content: { text: "<h1 style='font-size:24px'>Introducing: Advanced Analytics</h1><p>We're thrilled to announce our most requested feature is now live!</p>" } },
      { id: generateId(), type: "image", content: { url: "https://placehold.co/560x300/e2e8f0/64748b?text=Product+Screenshot", alt: "New feature", width: "100%" } },
      { id: generateId(), type: "text", content: { text: "<p>With Advanced Analytics, you can now:</p><ul><li>Track real-time performance metrics</li><li>Create custom dashboards</li><li>Export reports in multiple formats</li></ul>" } },
      { id: generateId(), type: "button", content: { text: "Try It Now", url: "https://", bgColor: "#059669", textColor: "#ffffff", align: "center" } },
    ],
  },
  {
    name: "Blank",
    icon: "📄",
    description: "Start from scratch",
    blocks: [
      { id: generateId(), type: "text", content: { text: "<p>Start typing your email content here...</p>" } },
    ],
  },
];

// Render a single block to HTML
function renderBlockHtml(block: EmailBlock): string {
  const c = block.content;
  switch (block.type) {
    case "header":
      return `<div style="padding:20px 0;text-align:${c.align || 'left'};border-bottom:1px solid #e5e7eb">
        ${c.logoUrl ? `<img src="${c.logoUrl}" alt="Logo" style="height:32px;margin-bottom:8px" />` : ''}
        <p style="font-size:14px;font-weight:600;color:#374151;margin:0">${c.text || ''}</p>
      </div>`;
    case "hero":
      return `<div style="background:${c.bgColor || '#0f172a'};color:${c.textColor || '#ffffff'};padding:40px 32px;text-align:center;border-radius:8px;margin:16px 0">
        <h1 style="font-size:28px;font-weight:bold;margin:0 0 8px">${c.title || ''}</h1>
        <p style="font-size:15px;opacity:0.85;margin:0">${c.subtitle || ''}</p>
      </div>`;
    case "text":
      return `<div style="padding:12px 0;font-size:15px;line-height:1.6;color:#374151">${c.text || ''}</div>`;
    case "image":
      return `<div style="padding:12px 0;text-align:center"><img src="${c.url || ''}" alt="${c.alt || ''}" style="max-width:${c.width || '100%'};height:auto;border-radius:8px" /></div>`;
    case "button":
      return `<div style="padding:16px 0;text-align:${c.align || 'center'}"><a href="${c.url || '#'}" style="display:inline-block;background:${c.bgColor || '#2563eb'};color:${c.textColor || '#ffffff'};padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">${c.text || 'Click Here'}</a></div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${c.color || '#e5e7eb'};margin:20px 0" />`;
    case "spacer":
      return `<div style="height:${c.height || '24'}px"></div>`;
    case "columns":
      return `<div style="display:flex;gap:16px;padding:12px 0">
        <div style="flex:1">${c.left || ''}</div>
        <div style="flex:1">${c.right || ''}</div>
      </div>`;
    case "social":
      return `<div style="text-align:center;padding:16px 0">${[
        c.twitter && `<a href="${c.twitter}" style="margin:0 8px;color:#6b7280;text-decoration:none">Twitter</a>`,
        c.linkedin && `<a href="${c.linkedin}" style="margin:0 8px;color:#6b7280;text-decoration:none">LinkedIn</a>`,
        c.website && `<a href="${c.website}" style="margin:0 8px;color:#6b7280;text-decoration:none">Website</a>`,
      ].filter(Boolean).join(' · ')}</div>`;
    case "footer":
      return `<div style="padding:16px 0;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;margin-top:16px">
        <p>${c.text || '© 2026 Flowentra. All rights reserved.'}</p>
        <p><a href="{{unsubscribe_url}}" style="color:#9ca3af">Unsubscribe</a></p>
      </div>`;
    default:
      return '';
  }
}

// Wrap blocks in email layout
function wrapInLayout(blocks: EmailBlock[], brandColor: string): string {
  const body = blocks.map(renderBlockHtml).join('\n');
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
  <div style="padding:32px 40px">
    ${body}
  </div>
</div>
</body>
</html>`;
}

// ==================== BLOCK EDITOR COMPONENT ====================

const blockTypes: { type: EmailBlock["type"]; label: string; icon: any }[] = [
  { type: "header", label: "Header", icon: LayoutTemplate },
  { type: "hero", label: "Hero Banner", icon: Heading1 },
  { type: "text", label: "Text / Rich Content", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "button", label: "CTA Button", icon: MousePointerClick },
  { type: "columns", label: "Two Columns", icon: Columns },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: Square },
  { type: "social", label: "Social Links", icon: Link },
  { type: "footer", label: "Footer", icon: AlignCenter },
];

const BlockEditor = ({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: {
  block: EmailBlock;
  onChange: (content: Record<string, string>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}) => {
  const c = block.content;
  const set = (key: string, val: string) => onChange({ ...c, [key]: val });

  const blockMeta = blockTypes.find(b => b.type === block.type);
  const Icon = blockMeta?.icon || Type;

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
      {/* Block header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3 text-muted-foreground/40" />
          <Icon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">{blockMeta?.label || block.type}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} className="p-1 rounded hover:bg-muted text-muted-foreground"><ArrowUp className="w-3 h-3" /></button>
          <button onClick={onMoveDown} className="p-1 rounded hover:bg-muted text-muted-foreground"><ArrowDown className="w-3 h-3" /></button>
          <button onClick={onDuplicate} className="p-1 rounded hover:bg-muted text-muted-foreground"><Copy className="w-3 h-3" /></button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Block content editor */}
      <div className="p-3 space-y-2">
        {block.type === "header" && (
          <>
            <SmallInput label="Header Text" value={c.text || ""} onChange={v => set("text", v)} placeholder="Company Name" />
            <SmallInput label="Logo URL" value={c.logoUrl || ""} onChange={v => set("logoUrl", v)} placeholder="https://..." />
            <SmallSelect label="Align" value={c.align || "left"} onChange={v => set("align", v)} options={["left", "center", "right"]} />
          </>
        )}
        {block.type === "hero" && (
          <>
            <SmallInput label="Title" value={c.title || ""} onChange={v => set("title", v)} placeholder="Welcome!" />
            <SmallInput label="Subtitle" value={c.subtitle || ""} onChange={v => set("subtitle", v)} placeholder="Subtext..." />
            <div className="grid grid-cols-2 gap-2">
              <SmallColor label="Background" value={c.bgColor || "#0f172a"} onChange={v => set("bgColor", v)} />
              <SmallColor label="Text Color" value={c.textColor || "#ffffff"} onChange={v => set("textColor", v)} />
            </div>
          </>
        )}
        {block.type === "text" && (
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">HTML Content</label>
            <textarea
              value={c.text || ""}
              onChange={e => set("text", e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              placeholder="<p>Your text here...</p>"
            />
          </div>
        )}
        {block.type === "image" && (
          <>
            <SmallInput label="Image URL" value={c.url || ""} onChange={v => set("url", v)} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-2">
              <SmallInput label="Alt Text" value={c.alt || ""} onChange={v => set("alt", v)} placeholder="Image description" />
              <SmallInput label="Width" value={c.width || "100%"} onChange={v => set("width", v)} placeholder="100%" />
            </div>
          </>
        )}
        {block.type === "button" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <SmallInput label="Button Text" value={c.text || ""} onChange={v => set("text", v)} placeholder="Click Here" />
              <SmallInput label="URL" value={c.url || ""} onChange={v => set("url", v)} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SmallColor label="BG Color" value={c.bgColor || "#2563eb"} onChange={v => set("bgColor", v)} />
              <SmallColor label="Text Color" value={c.textColor || "#ffffff"} onChange={v => set("textColor", v)} />
              <SmallSelect label="Align" value={c.align || "center"} onChange={v => set("align", v)} options={["left", "center", "right"]} />
            </div>
          </>
        )}
        {block.type === "divider" && (
          <SmallColor label="Line Color" value={c.color || "#e5e7eb"} onChange={v => set("color", v)} />
        )}
        {block.type === "spacer" && (
          <SmallInput label="Height (px)" value={c.height || "24"} onChange={v => set("height", v)} placeholder="24" />
        )}
        {block.type === "columns" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Left Column HTML</label>
              <textarea value={c.left || ""} onChange={e => set("left", e.target.value)} rows={4}
                className="w-full px-2 py-1.5 rounded border border-border bg-background text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Right Column HTML</label>
              <textarea value={c.right || ""} onChange={e => set("right", e.target.value)} rows={4}
                className="w-full px-2 py-1.5 rounded border border-border bg-background text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />
            </div>
          </div>
        )}
        {block.type === "social" && (
          <div className="grid grid-cols-3 gap-2">
            <SmallInput label="Twitter" value={c.twitter || ""} onChange={v => set("twitter", v)} placeholder="https://..." />
            <SmallInput label="LinkedIn" value={c.linkedin || ""} onChange={v => set("linkedin", v)} placeholder="https://..." />
            <SmallInput label="Website" value={c.website || ""} onChange={v => set("website", v)} placeholder="https://..." />
          </div>
        )}
        {block.type === "footer" && (
          <SmallInput label="Footer Text" value={c.text || ""} onChange={v => set("text", v)} placeholder="© 2026 Company. All rights reserved." />
        )}
      </div>
    </div>
  );
};

// Small reusable inputs
const SmallInput = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5 block">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
  </div>
);

const SmallColor = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5 block">{label}</label>
    <div className="flex items-center gap-1.5">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
      <input value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 px-2 py-1.5 rounded-md border border-border bg-background text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  </div>
);

const SmallSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <div>
    <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5 block">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ==================== VISUAL EMAIL COMPOSER ====================

const VisualEmailComposer = ({ initialBlocks, onSendHtml }: {
  initialBlocks?: EmailBlock[];
  onSendHtml?: (html: string, subject: string) => void;
}) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks || STARTER_TEMPLATES[4].blocks.map(b => ({ ...b, id: generateId() })));
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showTemplateChooser, setShowTemplateChooser] = useState(!initialBlocks);
  const [brandColor, setBrandColor] = useState("#2563eb");
  const previewRef = useRef<HTMLIFrameElement>(null);

  const fullHtml = wrapInLayout(blocks, brandColor);

  const updateBlock = (id: string, content: Record<string, string>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0 || (dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  };

  const duplicateBlock = (id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const copy = { ...prev[idx], id: generateId(), content: { ...prev[idx].content } };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const addBlock = (type: EmailBlock["type"]) => {
    const defaults: Record<string, Record<string, string>> = {
      header: { text: "Company Name", logoUrl: "", align: "left" },
      hero: { title: "Headline Here", subtitle: "Subtitle text", bgColor: "#0f172a", textColor: "#ffffff" },
      text: { text: "<p>Your content here...</p>" },
      image: { url: "https://placehold.co/560x280/e2e8f0/64748b?text=Image", alt: "Image", width: "100%" },
      button: { text: "Call to Action", url: "https://", bgColor: brandColor, textColor: "#ffffff", align: "center" },
      divider: { color: "#e5e7eb" },
      spacer: { height: "24" },
      columns: { left: "<p>Left column</p>", right: "<p>Right column</p>" },
      social: { twitter: "", linkedin: "", website: "" },
      footer: { text: `© ${new Date().getFullYear()} Flowentra. All rights reserved.` },
    };
    setBlocks(prev => [...prev, { id: generateId(), type, content: defaults[type] || {} }]);
    setShowBlockPicker(false);
  };

  const loadStarterTemplate = (template: typeof STARTER_TEMPLATES[0]) => {
    setBlocks(template.blocks.map(b => ({ ...b, id: generateId() })));
    setShowTemplateChooser(false);
  };

  const handleSend = async () => {
    if (!to || !subject) return toast.error("Fill To and Subject fields");
    setSending(true);
    try {
      const result = await adminEmail.sendSingle(to, subject, fullHtml);
      if (result.success) {
        toast.success("Email sent!");
        setTo("");
      } else {
        toast.error(result.message || "Failed to send");
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setSending(false); }
  };

  // Template chooser overlay
  if (showTemplateChooser) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Choose a Template</h3>
            <p className="text-xs text-muted-foreground">Start with a pre-built design or build from scratch</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowTemplateChooser(false)}>Skip</Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {STARTER_TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => loadStarterTemplate(t)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-semibold mt-2 group-hover:text-primary transition-colors">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.description}</p>
              <Badge variant="secondary" className="mt-2 text-[9px]">{t.blocks.length} blocks</Badge>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Send fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5 block">To</label>
          <Input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5 block">Subject</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your email subject..." />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowTemplateChooser(true)}>
          <Wand2 className="w-3 h-3 mr-1" /> Templates
        </Button>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
        <Button variant={showCode ? "default" : "outline"} size="sm" onClick={() => setShowCode(!showCode)}>
          <Code className="w-3 h-3 mr-1" /> {showCode ? "Visual" : "Code"}
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <Paintbrush className="w-3 h-3 text-muted-foreground" />
          <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" title="Brand color" />
        </div>
        <Badge variant="secondary" className="text-[10px]">{"{{name}}"} {"{{email}}"}</Badge>
      </div>

      {/* Split View: Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Block Editor */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {showCode ? (
            <textarea
              value={fullHtml}
              readOnly
              rows={25}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-[10px] font-mono focus:outline-none resize-y"
            />
          ) : (
            <>
              {blocks.map((block, idx) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={content => updateBlock(block.id, content)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, -1)}
                  onMoveDown={() => moveBlock(block.id, 1)}
                  onDuplicate={() => duplicateBlock(block.id)}
                />
              ))}

              {/* Add Block */}
              {showBlockPicker ? (
                <div className="bg-card border border-dashed border-primary/30 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Add a Block</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {blockTypes.map(bt => (
                      <button
                        key={bt.type}
                        onClick={() => addBlock(bt.type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <bt.icon className="w-3.5 h-3.5" />
                        {bt.label}
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => setShowBlockPicker(false)}>Cancel</Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBlockPicker(true)}
                  className="w-full py-3 border-2 border-dashed border-border rounded-lg text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Block
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-card">
            <span className="text-[10px] font-semibold text-muted-foreground">Live Preview</span>
            <span className="text-[10px] text-muted-foreground/50">{previewMode === "mobile" ? "375px" : "600px"}</span>
          </div>
          <div className="flex justify-center p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            <iframe
              ref={previewRef}
              srcDoc={fullHtml}
              className="border-0 bg-white rounded-lg shadow-sm"
              style={{ width: previewMode === "mobile" ? 375 : 600, minHeight: 400 }}
              title="Email Preview"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSend} disabled={sending}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send Email
        </Button>
        <Button variant="outline" onClick={() => {
          navigator.clipboard.writeText(fullHtml);
          toast.success("HTML copied to clipboard");
        }}>
          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy HTML
        </Button>
      </div>
    </div>
  );
};

// ==================== SMTP Settings Tab ====================
const SmtpSettings = () => {
  const [settings, setSettings] = useState({
    host: "ssl0.ovh.net",
    port: 587,
    username: "",
    password: "",
    encryption: "tls",
    from_name: "Flowentra",
    from_email: "",
    reply_to: "",
  });
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    adminEmail.getSmtpSettings().then(s => { if (s) setSettings(prev => ({ ...prev, ...s })); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminEmail.saveSmtpSettings(settings);
      toast.success("SMTP settings saved");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testEmail) return toast.error("Enter a test email");
    setTesting(true);
    try {
      const result = await adminEmail.testSmtp(testEmail);
      if (result.success) toast.success("Test email sent!");
      else toast.error(result.message || "Test failed");
    } catch (e: any) { toast.error(e.message); }
    finally { setTesting(false); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" /> OVH SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">SMTP Host</label>
              <Input value={settings.host} onChange={e => setSettings(p => ({ ...p, host: e.target.value }))} placeholder="ssl0.ovh.net" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Port</label>
              <Input type="number" value={settings.port} onChange={e => setSettings(p => ({ ...p, port: parseInt(e.target.value) || 587 }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Username (email)</label>
              <Input value={settings.username} onChange={e => setSettings(p => ({ ...p, username: e.target.value }))} placeholder="noreply@yourdomain.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
              <Input type="password" value={settings.password} onChange={e => setSettings(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Encryption</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={settings.encryption}
                onChange={e => setSettings(p => ({ ...p, encryption: e.target.value }))}
              >
                <option value="tls">TLS (Recommended)</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From Name</label>
              <Input value={settings.from_name} onChange={e => setSettings(p => ({ ...p, from_name: e.target.value }))} placeholder="Flowentra" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From Email</label>
              <Input value={settings.from_email} onChange={e => setSettings(p => ({ ...p, from_email: e.target.value }))} placeholder="contact@yourdomain.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reply-To (optional)</label>
              <Input value={settings.reply_to} onChange={e => setSettings(p => ({ ...p, reply_to: e.target.value }))} placeholder="support@yourdomain.com" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TestTube className="w-4 h-4" /> Test SMTP Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="max-w-xs"
            />
            <Button onClick={handleTest} disabled={testing} variant="outline" size="sm">
              {testing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
              Send Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== Templates Manager ====================
const TemplatesManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editing, setEditing] = useState<Partial<EmailTemplate> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = () => {
    adminEmail.getTemplates().then(setTemplates).catch(() => {});
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.subject) return toast.error("Name and subject required");
    setSaving(true);
    try {
      await adminEmail.saveTemplate(editing as any);
      toast.success("Template saved");
      setEditing(null);
      loadTemplates();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    try {
      await adminEmail.deleteTemplate(id);
      toast.success("Deleted");
      loadTemplates();
    } catch (e: any) { toast.error(e.message); }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(null)}>← Back</Button>
          <h3 className="text-sm font-semibold">{editing.id ? "Edit" : "New"} Template</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Template Name</label>
            <Input value={editing.name || ""} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} placeholder="Welcome Email" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={editing.category || "general"}
              onChange={e => setEditing(p => ({ ...p!, category: e.target.value as any }))}
            >
              <option value="general">General</option>
              <option value="newsletter">Newsletter</option>
              <option value="promotional">Promotional</option>
              <option value="transactional">Transactional</option>
              <option value="welcome">Welcome</option>
              <option value="notification">Notification</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
          <Input value={editing.subject || ""} onChange={e => setEditing(p => ({ ...p!, subject: e.target.value }))} placeholder="Welcome to Flowentra, {{name}}!" />
        </div>

        {/* Split editor + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">HTML Body</label>
              <Badge variant="secondary" className="text-[9px]">Supports {"{{name}}"} {"{{email}}"}</Badge>
            </div>
            <Textarea
              value={editing.html_body || ""}
              onChange={e => setEditing(p => ({ ...p!, html_body: e.target.value }))}
              placeholder="<h1>Hello {{name}}</h1>"
              className="min-h-[350px] font-mono text-xs"
            />
          </div>
          <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
            <div className="px-3 py-2 border-b border-border/50 bg-card">
              <span className="text-[10px] font-semibold text-muted-foreground">Live Preview</span>
            </div>
            <iframe
              srcDoc={wrapInLayout([{ id: "preview", type: "text", content: { text: editing.html_body || "" } }], "#2563eb")}
              className="w-full min-h-[350px] border-0"
              title="Template Preview"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
            Save Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{templates.length} templates</p>
        <Button size="sm" onClick={() => setEditing({ name: "", subject: "", html_body: "", category: "general" })}>
          <Plus className="w-3 h-3 mr-1" /> New Template
        </Button>
      </div>
      <div className="grid gap-3">
        {templates.map(t => (
          <Card key={t.id} className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.subject}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(t)}><FileText className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id!)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No templates yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
};

// ==================== Contacts Manager ====================
const ContactsManager = () => {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [groups, setGroups] = useState<{ group_name: string; count: number }[]>([]);
  const [activeGroup, setActiveGroup] = useState("");
  const [newContact, setNewContact] = useState({ email: "", name: "", group_name: "default" });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadData(); }, [activeGroup]);

  const loadData = async () => {
    try {
      const [contactsData, groupsData] = await Promise.all([
        adminEmail.getContacts(activeGroup),
        adminEmail.getGroups()
      ]);
      setContacts(contactsData);
      setGroups(groupsData);
    } catch {}
  };

  const handleAdd = async () => {
    if (!newContact.email) return toast.error("Email required");
    try {
      await adminEmail.saveContact(newContact);
      toast.success("Contact added");
      setNewContact({ email: "", name: "", group_name: "default" });
      setShowAdd(false);
      loadData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminEmail.deleteContact(id);
      toast.success("Contact removed");
      loadData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleImportCsv = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      const contacts = lines.map(l => {
        const [email, name] = l.split(",").map(s => s.trim());
        return { email, name: name || "" };
      }).filter(c => c.email.includes("@"));

      try {
        await adminEmail.importContacts(contacts, activeGroup || "imported");
        toast.success(`${contacts.length} contacts imported`);
        loadData();
      } catch (e: any) { toast.error(e.message); }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={!activeGroup ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveGroup("")}
        >
          All ({contacts.length})
        </Badge>
        {groups.map(g => (
          <Badge
            key={g.group_name}
            variant={activeGroup === g.group_name ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveGroup(g.group_name)}
          >
            {g.group_name} ({g.count})
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3 mr-1" /> Add Contact
        </Button>
        <Button variant="outline" size="sm" onClick={handleImportCsv}>
          <Upload className="w-3 h-3 mr-1" /> Import CSV
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
              <Input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} placeholder="Name (optional)" />
              <Input value={newContact.group_name} onChange={e => setNewContact(p => ({ ...p, group_name: e.target.value }))} placeholder="Group" />
            </div>
            <Button size="sm" className="mt-3" onClick={handleAdd}><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </CardContent>
        </Card>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Group</th>
              <th className="px-4 py-2 text-xs font-medium text-muted-foreground w-16"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-2 text-xs">{c.email}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{c.name || "—"}</td>
                <td className="px-4 py-2"><Badge variant="secondary" className="text-[10px]">{c.group_name}</Badge></td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDelete(c.id!)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">No contacts yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== Mass Email / Campaigns ====================
const CampaignsManager = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [groups, setGroups] = useState<{ group_name: string; count: number }[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", html_body: "", group: "", delay_seconds: 3 });
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    Promise.all([
      adminEmail.getCampaigns().then(setCampaigns),
      adminEmail.getGroups().then(setGroups),
      adminEmail.getTemplates().then(setTemplates),
    ]).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!form.subject || !form.html_body) return toast.error("Subject and body required");
    if (!confirm(`Send mass email to ${form.group ? `group "${form.group}"` : "ALL subscribers"}?`)) return;
    setSending(true);
    try {
      const result = await adminEmail.sendMass(form.subject, form.html_body, form.group || undefined, undefined, form.delay_seconds);
      toast.success(result.message || "Campaign completed");
      setShowNew(false);
      adminEmail.getCampaigns().then(setCampaigns);
    } catch (e: any) { toast.error(e.message); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          <MailPlus className="w-3 h-3 mr-1" /> New Campaign
        </Button>
      </div>

      {showNew && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {templates.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Load template:</span>
                {templates.map(t => (
                  <Badge key={t.id} variant="outline" className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setForm(p => ({ ...p, subject: t.subject, html_body: t.html_body }))}>
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject" />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.group}
                onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
              >
                <option value="">All subscribers</option>
                {groups.map(g => (
                  <option key={g.group_name} value={g.group_name}>{g.group_name} ({g.count})</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Delay (sec):</label>
                <Input type="number" min={1} max={30} value={form.delay_seconds} onChange={e => setForm(p => ({ ...p, delay_seconds: parseInt(e.target.value) || 3 }))} />
              </div>
            </div>
            <Textarea
              value={form.html_body}
              onChange={e => setForm(p => ({ ...p, html_body: e.target.value }))}
              placeholder="<h1>Hello {{name}}</h1>&#10;<p>Newsletter content...</p>"
              className="min-h-[250px] font-mono text-xs"
            />
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <SendHorizonal className="w-4 h-4 mr-2" />}
              {sending ? "Sending..." : "Launch Campaign"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign History */}
      <div className="space-y-2">
        {campaigns.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()} · {c.total_recipients} recipients
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-500" /> {c.sent_count}
                  {c.failed_count > 0 && <><XCircle className="w-3 h-3 text-destructive ml-2" /> {c.failed_count}</>}
                </div>
                <Badge variant={c.status === "completed" ? "default" : c.status === "sending" ? "secondary" : "outline"}>
                  {c.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {campaigns.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No campaigns yet</p>
        )}
      </div>
    </div>
  );
};

// ==================== Main Email Manager ====================
const EmailManager = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5" /> Email Manager
        </h2>
        <p className="text-sm text-muted-foreground">Professional email editor with visual builder & SMTP</p>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="compose" className="text-xs"><Wand2 className="w-3 h-3 mr-1" /> Compose</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs"><SendHorizonal className="w-3 h-3 mr-1" /> Campaigns</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs"><Users className="w-3 h-3 mr-1" /> Contacts</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs"><FileText className="w-3 h-3 mr-1" /> Templates</TabsTrigger>
          <TabsTrigger value="smtp" className="text-xs"><Settings className="w-3 h-3 mr-1" /> SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4"><div><VisualEmailComposer /></div></TabsContent>
        <TabsContent value="campaigns" className="mt-4"><div><CampaignsManager /></div></TabsContent>
        <TabsContent value="contacts" className="mt-4"><div><ContactsManager /></div></TabsContent>
        <TabsContent value="templates" className="mt-4"><div><TemplatesManager /></div></TabsContent>
        <TabsContent value="smtp" className="mt-4"><div><SmtpSettings /></div></TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManager;
