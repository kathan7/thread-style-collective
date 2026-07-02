import { useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "../lib/api";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Orders — THREADMARKET" }] }),
  component: AccountPage,
});

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function AccountPage() {
  const { currentUser, customerOrders, refreshOrders } = useMarketplace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/auth" });
      return;
    }
    if (currentUser.role === "admin") {
      navigate({ to: "/dashboard/admin" });
      return;
    }
    refreshOrders();
  }, [currentUser, navigate, refreshOrders]);

  if (!currentUser) return null;

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink mb-6">
          <ArrowLeft className="size-3.5" /> Back to shop
        </Link>

        <div className="mb-10">
          <p className="eyebrow text-muted-foreground">My Account</p>
          <h1 className="font-display text-4xl font-medium tracking-tight mt-2">Hello, {currentUser.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentUser.email}</p>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-2xl font-medium flex items-center gap-2">
            <Package className="size-5" /> Order History
          </h2>

          {customerOrders.length === 0 ? (
            <div className="bg-paper border border-ink/5 rounded-2xl p-10 text-center">
              <Package className="size-10 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-medium mb-2">No orders yet</p>
              <p className="text-sm text-muted-foreground mb-6">When you place an order, it will show up here.</p>
              <Link to="/shop" className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order) => (
                <div key={order.id} className="bg-paper border border-ink/5 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono font-semibold text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.placed_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                      <span className="font-display font-semibold">{formatPrice(Number(order.total))}</span>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-ink/5 pt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name_snapshot} × {item.quantity}</span>
                          <span className="text-muted-foreground">{formatPrice(Number(item.subtotal))}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
