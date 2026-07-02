import { useState, useEffect, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck, BarChart3, Package, Users, TrendingUp,
  ChevronRight, RefreshCw, Plus, AlertTriangle,
  DollarSign, ShoppingCart, Loader2, Search, Boxes, LogOut,
} from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiFetch, formatPrice } from "../lib/api";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin — THREADMARKET" }] }),
  component: AdminDashboard,
});

type TabType = "dashboard" | "orders" | "products" | "stock" | "customers";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-gray-100 text-gray-700",
  archived: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-white border border-ink/5 rounded-xl p-5 flex items-start gap-4">
      <div className={`size-10 rounded-lg grid place-items-center shrink-0 ${accent}`}>{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
        <p className="font-display text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
}

function DashboardTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/api/admin/dashboard")
      .then(setData)
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-medium">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingCart className="size-5" />} label="Today's Orders" value={data?.todayOrders ?? 0} accent="bg-blue-50 text-blue-700" />
        <StatCard icon={<DollarSign className="size-5" />} label="Today's Revenue" value={formatPrice(data?.todayRevenue ?? 0)} accent="bg-emerald-50 text-emerald-700" />
        <StatCard icon={<Users className="size-5" />} label="Customers" value={data?.totalCustomers ?? 0} accent="bg-violet-50 text-violet-700" />
        <StatCard icon={<AlertTriangle className="size-5" />} label="Low Stock" value={data?.lowStockAlerts?.length ?? 0} accent="bg-red-50 text-red-700" />
      </div>
      {data?.lowStockAlerts?.length > 0 && (
        <div className="bg-white border border-ink/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-ink/5 flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-gray-50 text-muted-foreground uppercase text-[9px]"><th className="p-3 text-left">Product</th><th className="p-3 text-left">SKU</th><th className="p-3 text-right">Stock</th></tr></thead>
            <tbody>
              {data.lowStockAlerts.map((item: any) => (
                <tr key={item.id} className="border-b border-ink/5">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 font-mono text-muted-foreground">{item.sku}</td>
                  <td className={`p-3 text-right font-bold ${item.stock_quantity <= 3 ? "text-red-600" : "text-amber-600"}`}>{item.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.todayOrders === 0 && data?.totalProducts === 0 && (
        <div className="bg-white border border-ink/5 rounded-xl p-10 text-center">
          <TrendingUp className="size-10 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">Get started by adding products with stock in the Products tab.</p>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    apiFetch<any[]>("/api/admin/orders")
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/api/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      toast.success(`Order updated to ${status}`);
      fetchOrders();
      if (selectedOrder?.id === id) {
        const detail = await apiFetch(`/api/admin/orders/${id}`);
        setSelectedOrder(detail);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = orders.filter((o) =>
    !searchQuery ||
    o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  if (selectedOrder) {
    const statuses = ["paid", "processing", "shipped", "delivered", "cancelled"];
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedOrder(null)} className="text-xs uppercase font-semibold text-muted-foreground hover:text-ink cursor-pointer">← Back</button>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium flex items-center gap-3">
              {selectedOrder.order_number} <StatusBadge status={selectedOrder.status} />
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customer: <strong>{selectedOrder.user_name}</strong> ({selectedOrder.user_email})
            </p>
            <p className="text-xs text-muted-foreground">{new Date(selectedOrder.placed_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.filter((s) => s !== selectedOrder.status).map((s) => (
              <button key={s} onClick={() => updateStatus(selectedOrder.id, s)} className="h-8 px-4 rounded-full border text-[10px] font-semibold uppercase hover:bg-gray-50 cursor-pointer">
                Mark {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Subtotal", val: formatPrice(selectedOrder.subtotal) },
            { label: "Shipping", val: formatPrice(selectedOrder.shipping_fee) },
            { label: "Tax", val: formatPrice(selectedOrder.tax) },
            { label: "Total", val: formatPrice(selectedOrder.total), bold: true },
          ].map((m) => (
            <div key={m.label} className={`bg-white border rounded-lg p-3 ${m.bold ? "ring-2 ring-ink/10" : ""}`}>
              <p className="text-[9px] uppercase text-muted-foreground font-bold">{m.label}</p>
              <p className="font-mono text-sm mt-1 font-semibold">{m.val}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-gray-50 uppercase text-[9px] text-muted-foreground"><th className="p-3 text-left">Item</th><th className="p-3">Qty</th><th className="p-3 text-right">Subtotal</th></tr></thead>
            <tbody>
              {selectedOrder.items?.map((item: any) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.product_name_snapshot}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right font-mono">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedOrder.shipping_address && (
          <div className="bg-white border rounded-xl p-4 text-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Ship To</p>
            <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
            <p className="text-muted-foreground">{selectedOrder.shipping_address.line1}</p>
            <p className="text-muted-foreground">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-medium">Orders</h2>
        <button onClick={fetchOrders} className="h-9 px-4 rounded-full border text-[10px] font-semibold uppercase flex items-center gap-1.5 cursor-pointer"><RefreshCw className="size-3.5" /> Refresh</button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input type="text" placeholder="Search by order #, customer name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-lg border bg-white text-sm" />
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-gray-50 uppercase text-[9px] text-muted-foreground"><th className="p-4 text-left">Order</th><th className="p-4 text-left">Customer</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4 text-right">Action</th></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono font-semibold">{o.order_number}</td>
                <td className="p-4"><p className="font-semibold">{o.user_name || "—"}</p><p className="text-[10px] text-muted-foreground">{o.user_email}</p></td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
                <td className="p-4 font-mono font-semibold">{formatPrice(o.total)}</td>
                <td className="p-4 text-right">
                  <button onClick={async () => setSelectedOrder(await apiFetch(`/api/admin/orders/${o.id}`))} className="text-[10px] font-semibold uppercase flex items-center gap-1 ml-auto cursor-pointer">View <ChevronRight className="size-3" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No orders yet. Orders appear here when customers checkout.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isOneSize, setIsOneSize] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category_id: "", base_price: "", status: "active",
    variants: [{ sku: "", size: "M", color: "", stock_quantity: "10", price: "" }],
    images: [""],
  });
  const [newVariant, setNewVariant] = useState({ sku: "", size: "", color: "", stock_quantity: "0", price: "" });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingStock, setEditingStock] = useState<Record<number, string>>({});
  const [detailImages, setDetailImages] = useState<any[]>([]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch<any[]>("/api/admin/products"),
      apiFetch<any[]>("/api/admin/categories"),
    ]).then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openProductDetail = async (productId: number) => {
    try {
      const [product, images] = await Promise.all([
        apiFetch<any>(`/api/admin/products/${productId}`),
        apiFetch<any[]>(`/api/admin/products/${productId}/images`),
      ]);
      setSelectedProduct(product);
      setDetailImages(images);
    } catch { toast.error("Failed to load product details"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.base_price) { toast.error("Name and price required"); return; }
    const variants = isOneSize
      ? [{ sku: form.variants[0].sku || form.name.toUpperCase().replace(/\s+/g, "-") + "-OS", attributes: { size: "One Size", color: form.variants[0].color || "Default" }, price: form.variants[0].price ? parseFloat(form.variants[0].price) : null, stock_quantity: parseInt(form.variants[0].stock_quantity) || 0 }]
      : form.variants.filter((v) => v.sku).map((v) => ({ sku: v.sku, attributes: { size: v.size, color: v.color }, price: v.price ? parseFloat(v.price) : null, stock_quantity: parseInt(v.stock_quantity) || 0 }));
    try {
      const product = await apiFetch<any>("/api/admin/products", {
        method: "POST", body: JSON.stringify({ name: form.name, description: form.description, category_id: form.category_id ? parseInt(form.category_id) : null, base_price: parseFloat(form.base_price), status: form.status, variants }),
      });
      for (const url of form.images.filter((u) => u.trim())) {
        await apiFetch(`/api/admin/products/${product.id}/images`, { method: "POST", body: JSON.stringify({ url, sort_order: 0 }) });
      }
      toast.success("Product created!");
      setShowForm(false); setIsOneSize(false);
      setForm({ name: "", description: "", category_id: "", base_price: "", status: "active", variants: [{ sku: "", size: "M", color: "", stock_quantity: "10", price: "" }], images: [""] });
      fetchProducts();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const addVariantRow = () => setForm({ ...form, variants: [...form.variants, { sku: "", size: "", color: "", stock_quantity: "0", price: "" }] });
  const removeVariantRow = (i: number) => { if (form.variants.length > 1) setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) }); };
  const addImageRow = () => setForm({ ...form, images: [...form.images, ""] });
  const removeImageRow = (i: number) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  const addVariantToProduct = async () => {
    if (!newVariant.sku) { toast.error("SKU is required"); return; }
    try {
      await apiFetch(`/api/admin/products/${selectedProduct.id}/variants`, { method: "POST", body: JSON.stringify({ sku: newVariant.sku, attributes: { size: newVariant.size || "One Size", color: newVariant.color || "Default" }, price: newVariant.price ? parseFloat(newVariant.price) : null, stock_quantity: parseInt(newVariant.stock_quantity) || 0 }) });
      toast.success("Variant added"); setNewVariant({ sku: "", size: "", color: "", stock_quantity: "0", price: "" }); openProductDetail(selectedProduct.id);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const deleteVariant = async (variantId: number) => {
    try { await apiFetch(`/api/admin/variants/${variantId}`, { method: "DELETE" }); toast.success("Variant removed"); openProductDetail(selectedProduct.id); fetchProducts(); } catch { toast.error("Failed"); }
  };

  const updateVariantStock = async (variantId: number) => {
    const qty = parseInt(editingStock[variantId]);
    if (isNaN(qty) || qty < 0) { toast.error("Enter valid stock"); return; }
    try { await apiFetch(`/api/admin/variants/${variantId}/stock`, { method: "PUT", body: JSON.stringify({ stock_quantity: qty }) }); toast.success("Stock updated"); setEditingStock({ ...editingStock, [variantId]: "" }); openProductDetail(selectedProduct.id); fetchProducts(); } catch { toast.error("Failed"); }
  };

  const addImageToProduct = async () => {
    if (!newImageUrl.trim()) { toast.error("Enter a URL"); return; }
    try { await apiFetch(`/api/admin/products/${selectedProduct.id}/images`, { method: "POST", body: JSON.stringify({ url: newImageUrl.trim(), sort_order: detailImages.length }) }); toast.success("Media added"); setNewImageUrl(""); const imgs = await apiFetch<any[]>(`/api/admin/products/${selectedProduct.id}/images`); setDetailImages(imgs); } catch { toast.error("Failed"); }
  };

  const deleteImage = async (imageId: number) => {
    try { await apiFetch(`/api/admin/images/${imageId}`, { method: "DELETE" }); toast.success("Media removed"); setDetailImages(detailImages.filter((img) => img.id !== imageId)); } catch { toast.error("Failed"); }
  };

  const deleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to completely delete this product? This action cannot be undone.")) return;
    try {
      await apiFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      toast.success("Product deleted successfully");
      setSelectedProduct(null);
      fetchProducts();
    } catch { toast.error("Failed to delete product"); }
  };

  if (loading) return <LoadingSpinner />;

  // ========== PRODUCT DETAIL VIEW ==========
  if (selectedProduct) {
    const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button onClick={() => { setSelectedProduct(null); fetchProducts(); }} className="text-xs uppercase font-semibold text-muted-foreground hover:text-ink cursor-pointer">← Back to Products</button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium flex items-center gap-3">{selectedProduct.name} <StatusBadge status={selectedProduct.status} /></h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{selectedProduct.slug} · {selectedProduct.category_name || "No category"} · Base: {formatPrice(selectedProduct.base_price)}</p>
          </div>
          <button onClick={() => deleteProduct(selectedProduct.id)} className="h-9 px-4 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-semibold uppercase cursor-pointer">Delete Product</button>
        </div>

        {/* MEDIA GALLERY */}
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">📷 Images & Videos</h3>
            <span className="text-[10px] text-muted-foreground font-mono">{detailImages.length} items</span>
          </div>
          {detailImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {detailImages.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-gray-50 aspect-square">
                  {isVideo(img.url) ? (
                    <video src={img.url} className="w-full h-full object-cover" muted loop playsInline />
                  ) : (
                    <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <button onClick={() => deleteImage(img.id)} className="absolute top-1.5 right-1.5 size-6 rounded-full bg-red-500 text-white grid place-items-center text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer" title="Remove">✕</button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition">{isVideo(img.url) ? "🎬 Video" : "🖼 Image"}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="url" placeholder="Paste image or video URL (.jpg, .png, .mp4, .webm...)" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1 h-9 px-4 rounded-lg border text-sm" />
            <button onClick={addImageToProduct} className="h-9 px-4 rounded-full bg-ink text-bone text-[10px] font-semibold uppercase cursor-pointer shrink-0">+ Add</button>
          </div>
        </div>

        {/* VARIANTS & STOCK */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">📦 Variants & Stock ({selectedProduct.variants?.length || 0})</h3>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-gray-50/50 text-[9px] uppercase text-muted-foreground"><th className="p-3 text-left">SKU</th><th className="p-3 text-center">Size</th><th className="p-3 text-center">Color</th><th className="p-3 text-center">Price</th><th className="p-3 text-center">Stock</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {selectedProduct.variants?.map((v: any) => (
                <tr key={v.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-3 font-mono font-semibold">{v.sku}</td>
                  <td className="p-3 text-center">{v.attributes?.size === "One Size" ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">One Size</span> : <span className="font-semibold">{v.attributes?.size || "—"}</span>}</td>
                  <td className="p-3 text-center"><span className="inline-flex items-center gap-1.5">{v.attributes?.color && v.attributes.color !== "Default" && <span className="size-3 rounded-full border" style={{ backgroundColor: v.attributes.color.toLowerCase() }} />}{v.attributes?.color || "—"}</span></td>
                  <td className="p-3 text-center font-mono">{v.price ? formatPrice(v.price) : <span className="text-muted-foreground">base</span>}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className={`font-bold font-mono ${v.stock_quantity < 10 ? (v.stock_quantity === 0 ? "text-red-600" : "text-amber-600") : "text-emerald-600"}`}>{v.stock_quantity}</span>
                      <input type="number" min="0" placeholder="new" value={editingStock[v.id] ?? ""} onChange={(e) => setEditingStock({ ...editingStock, [v.id]: e.target.value })} className="w-16 h-7 px-2 rounded border text-xs text-center" />
                      {editingStock[v.id] && <button onClick={() => updateVariantStock(v.id)} className="h-7 px-2 rounded bg-ink text-bone text-[9px] font-bold cursor-pointer">✓</button>}
                    </div>
                  </td>
                  <td className="p-3 text-right"><button onClick={() => deleteVariant(v.id)} className="text-red-500 hover:text-red-700 text-[10px] font-semibold uppercase cursor-pointer">Remove</button></td>
                </tr>
              ))}
              {(!selectedProduct.variants || selectedProduct.variants.length === 0) && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No variants. Add one below.</td></tr>}
            </tbody>
          </table>
          <div className="p-4 border-t bg-gray-50/30">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3">Add New Variant</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <input type="text" placeholder="SKU *" value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} className="h-9 px-3 rounded border text-xs" />
              <input type="text" placeholder="Size (empty = One Size)" value={newVariant.size} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} className="h-9 px-3 rounded border text-xs" />
              <input type="text" placeholder="Color" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} className="h-9 px-3 rounded border text-xs" />
              <input type="number" placeholder="Stock" value={newVariant.stock_quantity} onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: e.target.value })} className="h-9 px-3 rounded border text-xs" />
              <input type="number" placeholder="Price override" step="0.01" value={newVariant.price} onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })} className="h-9 px-3 rounded border text-xs" />
              <button onClick={addVariantToProduct} className="h-9 rounded-full bg-ink text-bone text-[10px] font-semibold uppercase cursor-pointer">+ Add</button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Leave Size empty for bags, accessories — defaults to "One Size".</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ========== PRODUCT LIST + CREATE FORM ==========
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-medium">Products</h2>
        <button onClick={() => setShowForm(!showForm)} className="h-9 px-4 rounded-full bg-ink text-bone text-[10px] font-semibold uppercase flex items-center gap-1.5 cursor-pointer"><Plus className="size-3.5" /> {showForm ? "Cancel" : "Add Product"}</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5 overflow-hidden">
            {/* Section 1: Details */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><span className="size-4 rounded bg-ink/10 grid place-items-center text-[8px]">1</span> Product Details</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Name *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Classic Cotton T-Shirt" className="w-full h-10 px-4 rounded-md border text-sm" /></div>
                <div><label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Base Price (₹) *</label><input type="number" required step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className="w-full h-10 px-4 rounded-md border text-sm" /></div>
              </div>
              <div className="mt-3"><label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-md border text-sm resize-none" /></div>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div><label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Category</label><select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full h-10 px-4 rounded-md border text-sm"><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-4 rounded-md border text-sm"><option value="active">Active</option><option value="draft">Draft</option></select></div>
              </div>
            </div>

            {/* Section 2: Images */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><span className="size-4 rounded bg-ink/10 grid place-items-center text-[8px]">2</span> Images & Videos</p>
              <div className="space-y-2">
                {form.images.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="url" placeholder={i === 0 ? "Main image URL (e.g. https://...jpg)" : "Additional image/video URL"} value={url} onChange={(e) => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs }); }} className="flex-1 h-9 px-4 rounded border text-sm" />
                    {form.images.length > 1 && <button type="button" onClick={() => removeImageRow(i)} className="size-9 rounded border text-red-500 hover:bg-red-50 grid place-items-center cursor-pointer text-xs">✕</button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addImageRow} className="mt-2 text-[10px] font-semibold uppercase text-ink hover:underline cursor-pointer">+ Add another image/video</button>
              <p className="text-[10px] text-muted-foreground mt-1">Supports .jpg, .png, .webp images and .mp4, .webm videos</p>
            </div>

            {/* Section 3: Variants */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><span className="size-4 rounded bg-ink/10 grid place-items-center text-[8px]">3</span> Variants & Stock</p>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50 border">
                <button type="button" onClick={() => { setIsOneSize(!isOneSize); if (!isOneSize) setForm({ ...form, variants: [{ sku: "", size: "One Size", color: "", stock_quantity: "10", price: "" }] }); else setForm({ ...form, variants: [{ sku: "", size: "M", color: "", stock_quantity: "10", price: "" }] }); }} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isOneSize ? "bg-ink" : "bg-gray-300"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${isOneSize ? "translate-x-5" : "translate-x-0.5"}`} /></button>
                <div><p className="text-xs font-semibold">One Size (no size variants)</p><p className="text-[10px] text-muted-foreground">Enable for bags, accessories, jewelry — products without size options.</p></div>
              </div>
              {isOneSize ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><label className="text-[9px] uppercase text-muted-foreground font-bold block mb-1">SKU</label><input type="text" placeholder="BAG-001" value={form.variants[0].sku} onChange={(e) => { const nv = [...form.variants]; nv[0].sku = e.target.value; setForm({ ...form, variants: nv }); }} className="w-full h-9 px-3 rounded border text-xs" /></div>
                  <div><label className="text-[9px] uppercase text-muted-foreground font-bold block mb-1">Color</label><input type="text" placeholder="Black" value={form.variants[0].color} onChange={(e) => { const nv = [...form.variants]; nv[0].color = e.target.value; setForm({ ...form, variants: nv }); }} className="w-full h-9 px-3 rounded border text-xs" /></div>
                  <div><label className="text-[9px] uppercase text-muted-foreground font-bold block mb-1">Stock</label><input type="number" placeholder="10" value={form.variants[0].stock_quantity} onChange={(e) => { const nv = [...form.variants]; nv[0].stock_quantity = e.target.value; setForm({ ...form, variants: nv }); }} className="w-full h-9 px-3 rounded border text-xs" /></div>
                  <div><label className="text-[9px] uppercase text-muted-foreground font-bold block mb-1">Price Override</label><input type="number" placeholder="Uses base" step="0.01" value={form.variants[0].price} onChange={(e) => { const nv = [...form.variants]; nv[0].price = e.target.value; setForm({ ...form, variants: nv }); }} className="w-full h-9 px-3 rounded border text-xs" /></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2 text-[9px] uppercase text-muted-foreground font-bold px-1"><span>SKU *</span><span>Size</span><span>Color</span><span>Stock</span><span>Price Override</span><span></span></div>
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2">
                      <input type="text" placeholder="TSH-M-BLK" value={v.sku} onChange={(e) => { const nv = [...form.variants]; nv[i].sku = e.target.value; setForm({ ...form, variants: nv }); }} className="h-9 px-3 rounded border text-xs" />
                      <select value={v.size} onChange={(e) => { const nv = [...form.variants]; nv[i].size = e.target.value; setForm({ ...form, variants: nv }); }} className="h-9 px-2 rounded border text-xs"><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="Free Size">Free Size</option></select>
                      <input type="text" placeholder="Black" value={v.color} onChange={(e) => { const nv = [...form.variants]; nv[i].color = e.target.value; setForm({ ...form, variants: nv }); }} className="h-9 px-3 rounded border text-xs" />
                      <input type="number" placeholder="10" value={v.stock_quantity} onChange={(e) => { const nv = [...form.variants]; nv[i].stock_quantity = e.target.value; setForm({ ...form, variants: nv }); }} className="h-9 px-3 rounded border text-xs" />
                      <input type="number" placeholder="Base price" step="0.01" value={v.price} onChange={(e) => { const nv = [...form.variants]; nv[i].price = e.target.value; setForm({ ...form, variants: nv }); }} className="h-9 px-3 rounded border text-xs" />
                      <button type="button" onClick={() => removeVariantRow(i)} className={`h-9 rounded border text-xs cursor-pointer ${form.variants.length <= 1 ? "text-gray-300" : "text-red-500 hover:bg-red-50"}`} disabled={form.variants.length <= 1}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addVariantRow} className="text-[10px] font-semibold uppercase text-ink hover:underline cursor-pointer">+ Add another size/color variant</button>
                </div>
              )}
            </div>
            <button type="submit" className="h-10 px-6 rounded-full bg-ink text-bone text-[11px] font-semibold uppercase cursor-pointer">Create Product</button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Product List */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-gray-50 uppercase text-[9px] text-muted-foreground"><th className="p-4 text-left">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openProductDetail(p.id)}>
                <td className="p-4"><p className="font-semibold">{p.name}</p><p className="text-[10px] text-muted-foreground font-mono">{p.slug}</p></td>
                <td className="p-4 text-muted-foreground">{p.category_name || "—"}</td>
                <td className="p-4 font-mono">{formatPrice(p.base_price)}</td>
                <td className="p-4"><span className={`font-bold ${Number(p.total_stock) < 10 ? "text-amber-600" : "text-emerald-600"}`}>{p.total_stock}</span> <span className="text-muted-foreground">({p.variant_count} var)</span></td>
                <td className="p-4"><StatusBadge status={p.status} /></td>
                <td className="p-4 text-right"><button className="text-[10px] font-semibold uppercase flex items-center gap-1 ml-auto cursor-pointer text-ink">Manage <ChevronRight className="size-3" /></button></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No products yet. Add your first product above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function StockTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<number, string>>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await apiFetch<any[]>("/api/admin/products");
      const withVariants = await Promise.all(
        prods.map(async (p) => ({ ...p, detail: await apiFetch(`/api/admin/products/${p.id}`) }))
      );
      setProducts(withVariants);
    } catch {
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStock = async (variantId: number) => {
    const qty = parseInt(editingStock[variantId]);
    if (isNaN(qty) || qty < 0) { toast.error("Enter a valid stock number"); return; }
    try {
      await apiFetch(`/api/admin/variants/${variantId}/stock`, { method: "PUT", body: JSON.stringify({ stock_quantity: qty }) });
      toast.success("Stock updated");
      fetchAll();
    } catch {
      toast.error("Failed to update stock");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-medium">Stock Management</h2>
        <button onClick={fetchAll} className="h-9 px-4 rounded-full border text-[10px] font-semibold uppercase flex items-center gap-1.5 cursor-pointer"><RefreshCw className="size-3.5" /> Refresh</button>
      </div>
      <p className="text-sm text-muted-foreground">Update stock levels for each product variant (size/color combination).</p>

      {products.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-muted-foreground">No products to manage. Add products first.</div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.category_name} · Total stock: {p.total_stock}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <table className="w-full text-xs">
                <thead><tr className="border-b text-[9px] uppercase text-muted-foreground"><th className="p-3 text-left">SKU</th><th className="p-3">Size</th><th className="p-3">Color</th><th className="p-3">Current Stock</th><th className="p-3 text-right">Update</th></tr></thead>
                <tbody>
                  {p.detail?.variants?.map((v: any) => (
                    <tr key={v.id} className="border-b">
                      <td className="p-3 font-mono">{v.sku}</td>
                      <td className="p-3 text-center">{v.attributes?.size || "—"}</td>
                      <td className="p-3 text-center">{v.attributes?.color || "—"}</td>
                      <td className="p-3 text-center"><span className={`font-bold ${v.stock_quantity < 10 ? "text-amber-600" : ""}`}>{v.stock_quantity}</span></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 justify-end">
                          <input
                            type="number"
                            min="0"
                            placeholder={String(v.stock_quantity)}
                            value={editingStock[v.id] ?? ""}
                            onChange={(e) => setEditingStock({ ...editingStock, [v.id]: e.target.value })}
                            className="w-20 h-8 px-2 rounded border text-xs text-center"
                          />
                          <button onClick={() => updateStock(v.id)} className="h-8 px-3 rounded-full bg-ink text-bone text-[10px] font-semibold uppercase cursor-pointer">Save</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>("/api/admin/customers")
      .then(setCustomers)
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-medium">Customers</h2>
      <p className="text-sm text-muted-foreground">Real customers who registered via Create Account.</p>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-gray-50 uppercase text-[9px] text-muted-foreground"><th className="p-4 text-left">Name</th><th className="p-4 text-left">Email</th><th className="p-4">Orders</th><th className="p-4 text-right">Joined</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold">{c.full_name}</td>
                <td className="p-4 text-muted-foreground">{c.email}</td>
                <td className="p-4 text-center font-mono">{c.order_count}</td>
                <td className="p-4 text-right text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No customers yet. They appear here when someone creates an account.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { currentUser, logout } = useMarketplace();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  if (!currentUser) { navigate({ to: "/auth" }); return null; }
  if (currentUser.role !== "admin") { navigate({ to: "/shop" }); return null; }

  const tabs = [
    { type: "dashboard" as TabType, label: "Dashboard", icon: BarChart3 },
    { type: "orders" as TabType, label: "Orders", icon: Package },
    { type: "products" as TabType, label: "Products", icon: Plus },
    { type: "stock" as TabType, label: "Stock", icon: Boxes },
    { type: "customers" as TabType, label: "Customers", icon: Users },
  ];

  return (
    <div className="bg-gray-50 text-ink min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin Panel</p>
            <h1 className="font-display text-3xl font-medium flex items-center gap-2 mt-1">
              <ShieldCheck className="size-7" /> Threadmarket Admin
            </h1>
          </div>
          <button onClick={() => { logout(); navigate({ to: "/" }); }} className="h-9 px-5 rounded-full border border-red-200 text-red-600 text-[10px] font-semibold uppercase flex items-center gap-1.5 cursor-pointer">
            <LogOut className="size-3.5" /> Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <nav className="lg:col-span-2 flex flex-row lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.type}
                  onClick={() => setActiveTab(t.type)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg whitespace-nowrap cursor-pointer transition ${
                    activeTab === t.type ? "bg-ink text-bone" : "text-muted-foreground hover:bg-white hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" /> {t.label}
                </button>
              );
            })}
          </nav>

          <div className="lg:col-span-10">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {activeTab === "dashboard" && <DashboardTab />}
              {activeTab === "orders" && <OrdersTab />}
              {activeTab === "products" && <ProductsTab />}
              {activeTab === "stock" && <StockTab />}
              {activeTab === "customers" && <CustomersTab />}
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
