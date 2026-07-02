import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiFetch, formatPrice } from "../lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — THREADMARKET" }],
  }),
  component: CheckoutPage,
});

const PLACEHOLDER = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80";

function CheckoutPage() {
  const { cart, currentUser, clearCart, refreshOrders } = useMarketplace();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{ order_number: string; total: number } | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please sign in to checkout.");
      navigate({ to: "/auth" });
      return;
    }
    setFullName(currentUser.name);
  }, [currentUser, navigate]);

  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.current_price) * item.quantity, 0);
  const shippingFee = cartSubtotal > 5000 ? 0 : 99;
  const tax = cartSubtotal * 0.1;
  const total = cartSubtotal + shippingFee + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!fullName || !line1 || !city || !state || !pincode || !country) {
      toast.error("Please fill in all shipping details.");
      return;
    }
    if (!cardNumber || !expiry || !cvc) {
      toast.error("Please fill in payment details (mock payment).");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await apiFetch<{ order_number: string; total: number }>("/api/checkout/process", {
        method: "POST",
        body: JSON.stringify({
          shipping_address: { full_name: fullName, phone, line1, line2, city, state, pincode, country },
        }),
      });

      clearCart();
      await refreshOrders();
      setOrderCompleted(result);
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-paper border border-ink/5 p-8 md:p-10 rounded-2xl shadow-editorial text-center"
          >
            <CheckCircle2 className="size-16 text-emerald-600 mx-auto mb-6" strokeWidth={1.5} />
            <p className="eyebrow text-emerald-600 font-bold">Order Confirmed</p>
            <h1 className="font-display text-4xl font-medium tracking-tight mt-3 mb-2">Thank you for your order!</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Order: <span className="font-mono text-ink font-semibold">{orderCompleted.order_number}</span>
            </p>
            <p className="text-lg font-display font-medium mb-8">{formatPrice(Number(orderCompleted.total))}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/account" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
                View My Orders
              </Link>
              <Link to="/shop" className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-[11px] font-semibold uppercase tracking-widest">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink transition mb-4">
          <ArrowLeft className="size-3.5" /> Back to Shop
        </Link>
        <h1 className="font-display text-4xl font-medium tracking-tight mb-10">Checkout</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-paper/50 rounded-2xl border border-ink/5">
            <h2 className="font-display text-2xl font-medium mb-3">Your cart is empty</h2>
            <Link to="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <form onSubmit={handlePlaceOrder} className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-ink/5 pb-2">
                    <Truck className="size-4" />
                    <h2 className="eyebrow text-xs">Shipping Address</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Full Name</label>
                      <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Phone</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Address Line 1</label>
                      <input type="text" required value={line1} onChange={(e) => setLine1(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Address Line 2 (optional)</label>
                      <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">City</label>
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">State</label>
                      <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Pincode</label>
                      <input type="text" required value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Country</label>
                      <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-ink/5 pb-2">
                    <CreditCard className="size-4" />
                    <h2 className="eyebrow text-xs">Payment (Mock — not real)</h2>
                  </div>
                  <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
                    This is a demo payment form. No real charges are made. Enter any card details to complete the order.
                  </p>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Card Number</label>
                    <input type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Expiry</label>
                      <input type="text" required value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">CVC</label>
                      <input type="text" required value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 cursor-pointer inline-flex items-center justify-center rounded-full bg-ink text-bone font-semibold text-[11px] uppercase tracking-widest transition hover:opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : `Place Order · ${formatPrice(total)}`}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-paper border border-ink/5 rounded-2xl p-6 sticky top-24 space-y-6">
                <h3 className="font-display text-xl font-medium">Order Summary</h3>
                <div className="divide-y divide-ink/5 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.variant_id} className="flex gap-4 py-4">
                      <div className="aspect-[3/4] w-14 overflow-hidden rounded bg-bone">
                        <img src={item.image_url || PLACEHOLDER} alt={item.product_name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 text-xs">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-muted-foreground mt-0.5">
                          {item.attributes?.size && `Size ${item.attributes.size}`}
                          {item.attributes?.color && ` · ${item.attributes.color}`}
                          {` · Qty ${item.quantity}`}
                        </p>
                        <p className="font-display font-medium mt-1">{formatPrice(Number(item.current_price) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-ink/10 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartSubtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax (10%)</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between border-t border-ink/5 pt-3 font-semibold text-base">
                    <span>Total</span><span className="font-display">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-bone border border-ink/5 p-3 rounded-lg">
                  <ShieldCheck className="size-4 shrink-0" />
                  <span>Your order will appear in the admin panel with your name and details.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
