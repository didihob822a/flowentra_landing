import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, Receipt, CreditCard, Edit2, Check, X,
  FileText, Download, DollarSign, Users, TrendingUp,
} from "lucide-react";

// ==================== TYPES ====================

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "monthly" | "yearly" | "one-time";
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issuedDate: string;
  dueDate: string;
  items: { description: string; qty: number; unitPrice: number }[];
}

// ==================== LOCAL STORAGE HELPERS ====================

const PLANS_KEY = "flowentra_pricing_plans";
const INVOICES_KEY = "flowentra_invoices";

function loadPlans(): PricingPlan[] {
  try {
    const stored = localStorage.getItem(PLANS_KEY);
    return stored ? JSON.parse(stored) : getDefaultPlans();
  } catch {
    return getDefaultPlans();
  }
}

function savePlans(plans: PricingPlan[]) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

function loadInvoices(): Invoice[] {
  try {
    const stored = localStorage.getItem(INVOICES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

function getDefaultPlans(): PricingPlan[] {
  return [
    { id: "1", name: "Starter", price: 49, currency: "TND", interval: "monthly", features: ["CRM & Contacts", "Email & Notifications", "5 Users", "Basic Support"], isPopular: false, isActive: true },
    { id: "2", name: "Professional", price: 149, currency: "TND", interval: "monthly", features: ["All Starter features", "Workflow Engine", "Analytics", "Website Builder", "25 Users", "Priority Support"], isPopular: true, isActive: true },
    { id: "3", name: "Enterprise", price: 349, currency: "TND", interval: "monthly", features: ["All Professional features", "Smart Assistant", "Dispatcher & Field Ops", "Stock & Inventory", "Unlimited Users", "Dedicated Account Manager"], isPopular: false, isActive: true },
  ];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateInvoiceNumber() {
  const now = new Date();
  const yr = now.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${yr}-${seq}`;
}

// ==================== COMPONENT ====================

type Tab = "plans" | "invoices";

const PricingManager = () => {
  const [tab, setTab] = useState<Tab>("plans");
  const [plans, setPlans] = useState<PricingPlan[]>(loadPlans());
  const [invoices, setInvoices] = useState<Invoice[]>(loadInvoices());
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  // ---- Plans ----

  const addPlan = () => {
    const newPlan: PricingPlan = {
      id: generateId(),
      name: "New Plan",
      price: 0,
      currency: "TND",
      interval: "monthly",
      features: [],
      isPopular: false,
      isActive: true,
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    savePlans(updated);
    setEditingPlan(newPlan.id);
  };

  const updatePlan = (id: string, updates: Partial<PricingPlan>) => {
    const updated = plans.map(p => p.id === id ? { ...p, ...updates } : p);
    setPlans(updated);
    savePlans(updated);
  };

  const deletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    savePlans(updated);
    toast.success("Plan deleted");
  };

  // ---- Invoices ----

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientName: "",
    clientEmail: "",
    plan: "",
    currency: "TND",
    status: "draft",
    items: [{ description: "", qty: 1, unitPrice: 0 }],
  });

  const createInvoice = () => {
    const items = (newInvoice.items || []).filter(i => i.description.trim());
    const amount = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      clientName: newInvoice.clientName || "Client",
      clientEmail: newInvoice.clientEmail || "",
      plan: newInvoice.plan || "Custom",
      amount,
      currency: newInvoice.currency || "TND",
      status: "draft",
      issuedDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      items,
    };
    const updated = [invoice, ...invoices];
    setInvoices(updated);
    saveInvoices(updated);
    setShowNewInvoice(false);
    setNewInvoice({ clientName: "", clientEmail: "", plan: "", currency: "TND", status: "draft", items: [{ description: "", qty: 1, unitPrice: 0 }] });
    toast.success(`Invoice ${invoice.invoiceNumber} created`);
  };

  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    setInvoices(updated);
    saveInvoices(updated);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    saveInvoices(updated);
    toast.success("Invoice deleted");
  };

  const exportInvoice = (inv: Invoice) => {
    const lines = [
      `INVOICE: ${inv.invoiceNumber}`,
      `Date: ${inv.issuedDate}  |  Due: ${inv.dueDate}`,
      `Client: ${inv.clientName} (${inv.clientEmail})`,
      `Plan: ${inv.plan}`,
      "",
      "Items:",
      ...inv.items.map(i => `  - ${i.description}: ${i.qty} × ${i.unitPrice} ${inv.currency} = ${i.qty * i.unitPrice} ${inv.currency}`),
      "",
      `Total: ${inv.amount} ${inv.currency}`,
      `Status: ${inv.status.toUpperCase()}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Stats ----
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-500/10 text-blue-600",
    paid: "bg-green-500/10 text-green-600",
    overdue: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground line-through",
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Plans</p>
              <p className="text-xl font-bold">{plans.filter(p => p.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Paid Revenue</p>
              <p className="text-xl font-bold">{totalRevenue.toLocaleString()} TND</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold">{pendingAmount.toLocaleString()} TND</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
        {[
          { key: "plans" as Tab, label: "Pricing Plans", icon: CreditCard },
          { key: "invoices" as Tab, label: "Invoices", icon: Receipt },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ==================== PLANS TAB ==================== */}
      {tab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Manage your pricing plans. Changes are saved automatically.</p>
            <button onClick={addPlan} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="w-3.5 h-3.5" /> Add Plan
            </button>
          </div>

          {plans.map(plan => (
            <div key={plan.id} className={`bg-card border rounded-xl p-5 transition-all ${plan.isPopular ? "border-primary/30 shadow-sm" : "border-border"} ${!plan.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {editingPlan === plan.id ? (
                    <input
                      type="text"
                      value={plan.name}
                      onChange={e => updatePlan(plan.id, { name: e.target.value })}
                      className="text-lg font-bold bg-transparent border-b border-primary focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  )}
                  {plan.isPopular && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Popular</span>}
                  {!plan.isActive && <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {editingPlan === plan.id ? <Check className="w-4 h-4 text-green-600" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingPlan === plan.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Price</label>
                      <input type="number" value={plan.price} onChange={e => updatePlan(plan.id, { price: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Currency</label>
                      <input type="text" value={plan.currency} onChange={e => updatePlan(plan.id, { currency: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Interval</label>
                      <select value={plan.interval} onChange={e => updatePlan(plan.id, { interval: e.target.value as PricingPlan["interval"] })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={plan.isPopular} onChange={e => updatePlan(plan.id, { isPopular: e.target.checked })} className="rounded" />
                      Mark as popular
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={plan.isActive} onChange={e => updatePlan(plan.id, { isActive: e.target.checked })} className="rounded" />
                      Active
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Features (one per line)</label>
                    <textarea
                      value={plan.features.join("\n")}
                      onChange={e => updatePlan(plan.id, { features: e.target.value.split("\n") })}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.currency}/{plan.interval === "one-time" ? "once" : plan.interval === "yearly" ? "year" : "month"}</span>
                  <span className="text-xs text-muted-foreground ml-4">• {plan.features.length} features</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ==================== INVOICES TAB ==================== */}
      {tab === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</p>
            <button onClick={() => setShowNewInvoice(!showNewInvoice)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              {showNewInvoice ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showNewInvoice ? "Cancel" : "New Invoice"}
            </button>
          </div>

          {/* New Invoice Form */}
          {showNewInvoice && (
            <div className="bg-card border border-primary/20 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Create Invoice</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Client Name</label>
                  <input type="text" value={newInvoice.clientName} onChange={e => setNewInvoice(p => ({ ...p, clientName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Client Email</label>
                  <input type="email" value={newInvoice.clientEmail} onChange={e => setNewInvoice(p => ({ ...p, clientEmail: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="email@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Plan</label>
                  <select value={newInvoice.plan} onChange={e => setNewInvoice(p => ({ ...p, plan: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Custom</option>
                    {plans.filter(p => p.isActive).map(p => <option key={p.id} value={p.name}>{p.name} — {p.price} {p.currency}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Currency</label>
                  <input type="text" value={newInvoice.currency} onChange={e => setNewInvoice(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Line Items</label>
                {(newInvoice.items || []).map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                    <input type="text" value={item.description} onChange={e => {
                      const items = [...(newInvoice.items || [])];
                      items[idx] = { ...items[idx], description: e.target.value };
                      setNewInvoice(p => ({ ...p, items }));
                    }} placeholder="Description" className="col-span-6 px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input type="number" value={item.qty} onChange={e => {
                      const items = [...(newInvoice.items || [])];
                      items[idx] = { ...items[idx], qty: +e.target.value };
                      setNewInvoice(p => ({ ...p, items }));
                    }} placeholder="Qty" className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input type="number" value={item.unitPrice} onChange={e => {
                      const items = [...(newInvoice.items || [])];
                      items[idx] = { ...items[idx], unitPrice: +e.target.value };
                      setNewInvoice(p => ({ ...p, items }));
                    }} placeholder="Price" className="col-span-3 px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button onClick={() => {
                      const items = (newInvoice.items || []).filter((_, i) => i !== idx);
                      setNewInvoice(p => ({ ...p, items }));
                    }} className="col-span-1 flex items-center justify-center text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setNewInvoice(p => ({ ...p, items: [...(p.items || []), { description: "", qty: 1, unitPrice: 0 }] }))} className="text-xs text-primary hover:underline">
                  + Add line item
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm font-bold">
                  Total: {(newInvoice.items || []).reduce((s, i) => s + i.qty * i.unitPrice, 0).toLocaleString()} {newInvoice.currency}
                </p>
                <button onClick={createInvoice} disabled={!newInvoice.clientName?.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">
                  <Save className="w-4 h-4" /> Create Invoice
                </button>
              </div>
            </div>
          )}

          {/* Invoice List */}
          {invoices.length === 0 && !showNewInvoice && (
            <div className="text-center py-16 text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Create your first invoice to get started</p>
            </div>
          )}

          {invoices.map(inv => (
            <div key={inv.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold font-mono">{inv.invoiceNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inv.clientName} • {inv.clientEmail}</p>
                </div>
                <div className="flex items-center gap-1">
                  <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value as Invoice["status"])} className="text-[10px] px-2 py-1 rounded border border-border bg-background focus:outline-none">
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => exportInvoice(inv)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span>Plan: <span className="font-medium text-foreground">{inv.plan}</span></span>
                <span>Amount: <span className="font-bold text-foreground">{inv.amount.toLocaleString()} {inv.currency}</span></span>
                <span>Issued: {inv.issuedDate}</span>
                <span>Due: {inv.dueDate}</span>
                <span>{inv.items.length} item{inv.items.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingManager;
