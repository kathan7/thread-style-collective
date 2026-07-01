import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, BarChart3, CheckSquare, Users, FileText, Check, X, Building, Plus, Sparkles, FolderPlus } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Moderator Dashboard — THREADMARKET" },
    ],
  }),
  component: AdminDashboard,
});

type TabType = "overview" | "vetting" | "sellers" | "categories" | "transactions";
type VettingSubTabType = "products" | "sellers";

function AdminDashboard() {
  const { 
    currentUser, 
    products, 
    approveProduct, 
    rejectProduct, 
    sellers, 
    approveSeller,
    rejectSeller,
    categories,
    addCategory,
    orders, 
    logout 
  } = useMarketplace();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [vettingSubTab, setVettingSubTab] = useState<VettingSubTabType>("products");

  // Category Form State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  // Redirect if wrong role
  if (!currentUser) {
    navigate({ to: "/auth" });
    return null;
  }
  if (currentUser.role !== "admin") {
    navigate({ to: `/dashboard/${currentUser.role}` });
    return null;
  }

  // Filter pending/approved products
  const pendingProducts = products.filter((p) => p.status === "pending");
  const approvedProducts = products.filter((p) => p.status === "approved");

  // Filter pending/approved sellers
  const pendingSellers = sellers.filter((s) => s.status === "pending");
  const approvedSellers = sellers.filter((s) => s.status === "approved");

  // Analytics
  const totalVolume = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = orders.reduce((sum, o) => sum + o.commissionPaid, 0);

  const handleApproveProduct = (id: string, name: string) => {
    approveProduct(id);
    toast.success(`"${name}" approved. Added to shop catalog.`);
  };

  const handleRejectProduct = (id: string, name: string) => {
    rejectProduct(id);
    toast.error(`"${name}" listing rejected.`);
  };

  const handleApproveSeller = (slug: string, name: string) => {
    approveSeller(slug);
    toast.success(`Atelier "${name}" approved. Storefront is now live.`);
  };

  const handleRejectSeller = (slug: string, name: string) => {
    rejectSeller(slug);
    toast.error(`Atelier "${name}" registration rejected.`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    const imageUrl = newCatImage.trim() || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400";
    addCategory(newCatName, imageUrl);
    toast.success(`Category "${newCatName}" added successfully.`);
    setNewCatName("");
    setNewCatImage("");
    setShowAddCategory(false);
  };

  const handleLogOut = () => {
    logout();
    toast.success("Successfully logged out.");
    navigate({ to: "/" });
  };

  const pendingVettingCount = pendingProducts.length + pendingSellers.length;

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-ink/5 pb-8 mb-10">
          <div>
            <p className="eyebrow text-muted-foreground">Moderator Console</p>
            <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mt-2 flex items-center gap-3">
              <ShieldCheck className="size-8 text-ink" strokeWidth={1.5} />
              <span>Admin Center</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Platform commissions set at <span className="font-bold text-ink">15%</span></p>
          </div>
          <button
            onClick={handleLogOut}
            className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 text-red-600 px-6 text-[11px] font-semibold uppercase tracking-widest hover:bg-red-50/50 transition cursor-pointer"
          >
            Log Out Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Side Menu */}
          <div className="lg:col-span-3">
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto border-b lg:border-b-0 border-ink/5 pb-2 lg:pb-0">
              {[
                { type: "overview", label: "Platform Overview", icon: BarChart3 },
                { type: "vetting", label: `Verification Deck (${pendingVettingCount})`, icon: CheckSquare },
                { type: "sellers", label: "Approved Ateliers", icon: Building },
                { type: "categories", label: "Category Registry", icon: FolderPlus },
                { type: "transactions", label: "Platform Ledger", icon: FileText },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.type;
                return (
                  <button
                    key={t.type}
                    onClick={() => setActiveTab(t.type as TabType)}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg text-left transition whitespace-nowrap cursor-pointer ${
                      active ? "bg-ink text-bone" : "text-muted-foreground hover:text-ink hover:bg-paper/50"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <h2 className="font-display text-2xl font-medium">Platform Performance Index</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl">
                      <p className="eyebrow text-[9px] text-muted-foreground">Volume Cleared</p>
                      <p className="font-display text-2xl font-semibold mt-2">${totalVolume.toLocaleString()}</p>
                    </div>
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl ring-2 ring-ink/5">
                      <p className="eyebrow text-[9px] text-ink font-semibold">Commissions Earned</p>
                      <p className="font-display text-2xl font-semibold mt-2 text-emerald-700">${totalCommission.toLocaleString()}</p>
                    </div>
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl">
                      <p className="eyebrow text-[9px] text-muted-foreground">Live Ateliers</p>
                      <p className="font-display text-2xl font-semibold mt-2">{approvedSellers.length}</p>
                    </div>
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl">
                      <p className="eyebrow text-[9px] text-muted-foreground">Approved Pieces</p>
                      <p className="font-display text-2xl font-semibold mt-2">{approvedProducts.length} items</p>
                    </div>
                  </div>

                  {/* Vetting Alerts */}
                  {pendingVettingCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200/50 p-6 rounded-xl flex items-center justify-between gap-6">
                      <div>
                        <h4 className="text-amber-800 font-semibold text-sm font-sans">Vetting deck backlog detected</h4>
                        <p className="text-xs text-amber-700/80 mt-1">
                          You have {pendingProducts.length} products and {pendingSellers.length} sellers waiting for vetting. Review and push them live to the marketplace.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("vetting")}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-amber-800 text-bone px-5 text-[10px] font-semibold uppercase tracking-wider hover:opacity-90 transition cursor-pointer shrink-0"
                      >
                        Vetting Queue
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "vetting" && (
                <div className="space-y-6">
                  <h2 className="font-display text-2xl font-medium">Verification queue</h2>
                  
                  {/* Subtabs selection */}
                  <div className="flex gap-4 border-b border-ink/5 pb-2">
                    <button
                      onClick={() => setVettingSubTab("products")}
                      className={`text-xs font-semibold uppercase tracking-wider pb-2 transition-colors cursor-pointer ${
                        vettingSubTab === "products" ? "text-ink border-b border-ink" : "text-muted-foreground hover:text-ink"
                      }`}
                    >
                      Products ({pendingProducts.length})
                    </button>
                    <button
                      onClick={() => setVettingSubTab("sellers")}
                      className={`text-xs font-semibold uppercase tracking-wider pb-2 transition-colors cursor-pointer ${
                        vettingSubTab === "sellers" ? "text-ink border-b border-ink" : "text-muted-foreground hover:text-ink"
                      }`}
                    >
                      Ateliers ({pendingSellers.length})
                    </button>
                  </div>

                  {vettingSubTab === "products" ? (
                    <div className="bg-paper border border-ink/5 rounded-xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-ink/5 bg-bone/45 text-muted-foreground uppercase tracking-widest text-[9px] font-bold">
                              <th className="p-4">Piece Detail</th>
                              <th className="p-4">Origin Atelier</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Price</th>
                              <th className="p-4 text-right">Moderation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink/5">
                            {pendingProducts.map((p) => (
                              <tr key={p.id} className="hover:bg-bone/20">
                                <td className="p-4 flex items-center gap-3">
                                  <div className="size-11 overflow-hidden rounded bg-bone border border-ink/5">
                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                  </div>
                                  <span className="font-semibold text-ink">{p.name}</span>
                                </td>
                                <td className="p-4 text-muted-foreground font-semibold">{p.seller}</td>
                                <td className="p-4 text-muted-foreground">{p.category}</td>
                                <td className="p-4 font-mono text-ink">${p.price.toLocaleString()}</td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => handleApproveProduct(p.id, p.name)}
                                      className="size-8 inline-flex items-center justify-center rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                                      aria-label="Approve Product"
                                    >
                                      <Check className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRejectProduct(p.id, p.name)}
                                      className="size-8 inline-flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-800 transition cursor-pointer"
                                      aria-label="Reject Product"
                                    >
                                      <X className="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {pendingProducts.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                  No product listings awaiting approval.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-paper border border-ink/5 rounded-xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-ink/5 bg-bone/45 text-muted-foreground uppercase tracking-widest text-[9px] font-bold">
                              <th className="p-4">Brand / Atelier</th>
                              <th className="p-4">Initials</th>
                              <th className="p-4">City</th>
                              <th className="p-4">Short Biography</th>
                              <th className="p-4 text-right">Moderation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink/5">
                            {pendingSellers.map((s) => (
                              <tr key={s.slug} className="hover:bg-bone/20">
                                <td className="p-4 flex items-center gap-3">
                                  <div className="size-9 overflow-hidden rounded-full bg-ink text-bone font-display grid place-items-center font-semibold text-xs shrink-0">
                                    {s.initials}
                                  </div>
                                  <span className="font-semibold text-ink truncate max-w-[150px]">{s.name}</span>
                                </td>
                                <td className="p-4 font-mono font-medium text-muted-foreground">{s.initials}</td>
                                <td className="p-4 font-semibold text-muted-foreground">{s.city}</td>
                                <td className="p-4 text-muted-foreground max-w-xs truncate">{s.bio}</td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => handleApproveSeller(s.slug, s.name)}
                                      className="size-8 inline-flex items-center justify-center rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                                      aria-label="Approve Atelier"
                                    >
                                      <Check className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRejectSeller(s.slug, s.name)}
                                      className="size-8 inline-flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-800 transition cursor-pointer"
                                      aria-label="Reject Atelier"
                                    >
                                      <X className="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {pendingSellers.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                  No design ateliers awaiting registration verification.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "sellers" && (
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">Registered Brand Ateliers</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedSellers.map((s) => (
                      <div key={s.slug} className="bg-paper border border-ink/5 p-5 rounded-xl flex gap-4 shadow-xs">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-bone font-display text-lg">
                          {s.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-semibold truncate text-ink">{s.name}</h4>
                            <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
                              Live
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.city} · ★ {s.rating}</p>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.bio}</p>
                          <div className="mt-4 pt-3 border-t border-ink/5 flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            <span>{s.productCount} Pieces</span>
                            <span>{s.followers} Followers</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "categories" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl font-medium">Marketplace Category Registry</h2>
                    <button
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="inline-flex h-9 items-center justify-center rounded-full bg-ink px-4 text-[11px] font-semibold uppercase tracking-wider text-bone gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>{showAddCategory ? "Cancel" : "Add Category"}</span>
                    </button>
                  </div>

                  {showAddCategory && (
                    <form onSubmit={handleAddCategory} className="bg-paper border border-ink/5 rounded-xl p-5 md:p-6 mb-6 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="size-4 text-ink" />
                        <h3 className="text-xs uppercase font-bold tracking-wider">New Category Setup</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Category Title</label>
                          <input
                            type="text"
                            required
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="e.g. Knitwear, Jewelry"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Banner Image URL</label>
                          <input
                            type="url"
                            value={newCatImage}
                            onChange={(e) => setNewCatImage(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/photo-..."
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone mt-2 cursor-pointer"
                      >
                        Register Category
                      </button>
                    </form>
                  )}

                  {/* Categories Grid List */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((c) => (
                      <div key={c.slug} className="bg-paper border border-ink/5 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-xs">
                        <div className="size-16 rounded-lg overflow-hidden bg-bone border border-ink/5 mb-3">
                          <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">{c.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">{c.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">Marketplace Ledger</h2>

                  <div className="bg-paper border border-ink/5 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-ink/5 bg-bone/45 text-muted-foreground uppercase tracking-widest text-[9px] font-bold">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Collector</th>
                            <th className="p-4">Total volume</th>
                            <th className="p-4 text-right">Commission Cut (15%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                          {orders.map((o) => (
                            <tr key={o.id} className="hover:bg-bone/20">
                              <td className="p-4 font-mono font-semibold text-ink">{o.id}</td>
                              <td className="p-4 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-muted-foreground font-semibold">{o.customerName}</td>
                              <td className="p-4 font-mono text-ink">${o.total.toLocaleString()}</td>
                              <td className="p-4 font-mono text-emerald-700 text-right font-semibold">${o.commissionPaid.toLocaleString()}</td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                Ledger empty. No sales transacted.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
