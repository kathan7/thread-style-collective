import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Instagram, Globe, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import { ProductCard } from "../components/product-card";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/store/$slug")({
  loader: ({ params }) => {
    return { slug: params.slug };
  },
  component: StorePage,
});

function StorePage() {
  const { slug } = Route.useLoaderData();
  const { sellers, products, followedSellers, followSeller } = useMarketplace();

  // Find live seller details
  const seller = sellers.find((s) => s.slug === slug);
  
  // Filter approved products belonging to this seller
  const storeProducts = seller 
    ? products.filter((p) => p.sellerSlug === seller.slug && p.status === "approved")
    : [];

  const isFollowing = seller ? followedSellers.includes(seller.slug) : false;

  const handleFollowClick = () => {
    if (!seller) return;
    followSeller(seller.slug);
    if (!isFollowing) {
      toast.success(`Now following ${seller.name}`);
    } else {
      toast.info(`No longer following ${seller.name}`);
    }
  };

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

      <div className="flex-1">
        {!seller ? (
          <div className="grid min-h-[60vh] place-items-center">
            <div className="text-center py-20">
              <p className="eyebrow text-muted-foreground">Catalog Error</p>
              <h1 className="font-display text-3xl font-medium mt-3 mb-6">Storefront not found.</h1>
              <Link to="/sellers" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
                Explore boutiques
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Banner */}
            <div className="relative h-[44vh] w-full overflow-hidden bg-ink/5">
              <motion.img 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src={seller.banner} 
                alt={`${seller.name} banner`} 
                className="h-full w-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bone via-bone/20 to-transparent" />
            </div>

            {/* Identity Profile card */}
            <section className="mx-auto -mt-20 max-w-7xl px-6 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-start gap-6 rounded-2xl bg-bone p-8 shadow-editorial ring-1 ring-ink/5 md:flex-row md:items-end md:justify-between"
              >
                <div className="flex items-end gap-6">
                  <div className="grid size-28 shrink-0 place-items-center rounded-full border-4 border-bone bg-ink text-bone shadow-md">
                    <span className="font-display text-3xl font-medium">{seller.initials}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-5xl font-medium tracking-tight">{seller.name}</h1>
                      <BadgeCheck className="size-6 text-ink/60" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {seller.city} · ★ {seller.rating} · {storeProducts.length} pieces · {seller.followers} followers
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <a 
                    href={`mailto:hello@${seller.slug}.com`}
                    className="flex-1 md:flex-none inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-[11px] font-semibold uppercase tracking-widest hover:border-ink hover:bg-paper/40 transition cursor-pointer"
                  >
                    Message
                  </a>
                  
                  {/* Animated Follow Toggle button */}
                  <button
                    onClick={handleFollowClick}
                    className={`flex-1 md:flex-none inline-flex h-11 items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-widest cursor-pointer transition-all ${
                      isFollowing 
                        ? "bg-paper text-ink border border-ink/15 hover:bg-bone hover:border-ink" 
                        : "bg-ink text-bone border border-ink hover:opacity-90"
                    }`}
                  >
                    <motion.span
                      key={isFollowing ? "following" : "follow"}
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isFollowing ? "Following Brand" : "Follow Brand"}
                    </motion.span>
                  </button>
                </div>
              </motion.div>
            </section>

            {/* About + Socials */}
            <section className="mx-auto max-w-7xl px-6 py-20">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="eyebrow text-muted-foreground">About the Atelier</p>
                  <p className="font-display mt-4 text-balance text-3xl font-medium leading-snug tracking-tight md:text-4xl">
                    {seller.bio}
                  </p>
                </div>
                <div className="lg:col-span-5">
                  <div className="rounded-2xl bg-paper p-6">
                    <p className="eyebrow text-muted-foreground">Elsewhere</p>
                    <div className="mt-4 flex flex-col gap-3 text-sm">
                      <a href="#" className="flex items-center gap-3 hover:text-ink transition"><Instagram className="size-4" /> @{seller.slug}</a>
                      <a href="#" className="flex items-center gap-3 hover:text-ink transition"><Globe className="size-4" /> {seller.slug}.com</a>
                      <a href="#" className="flex items-center gap-3 hover:text-ink transition"><Mail className="size-4" /> hello@{seller.slug}.com</a>
                    </div>
                    <div className="mt-6 border-t border-ink/10 pt-6 text-[12px] text-muted-foreground">
                      Member since 2024 · Pieces shipped to 42 countries
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Products grid */}
            <section className="border-t border-ink/5 bg-bone">
              <div className="mx-auto max-w-7xl px-6 py-20">
                <div className="mb-10 flex items-end justify-between">
                  <h2 className="font-display text-4xl font-medium tracking-tight">The Collection</h2>
                  <div className="hidden gap-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground md:flex">
                    <button className="text-ink cursor-pointer">All</button>
                    <button className="cursor-pointer">New</button>
                    <button className="cursor-pointer">Outerwear</button>
                    <button className="cursor-pointer">Accessories</button>
                  </div>
                </div>
                
                {storeProducts.length === 0 ? (
                  <div className="text-center py-16 bg-paper rounded-xl border border-ink/5">
                    <p className="text-xs text-muted-foreground">This atelier has no approved pieces in catalog currently.</p>
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4"
                  >
                    {storeProducts.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </motion.div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
