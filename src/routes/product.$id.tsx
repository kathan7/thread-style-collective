import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Star, BadgeCheck, Truck, RotateCcw, ShieldCheck, Send } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    return { id: params.id };
  },
  component: ProductPage,
});

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = [
  { name: "Bone", hex: "#f5f4f0" },
  { name: "Charcoal", hex: "#2b2b2c" },
  { name: "Ink", hex: "#111110" },
];
const TABS = ["Description", "Reviews", "Shipping", "Returns"] as const;

function ProductPage() {
  const { id } = Route.useLoaderData();
  const { products, addToCart, wishlist, toggleWishlist, reviews, addReview } = useMarketplace();
  const navigate = useNavigate();

  const [size, setSize] = useState("M");
  const [color, setColor] = useState(COLORS[1].name);
  const [tab, setTab] = useState<typeof TABS[number]>("Description");
  const [active, setActive] = useState(0);

  // Reviews states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  // Find live product
  const product = products.find((p) => p.id === id);
  
  const gallery = product ? [product.image, product.image, product.image, product.image] : [];
  const related = product ? products.filter((p) => p.id !== product.id && p.status === "approved").slice(0, 3) : [];
  
  const isWishlisted = product ? wishlist.includes(product.id) : false;
  const productReviews = product ? reviews.filter((r) => r.productId === product.id) : [];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, size, color, 1);
    toast.success(`"${product.name}" added to your archive.`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, size, color, 1);
    navigate({ to: "/checkout" });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    toggleWishlist(product.id);
    if (!isWishlisted) {
      toast.success(`Piece saved to wishlist.`);
    } else {
      toast.info(`Piece removed from wishlist.`);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newComment.trim()) {
      toast.error("Please draft a comment before submitting.");
      return;
    }
    
    addReview(product.id, newRating, newComment);
    toast.success("Review posted successfully.");
    setNewComment("");
    setNewRating(5);
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <div className="flex-1">
        {!product ? (
          <div className="grid min-h-[60vh] place-items-center">
            <div className="text-center py-20">
              <p className="eyebrow text-muted-foreground">Off Catalog</p>
              <h1 className="font-display text-3xl font-medium tracking-tight mt-3 mb-6">Product not found.</h1>
              <Link to="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
                Return to shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <nav className="mx-auto max-w-7xl px-6 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Link to="/" className="hover:text-ink transition font-medium">Home</Link> / <Link to="/shop" className="hover:text-ink transition font-medium">Shop</Link> / <Link to="/shop" className="hover:text-ink transition font-medium">{product.category}</Link> / <span className="text-ink font-semibold">{product.name}</span>
              </p>
            </nav>

            <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-12 lg:gap-16">
              {/* Gallery */}
              <div className="lg:col-span-7">
                <div className="flex gap-4">
                  <div className="hidden w-20 shrink-0 flex-col gap-3 md:flex">
                    {gallery.map((g, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`aspect-[3/4] overflow-hidden rounded-md bg-paper ring-1 cursor-pointer transition ${active === i ? "ring-ink" : "ring-ink/10 hover:ring-ink/40"}`}
                      >
                        <img src={g} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="group relative flex-1 overflow-hidden rounded-lg bg-paper">
                    <motion.img
                      key={active}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      src={gallery[active]}
                      alt={product.name}
                      width={1200}
                      height={1600}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <button
                      onClick={handleWishlistClick}
                      aria-label="Wishlist"
                      className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-bone/90 ring-1 ring-ink/5 backdrop-blur-xs transition hover:bg-bone hover:scale-105 active:scale-95 cursor-pointer z-10"
                    >
                      <Heart className={`size-5 transition-colors ${isWishlisted ? "fill-red-500 stroke-red-500" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-bone">Verified Atelier</span>
                    <Link to="/store/$slug" params={{ slug: product.sellerSlug }} className="eyebrow text-muted-foreground hover:text-ink transition">
                      By {product.seller}
                    </Link>
                  </div>
                  <h1 className="font-display mt-5 text-balance text-5xl font-medium leading-tight tracking-tight md:text-6xl">
                    {product.name}
                  </h1>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-4 ${i < Math.round(product.rating) ? "fill-ink stroke-ink" : "stroke-ink/30"}`} />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {product.rating} · {productReviews.length} reviews
                    </span>
                  </div>
                  <p className="mt-6 font-display text-3xl font-medium">${product.price.toLocaleString()}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">Or 4 interest-free installments of ${Math.round(product.price / 4)}.</p>

                  {/* Color */}
                  <div className="mt-10">
                    <div className="flex justify-between">
                      <p className="eyebrow">Color — {color}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setColor(c.name)}
                          className={`size-9 rounded-full ring-2 ring-offset-2 ring-offset-bone cursor-pointer transition ${color === c.name ? "ring-ink" : "ring-transparent"}`}
                          style={{ background: c.hex }}
                          aria-label={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div className="mt-8">
                    <div className="flex justify-between">
                      <p className="eyebrow">Size</p>
                      <button className="text-[11px] font-semibold uppercase tracking-widest underline underline-offset-4 text-muted-foreground cursor-pointer">Size guide</button>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`h-12 rounded-md border text-sm font-semibold cursor-pointer transition ${size === s ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="mt-8 flex flex-col gap-3">
                    <button 
                      onClick={handleAddToCart}
                      className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 text-[12px] font-semibold uppercase tracking-[0.2em] text-bone transition hover:opacity-90 cursor-pointer"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      className="inline-flex h-14 items-center justify-center rounded-full border border-ink/15 bg-bone px-8 text-[12px] font-semibold uppercase tracking-[0.2em] transition hover:border-ink cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Stock */}
                  <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-600 animate-pulse" /> In stock — ships within 48 hours
                  </p>

                  {/* Trust */}
                  <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/5 pt-6">
                    <TrustChip icon={<Truck className="size-4" />} text="Free shipping" />
                    <TrustChip icon={<RotateCcw className="size-4" />} text="14-day returns" />
                    <TrustChip icon={<ShieldCheck className="size-4" />} text="Authenticated" />
                  </div>

                  {/* Tabs */}
                  <div className="mt-12">
                    <div className="flex gap-6 border-b border-ink/10">
                      {TABS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`pb-3 text-[12px] font-semibold uppercase tracking-widest cursor-pointer transition ${tab === t ? "border-b border-ink text-ink" : "text-muted-foreground hover:text-ink"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="prose-sm mt-6 max-w-none text-sm leading-relaxed text-muted-foreground">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={tab}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {tab === "Description" && (
                            <p>
                              Crafted from 100% ethically sourced Merino wool with cupro lining. Sculpted shoulders, drop-cut sleeves, and a single horn button at the lapel. Each piece is limited, hand-finished in {product.seller}'s atelier.
                            </p>
                          )}
                          {tab === "Reviews" && (
                            <div className="space-y-6">
                              {/* Write review form */}
                              <form onSubmit={handleReviewSubmit} className="bg-paper p-4 rounded-xl border border-ink/5 space-y-4">
                                <h4 className="text-xs uppercase font-bold text-ink tracking-wider">Draft a review</h4>
                                
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground mr-2">Score:</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setNewRating(star)}
                                      className="focus:outline-none cursor-pointer"
                                    >
                                      <Star className={`size-4 ${star <= newRating ? "fill-ink stroke-ink" : "stroke-ink/30"}`} />
                                    </button>
                                  ))}
                                </div>

                                <div className="relative">
                                  <textarea
                                    required
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Describe weight, drape, fabric feel..."
                                    className="w-full p-3 text-xs bg-bone border border-ink/10 rounded-md focus:outline-none focus:border-ink transition font-sans"
                                  />
                                </div>
                                
                                <button
                                  type="submit"
                                  className="inline-flex h-9 items-center justify-center rounded-full bg-ink px-4 text-[10px] font-semibold uppercase tracking-wider text-bone gap-1.5 cursor-pointer"
                                >
                                  <Send className="size-3" />
                                  <span>Post Review</span>
                                </button>
                              </form>

                              <div className="space-y-4">
                                {productReviews.map((r) => (
                                  <div key={r.id} className="border-b border-ink/5 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-start gap-4">
                                      <h5 className="font-semibold text-ink text-xs">{r.userName}</h5>
                                      <span className="text-[10px] text-muted-foreground">{r.createdAt}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mt-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`size-3 ${i < r.rating ? "fill-ink stroke-ink" : "stroke-ink/20"}`} />
                                      ))}
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                                  </div>
                                ))}
                                {productReviews.length === 0 && (
                                  <p className="text-xs text-muted-foreground">No reviews listed for this piece yet.</p>
                                )}
                              </div>
                            </div>
                          )}
                          {tab === "Shipping" && (
                            <p>Free express shipping worldwide via DHL. Orders before 14:00 CET ship same day. Delivery 2–5 business days. Tracked and insured.</p>
                          )}
                          {tab === "Returns" && (
                            <p>14-day free returns. Items must be unworn with original tags and packaging. Refunds processed within 3 business days of receipt.</p>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seller card */}
            <section className="bg-paper py-20">
              <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-bone p-8 ring-1 ring-ink/5 md:flex-row md:items-center">
                  <div className="flex items-center gap-5">
                    <div className="grid size-16 place-items-center rounded-full bg-ink text-bone font-display text-xl">
                      {product.seller.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-display text-2xl font-medium">{product.seller}</p>
                        <BadgeCheck className="size-5 text-ink/60" />
                      </div>
                      <p className="text-sm text-muted-foreground">Verified Atelier · Sourced Globally</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/store/$slug"
                      params={{ slug: product.sellerSlug }}
                      className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone hover:opacity-90 transition"
                    >
                      Visit Store
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Related */}
            <section className="bg-bone">
              <div className="mx-auto max-w-7xl px-6 py-24">
                <h2 className="font-display mb-12 text-balance text-4xl font-medium tracking-tight">You may also collect.</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3">
                  {related.map((p) => (
                    <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group">
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-paper">
                        <motion.img 
                          src={p.image} 
                          alt={p.name} 
                          loading="lazy" 
                          className="h-full w-full object-cover" 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <p className="eyebrow text-muted-foreground">{p.seller}</p>
                          <h3 className="mt-1 text-sm font-semibold">{p.name}</h3>
                        </div>
                        <p className="font-display text-base font-medium">${p.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

function TrustChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {icon}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{text}</p>
    </div>
  );
}
