import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import type { Product } from "../lib/types";
import { Link } from "@tanstack/react-router";
import { formatPrice } from "../lib/api";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80";

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useMarketplace();
  const isWishlisted = wishlist.includes(product.slug);
  const image = product.primary_image || PLACEHOLDER;
  const price = Number(product.base_price);
  const inStock = product.total_stock > 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay: index * 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group relative block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper">
        <Link to="/product/$id" params={{ id: product.slug }} className="relative block h-full w-full">
          <motion.img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-bone/95 p-4 backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0 z-10">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest">
              <span>Quick View</span>
              <ArrowUpRight className="size-4" />
            </div>
          </div>
        </Link>

        {!inStock && (
          <span className="absolute left-4 top-4 rounded-full bg-red-600/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white z-10">
            Out of Stock
          </span>
        )}

        <button
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-bone/80 ring-1 ring-ink/5 backdrop-blur-xs transition hover:bg-bone hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Heart className={`size-4 transition-colors ${isWishlisted ? "fill-red-500 stroke-red-500" : "text-ink"}`} />
        </button>
      </div>

      <Link to="/product/$id" params={{ id: product.slug }} className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{product.category_name || "Uncategorized"}</p>
          <h3 className="mt-1.5 truncate text-sm font-medium transition-colors group-hover:text-ink/75">
            {product.name}
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {inStock ? `${product.total_stock} in stock` : "Sold out"}
          </p>
        </div>
        <p className="shrink-0 font-display text-base font-medium">{formatPrice(price)}</p>
      </Link>
    </motion.div>
  );
}
