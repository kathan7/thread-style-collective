import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { ProductCard } from "../components/product-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion } from "framer-motion";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Collection Wishlist — THREADMARKET" },
      { name: "description", content: "View your curated selection of authenticated design fashion." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, products } = useMarketplace();

  // Filter approved products that are in the user's wishlist
  const wishlistedProducts = products.filter(
    (p) => p.status === "approved" && wishlist.includes(p.id)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="eyebrow text-muted-foreground">My Archive</p>
          <h1 className="font-display mt-3 text-balance text-5xl font-medium tracking-tight md:text-6xl">
            Saved pieces.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {wishlistedProducts.length === 0 
              ? "No items saved to your collection." 
              : `${wishlistedProducts.length} curated luxury ${wishlistedProducts.length === 1 ? "piece" : "pieces"} bookmarked.`
            }
          </p>
        </header>

        {wishlistedProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center py-20 bg-paper/50 rounded-2xl border border-ink/5"
          >
            <div className="size-16 rounded-full border border-ink/10 flex items-center justify-center bg-bone mb-6">
              <Heart className="size-6 text-muted-foreground/60 animate-pulse" />
            </div>
            <h2 className="font-display text-2xl font-medium mb-3">Your wishlist is empty.</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Keep track of items you admire. Tap the heart icon on any product to add them to your archive.
            </p>
            <a
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-[11px] font-semibold uppercase tracking-widest text-bone hover:opacity-90 transition"
            >
              Discover Collections
            </a>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4"
          >
            {wishlistedProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
