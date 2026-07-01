import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Truck, CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMarketplace, Address } from "../hooks/use-marketplace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — THREADMARKET" },
      { name: "description", content: "Finalize your curated clothing order on our secure server." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, currentUser, createOrder } = useMarketplace();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);

  // Address form fields (Autofill if user logged in)
  const defaultAddr = currentUser?.addresses?.find((a) => a.isDefault) || null;
  const [name, setName] = useState(currentUser?.name || "");
  const [street, setStreet] = useState(defaultAddr?.street || "");
  const [city, setCity] = useState(defaultAddr?.city || "");
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || "");
  const [country, setCountry] = useState(defaultAddr?.country || "France");

  // Payment form fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!name || !street || !city || !postalCode || !country) {
      toast.error("Please fill in all shipping details.");
      return;
    }
    if (!cardNumber || !expiry || !cvc) {
      toast.error("Please fill in payment details.");
      return;
    }

    setIsProcessing(true);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      name,
      street,
      city,
      postalCode,
      country,
      isDefault: false
    };

    // Simulate luxury-grade checkout lag
    setTimeout(() => {
      try {
        const order = createOrder(shippingAddress);
        setOrderCompleted(order);
        toast.success("Transaction verified. Pieces archived.");
      } catch (err) {
        console.error(err);
        toast.error("Checkout process failed.");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (orderCompleted) {
    return (
      <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
        <SiteHeader />
        
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-paper border border-ink/5 p-8 md:p-10 rounded-2xl shadow-editorial text-center"
          >
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="size-16 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="eyebrow text-emerald-600 font-bold">Transaction Confirmed</p>
            <h1 className="font-display text-4xl font-medium tracking-tight mt-3 mb-2">
              Your order is in the archive.
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Order reference: <span className="font-mono text-ink font-semibold">{orderCompleted.id}</span>
            </p>

            <div className="bg-bone border border-ink/5 rounded-xl p-6 mb-8 text-left space-y-4">
              <p className="eyebrow text-[10px] text-muted-foreground border-b border-ink/5 pb-2">Receipt Details</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ship To</span>
                  <span className="font-medium">{orderCompleted.shippingAddress.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium">{orderCompleted.shippingAddress.city}, {orderCompleted.shippingAddress.country}</span>
                </div>
                <div className="flex justify-between border-t border-ink/5 pt-2.5">
                  <span className="font-medium text-ink">Total Charged</span>
                  <span className="font-display font-medium text-lg">${orderCompleted.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={currentUser ? `/dashboard/${currentUser.role}` : "/"}
                className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone hover:opacity-90 transition cursor-pointer"
              >
                Go to Dashboard
              </a>
              <a
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-[11px] font-semibold uppercase tracking-widest hover:border-ink transition cursor-pointer"
              >
                Continue Collecting
              </a>
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
        <div className="mb-10">
          <a href="/shop" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink transition mb-4">
            <ArrowLeft className="size-3.5" />
            <span>Return to Shop</span>
          </a>
          <h1 className="font-display text-4xl font-medium tracking-tight">Archiving checkout.</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-paper/50 rounded-2xl border border-ink/5">
            <h2 className="font-display text-2xl font-medium mb-3">No items to checkout.</h2>
            <p className="text-sm text-muted-foreground mb-8">Add items to your cart before proceeding.</p>
            <a href="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
              Browse shop
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Form Info */}
            <div className="lg:col-span-7">
              <form onSubmit={handlePlaceOrder} className="space-y-10">
                {/* Shipping */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-ink/5 pb-2">
                    <Truck className="size-4 text-ink" />
                    <h2 className="eyebrow text-xs">1. Shipping Logistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Margot Laurent"
                        className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="124 Rue de Grenelle"
                        className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Paris"
                        className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="75007"
                          className="w-full h-11 px-3 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Country</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="France"
                          className="w-full h-11 px-3 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-ink/5 pb-2">
                    <CreditCard className="size-4 text-ink" />
                    <h2 className="eyebrow text-xs">2. Payment Verification</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full h-11 pl-10 pr-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                        />
                        <CreditCard className="size-4 text-muted-foreground absolute left-3.5 top-3.5" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">CVC Code</label>
                        <input
                          type="text"
                          required
                          maxLength={3}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="123"
                          className="w-full h-11 px-4 rounded-md border border-ink/10 bg-paper text-sm focus:outline-none focus:border-ink transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 cursor-pointer inline-flex items-center justify-center rounded-full bg-ink text-bone font-semibold text-[11px] uppercase tracking-[0.2em] transition hover:opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin size-4 border-2 border-bone/20 border-t-bone rounded-full" />
                      <span>Authenticating Funds...</span>
                    </span>
                  ) : (
                    <span>Authorize Transaction · ${cartSubtotal.toLocaleString()}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Cart summary panel */}
            <div className="lg:col-span-5">
              <div className="bg-paper border border-ink/5 rounded-2xl p-6 sticky top-24 space-y-6">
                <h3 className="font-display text-xl font-medium">Order details</h3>
                
                <div className="divide-y divide-ink/5 max-h-80 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="aspect-[3/4] w-14 overflow-hidden rounded bg-bone border border-ink/5">
                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{item.product.seller}</p>
                          <h4 className="font-medium text-ink mt-0.5">{item.product.name}</h4>
                          <p className="text-muted-foreground mt-0.5">Size {item.size} · Color {item.color} · Qty {item.quantity}</p>
                        </div>
                        <span className="font-display font-medium text-right mt-1">${(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ink/10 pt-4 space-y-3.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original subtotal</span>
                    <span className="font-medium">${cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping (Global Express)</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-ink/5 pt-3.5 text-base">
                    <span className="font-semibold text-ink">Total</span>
                    <span className="font-display font-semibold">${cartSubtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-bone border border-ink/5 p-3 rounded-lg">
                  <ShieldCheck className="size-4 text-ink shrink-0" />
                  <span>Your luxury transaction is encrypted. Items will ship tracked via DHL Express and arrive in custom editorial packaging.</span>
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
