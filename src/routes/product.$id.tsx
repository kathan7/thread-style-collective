import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Truck, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import type { Product, ProductVariant } from "../lib/types";
import { formatPrice } from "../lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

const PLACEHOLDER = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80";

function ProductPage() {
  const { id: slug } = Route.useParams();
  const { getProduct, products, addToCart, wishlist, toggleWishlist, currentUser } = useMarketplace();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProduct(slug).then((p) => {
      setProduct(p);
      if (p && p.variants.length > 0) {
        const inStock = p.variants.find((v) => v.stock_quantity > 0) || p.variants[0];
        setSelectedVariant(inStock);
      }
      setLoading(false);
    });
  }, [slug, getProduct]);

  const isWishlisted = product ? wishlist.includes(product.slug) : false;
  const related = products.filter((p) => p.slug !== slug).slice(0, 3);

  const sizes = [...new Set(product?.variants.map((v) => v.attributes?.size).filter(Boolean))] as string[];
  const colors = [...new Set(product?.variants.map((v) => v.attributes?.color).filter(Boolean))] as string[];

  const findVariant = (size?: string, color?: string) => {
    if (!product) return null;
    return product.variants.find((v) => {
      const matchSize = !size || v.attributes?.size === size;
      const matchColor = !color || v.attributes?.color === color;
      return matchSize && matchColor;
    }) || null;
  };

  const handleSizeSelect = (size: string) => {
    const variant = findVariant(size, selectedVariant?.attributes?.color);
    if (variant) setSelectedVariant(variant);
  };

  const handleColorSelect = (color: string) => {
    const variant = findVariant(selectedVariant?.attributes?.size, color);
    if (variant) setSelectedVariant(variant);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a size and color.");
      return;
    }
    if (selectedVariant.stock_quantity < 1) {
      toast.error("This variant is out of stock.");
      return;
    }
    if (!currentUser) {
      toast.error("Please sign in to add items to cart.");
      navigate({ to: "/auth" });
      return;
    }

    setAdding(true);
    const result = await addToCart(selectedVariant.id, quantity);
    setAdding(false);

    if (result.success) {
      toast.success(`"${product?.name}" added to cart.`);
    } else {
      toast.error(result.error || "Could not add to cart.");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (currentUser) navigate({ to: "/checkout" });
  };

  if (loading) {
    return (
      <div className="bg-bone min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-bone text-ink min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 grid place-items-center">
          <div className="text-center py-20">
            <h1 className="font-display text-3xl font-medium mb-6">Product not found</h1>
            <Link to="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
              Back to shop
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
  const displayImage = selectedImage || selectedVariant?.image_url || product.primary_image || PLACEHOLDER;
  const allMedia = Array.from(new Set([
    selectedVariant?.image_url,
    ...(product.images || []),
    product.primary_image,
  ].filter(Boolean) as string[]));

  const price = Number(selectedVariant?.price || selectedVariant?.effective_price || product.base_price);
  const inStock = selectedVariant ? selectedVariant.stock_quantity > 0 : product.total_stock > 0;
  const stockCount = selectedVariant?.stock_quantity ?? product.total_stock;

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <div className="flex-1">
        <nav className="mx-auto max-w-7xl px-6 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Link to="/" className="hover:text-ink transition">Home</Link> /{" "}
            <Link to="/shop" className="hover:text-ink transition">Shop</Link> /{" "}
            <span className="text-ink">{product.name}</span>
          </p>
        </nav>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper">
              {isVideo(displayImage) ? (
                <video
                  key={displayImage}
                  src={displayImage}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={displayImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                onClick={() => toggleWishlist(product.slug)}
                className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-bone/90 ring-1 ring-ink/5 cursor-pointer z-10"
              >
                <Heart className={`size-5 ${isWishlisted ? "fill-red-500 stroke-red-500" : ""}`} />
              </button>
            </div>
            
            {allMedia.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {allMedia.map((media) => (
                  <button
                    key={media}
                    onClick={() => setSelectedImage(media)}
                    className={`relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                      displayImage === media ? "border-ink" : "border-transparent hover:border-ink/20"
                    }`}
                  >
                    {isVideo(media) ? (
                      <video src={media} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={media} alt="Thumbnail" className="h-full w-full object-cover" />
                    )}
                    {isVideo(media) && (
                      <div className="absolute inset-0 grid place-items-center bg-black/10">
                        <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">Video</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 flex flex-col">
              <p className="eyebrow text-muted-foreground">{product.category_name || "Uncategorized"}</p>
              <h1 className="font-display mt-3 text-4xl font-medium tracking-tight md:text-5xl">{product.name}</h1>
              <p className="mt-6 font-display text-3xl font-medium">{formatPrice(price)}</p>

              {colors.length > 0 && (
                <div className="mt-8">
                  <p className="eyebrow mb-3">Color — {selectedVariant?.attributes?.color || "Select"}</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorSelect(c)}
                        className={`px-4 py-2 rounded-md border text-sm font-medium cursor-pointer transition ${
                          selectedVariant?.attributes?.color === c
                            ? "border-ink bg-ink text-bone"
                            : "border-ink/15 hover:border-ink"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mt-6">
                  <p className="eyebrow mb-3">Size</p>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((s) => {
                      const variant = findVariant(s, selectedVariant?.attributes?.color);
                      const available = variant && variant.stock_quantity > 0;
                      return (
                        <button
                          key={s}
                          disabled={!available}
                          onClick={() => handleSizeSelect(s)}
                          className={`h-12 rounded-md border text-sm font-semibold cursor-pointer transition ${
                            selectedVariant?.attributes?.size === s
                              ? "border-ink bg-ink text-bone"
                              : available
                                ? "border-ink/15 hover:border-ink"
                                : "border-ink/5 text-muted-foreground/40 cursor-not-allowed line-through"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Qty</span>
                <div className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 cursor-pointer">−</button>
                  <span className="min-w-6 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                    disabled={quantity >= stockCount}
                    className="px-2 cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || adding}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 text-[12px] font-semibold uppercase tracking-widest text-bone transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {adding ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock || adding}
                  className="inline-flex h-14 items-center justify-center rounded-full border border-ink/15 px-8 text-[12px] font-semibold uppercase tracking-widest transition hover:border-ink disabled:opacity-50 cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              <p className={`mt-4 flex items-center gap-2 text-[12px] ${inStock ? "text-emerald-700" : "text-red-600"}`}>
                <span className={`inline-block size-1.5 rounded-full ${inStock ? "bg-emerald-600" : "bg-red-600"}`} />
                {inStock ? `${stockCount} in stock — ships within 2-3 days` : "Currently out of stock"}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/5 pt-6">
                <TrustChip icon={<Truck className="size-4" />} text="Free shipping over ₹5000" />
                <TrustChip icon={<RotateCcw className="size-4" />} text="Easy returns" />
                <TrustChip icon={<ShieldCheck className="size-4" />} text="Secure checkout" />
              </div>

              {product.description && (
                <div className="mt-10 border-t border-ink/5 pt-6">
                  <p className="eyebrow mb-3">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-16 border-t border-ink/5">
            <h2 className="font-display text-3xl font-medium mb-10">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.slug} to="/product/$id" params={{ id: p.slug }} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-paper">
                    <img src={p.primary_image || PLACEHOLDER} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(Number(p.base_price))}</p>
                </Link>
              ))}
            </div>
          </section>
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
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{text}</p>
    </div>
  );
}
