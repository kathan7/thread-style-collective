import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, BarChart3, Package, ShoppingCart, Settings, ShieldAlert, ArrowUpRight, Upload, Sparkles, Trash2, Check, Clock } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/seller")({
  head: () => ({
    meta: [
      { title: "Atelier Dashboard — THREADMARKET" },
    ],
  }),
  component: SellerDashboard,
});

type TabType = "overview" | "inventory" | "orders" | "settings";

function SellerDashboard() {
  const { 
    currentUser, 
    products, 
    addSellerProduct, 
    deleteProduct,
    sellers, 
    updateSellerSettings, 
    orders, 
    updateOrderStatus,
    logout 
  } = useMarketplace();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Form states for new product
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("Women");
  const [prodTag, setProdTag] = useState("");
  const [prodImage, setProdImage] = useState("");

  // Redirect if wrong role
  if (!currentUser) {
    navigate({ to: "/auth" });
    return null;
  }
  if (currentUser.role !== "seller") {
    navigate({ to: `/dashboard/${currentUser.role}` });
    return null;
  }

  // Get active seller details
  const storeSlug = currentUser.storeSlug || "studio-monolith";
  const seller = sellers.find((s) => s.slug === storeSlug) || sellers[0];

  // Settings states
  const [storeBio, setStoreBio] = useState(seller?.bio || "");
  const [storeBanner, setStoreBanner] = useState(seller?.banner || "");

  // Filter products belonging to this seller
  const sellerProducts = products.filter((p) => p.sellerSlug === storeSlug);

  // Filter orders containing items from this seller
  const sellerOrders = orders.filter((order) => 
    order.items.some((item) => item.sellerSlug === storeSlug)
  );

  // Calculate seller financial metrics
  let totalGross = 0;
  let totalCommissions = 0;
  let totalNet = 0;
  let itemsSold = 0;

  orders.forEach((order) => {
    // Only count orders that aren't cancelled
    if (order.status !== "cancelled") {
      order.items.forEach((item) => {
        if (item.sellerSlug === storeSlug) {
          const itemGross = item.price * item.quantity;
          totalGross += itemGross;
          totalCommissions += itemGross * 0.15; // 15% marketplace cut
          itemsSold += item.quantity;
        }
      });
    }
  });
  totalNet = totalGross - totalCommissions;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      toast.error("Product name and price are required.");
      return;
    }

    const fallbackImage = prodImage.trim() || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600";

    addSellerProduct({
      name: prodName,
      price: parseFloat(prodPrice),
      category: prodCategory,
      tag: prodTag || undefined,
      image: fallbackImage,
      seller: seller.name,
      sellerSlug: storeSlug,
    });

    toast.success("Piece submitted. Pending Moderator vetting.");
    
    setProdName("");
    setProdPrice("");
    setProdCategory("Women");
    setProdTag("");
    setProdImage("");
    setShowAddProduct(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from your storefront inventory?`)) {
      deleteProduct(id);
      toast.success(`"${name}" deleted successfully.`);
    }
  };

  const handleUpdateStatus = (orderId: string, status: typeof orders[number]["status"]) => {
    updateOrderStatus(orderId, status);
    toast.success(`Fulfillment updated: Order marked as ${status}.`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSellerSettings(storeSlug, {
      bio: storeBio,
      banner: storeBanner,
    });
    toast.success("Atelier storefront configurations updated.");
  };

  const handleLogOut = () => {
    logout();
    toast.success("Successfully logged out.");
    navigate({ to: "/" });
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Banner Section */}
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-ink/5 mb-8">
          <img src={seller.banner} alt={seller.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
          <div className="absolute bottom-6 left-6 text-bone flex items-end gap-4">
            <div className="grid size-16 place-items-center rounded-full border-4 border-bone bg-ink text-bone font-display text-xl">
              {seller.initials}
            </div>
            <div>
              <p className="eyebrow text-bone/70 text-[9.5px]">
                {seller.status === "approved" ? "Verified Atelier Storefront" : "Storefront Awaiting Approval"}
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight mt-0.5">{seller.name}</h1>
            </div>
          </div>
          <button
            onClick={handleLogOut}
            className="absolute top-4 right-4 bg-bone/90 hover:bg-bone text-ink rounded-full px-5 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {seller.status !== "approved" && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs flex items-center gap-3">
            <ShieldAlert className="size-5 shrink-0 text-amber-800" />
            <p>
              <strong>Storefront Registration Pending Approval</strong>: Your atelier credentials are being reviewed by moderators. You can configure store settings and submit new pieces, but your storefront and catalog will remain invisible to shoppers until approved.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Side Menu */}
          <div className="lg:col-span-3">
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto border-b lg:border-b-0 border-ink/5 pb-2 lg:pb-0">
              {[
                { type: "overview", label: "Financial Stats", icon: BarChart3 },
                { type: "inventory", label: "Piece Inventory", icon: Package },
                { type: "orders", label: `Order Manager (${sellerOrders.filter(o => o.status !== "delivered").length})`, icon: ShoppingCart },
                { type: "settings", label: "Store Settings", icon: Settings },
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
                  <h2 className="font-display text-2xl font-medium">Atelier performance report</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl">
                      <p className="eyebrow text-[9px] text-muted-foreground">Gross Revenue</p>
                      <p className="font-display text-2xl font-semibold mt-2">${totalGross.toLocaleString()}</p>
                    </div>
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl">
                      <p className="eyebrow text-[9px] text-muted-foreground">Marketplace Cut (15%)</p>
                      <p className="font-display text-2xl font-semibold mt-2 text-muted-foreground">${totalCommissions.toLocaleString()}</p>
                    </div>
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl ring-2 ring-ink/5">
                      <p className="eyebrow text-[9px] text-ink font-semibold">Net Earnings</p>
                      <p className="font-display text-2xl font-semibold mt-2 text-emerald-700">${totalNet.toLocaleString()}</p>
                    </div>
                    <div className="bg-paper border border-ink/5 p-5 rounded-xl">
                      <p className="eyebrow text-[9px] text-muted-foreground">Followers</p>
                      <p className="font-display text-2xl font-semibold mt-2">{seller.followers}</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-paper border border-ink/5 p-6 rounded-xl flex flex-col justify-between">
                      <div>
                        <p className="eyebrow text-[9px] text-muted-foreground">Inventory Scope</p>
                        <h3 className="font-display text-xl font-medium mt-3">Dynamic listings scale.</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          You have {sellerProducts.length} pieces registered, of which {sellerProducts.filter((p) => p.status === "approved").length} are approved and visible on public storefront catalogs.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("inventory")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink mt-6 hover:underline"
                      >
                        <span>Manage inventory</span>
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    </div>

                    <div className="bg-paper border border-ink/5 p-6 rounded-xl flex flex-col justify-between">
                      <div>
                        <p className="eyebrow text-[9px] text-muted-foreground">Order Dispatch</p>
                        <h3 className="font-display text-xl font-medium mt-3">Fulfilled items counter.</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          You have shipped {itemsSold} objects of modern luxury through this platform since registration, across {sellerOrders.length} customer checkpoints.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("orders")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink mt-6 hover:underline"
                      >
                        <span>Dispatched registry</span>
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl font-medium">Catalog Listings</h2>
                    <button
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="inline-flex h-9 items-center justify-center rounded-full bg-ink text-bone px-4 text-[11px] font-semibold uppercase tracking-wider text-bone gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>{showAddProduct ? "Cancel" : "Submit Listing"}</span>
                    </button>
                  </div>

                  {showAddProduct && (
                    <form onSubmit={handleAddProduct} className="bg-paper border border-ink/5 rounded-xl p-5 md:p-6 mb-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="size-4 text-ink" />
                        <h3 className="text-xs uppercase font-bold tracking-wider">New Piece Submission</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Piece Name</label>
                          <input
                            type="text"
                            required
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            placeholder="e.g. Asymmetrical Drape Dress"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Retail Price ($ USD)</label>
                          <input
                            type="number"
                            required
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            placeholder="e.g. 850"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Category Intent</label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition font-sans"
                          >
                            <option value="Women">Women</option>
                            <option value="Men">Men</option>
                            <option value="Streetwear">Streetwear</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Footwear">Footwear</option>
                            <option value="Jewelry">Jewelry</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Highlight Tag (Optional)</label>
                          <input
                            type="text"
                            value={prodTag}
                            onChange={(e) => setProdTag(e.target.value)}
                            placeholder="e.g. Limited, New"
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Image URL Address</label>
                          <input
                            type="url"
                            value={prodImage}
                            onChange={(e) => setProdImage(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/photo-..."
                            className="w-full h-10 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Leave empty to auto-assign a professional editorial model placeholder.</p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone mt-2 cursor-pointer"
                      >
                        Submit Piece For Approval
                      </button>
                    </form>
                  )}

                  {/* Listings Catalog */}
                  <div className="bg-paper border border-ink/5 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-ink/5 bg-bone/45 text-muted-foreground uppercase tracking-widest text-[9px] font-bold">
                            <th className="p-4">Piece</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Retail Price</th>
                            <th className="p-4">Vetting Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                          {sellerProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-bone/20">
                              <td className="p-4 flex items-center gap-3">
                                <div className="size-10 overflow-hidden rounded bg-bone border border-ink/5">
                                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                </div>
                                <span className="font-semibold text-ink">{p.name}</span>
                              </td>
                              <td className="p-4 text-muted-foreground font-semibold">{p.category}</td>
                              <td className="p-4 font-mono text-ink">${p.price.toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  p.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1 text-muted-foreground hover:text-red-600 transition cursor-pointer"
                                  aria-label="Delete listing"
                                >
                                  <Trash2 className="size-4.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {sellerProducts.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No objects submitted to the archive catalog.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">Customer Purchases</h2>

                  <div className="space-y-4">
                    {sellerOrders.map((order) => {
                      const storeItems = order.items.filter((item) => item.sellerSlug === storeSlug);
                      const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      
                      return (
                        <div key={order.id} className="bg-paper border border-ink/5 rounded-xl p-5 md:p-6 space-y-4 shadow-xs">
                          <div className="flex justify-between items-start flex-wrap gap-4 border-b border-ink/5 pb-3.5">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Order Reference</p>
                              <p className="font-mono text-sm font-semibold mt-0.5">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Placed On</p>
                              <p className="text-xs font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Shipping Destination</p>
                              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                {order.shippingAddress.name} · {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold text-ink">Gross Split</p>
                              <p className="font-display text-base font-semibold mt-0.5">${storeTotal.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            {storeItems.map((item, i) => (
                              <div key={i} className="flex gap-3 justify-between items-center text-xs">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 overflow-hidden rounded bg-bone">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-ink">{item.name}</h4>
                                    <p className="text-muted-foreground text-[10px] mt-0.5">Size {item.size} · Color {item.color} · Qty {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-display font-medium text-ink/70">${(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {/* Fulfillment Actions panel */}
                          <div className="border-t border-ink/5 pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Fulfillment:</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                                order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              {order.status === "pending" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "shipped")}
                                  className="inline-flex h-8 items-center rounded-full bg-ink px-4 text-[10px] font-semibold uppercase tracking-wider text-bone hover:opacity-90 transition cursor-pointer"
                                >
                                  Dispatch Cargo (Ship)
                                </button>
                              )}
                              {order.status === "shipped" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "delivered")}
                                  className="inline-flex h-8 items-center rounded-full bg-emerald-700 px-4 text-[10px] font-semibold uppercase tracking-wider text-bone hover:bg-emerald-800 transition cursor-pointer"
                                >
                                  Confirm Delivery
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {sellerOrders.length === 0 && (
                      <div className="text-center py-16 bg-paper rounded-xl border border-ink/5">
                        <ShoppingCart className="size-8 text-muted-foreground/45 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="font-display text-lg font-medium">No sales recorded.</p>
                        <p className="text-xs text-muted-foreground mt-1">Purchases by collectors will generate orders here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">Atelier configuration</h2>
                  <form onSubmit={handleSaveSettings} className="bg-paper border border-ink/5 p-6 rounded-xl space-y-5 shadow-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Brand Biography</label>
                      <textarea
                        required
                        rows={4}
                        value={storeBio}
                        onChange={(e) => setStoreBio(e.target.value)}
                        placeholder="Describe your design ethos..."
                        className="w-full p-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition font-sans leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Brand Shop Banner Image URL</label>
                      <div className="relative">
                        <input
                          type="url"
                          required
                          value={storeBanner}
                          onChange={(e) => setStoreBanner(e.target.value)}
                          className="w-full h-11 px-4 rounded-md border border-ink/10 bg-bone text-sm focus:outline-none focus:border-ink transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone mt-2 cursor-pointer"
                    >
                      Save Store Configurations
                    </button>
                  </form>
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
