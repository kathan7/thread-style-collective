import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import { ProductCard } from "../components/product-card";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — THREADMARKET" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { products, wishlist, productsLoading } = useMarketplace();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-medium tracking-tight mb-2">Wishlist</h1>
        <p className="text-muted-foreground mb-10">{wishlistedProducts.length} saved item{wishlistedProducts.length !== 1 ? "s" : ""}</p>

        {productsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="text-center py-20 bg-paper/50 border border-ink/5 rounded-2xl">
            <Heart className="size-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-medium mb-2">Your wishlist is empty</p>
            <Link to="/shop" className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone mt-4">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
