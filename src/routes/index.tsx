import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Star, ArrowUpRight, Truck, RotateCcw, Lock, BadgeCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import { ProductCard } from "../components/product-card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import heroEditorial from "@/assets/hero-editorial.jpg";
import arrival1 from "@/assets/arrival-1.jpg";
import arrival2 from "@/assets/arrival-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THREADMARKET — The Archive of Modern Luxury" },
      {
        name: "description",
        content:
          "A curated multi-vendor marketplace of independent luxury designers, boutiques and archival fashion. Authenticated. Shipped globally.",
      },
      { property: "og:title", content: "THREADMARKET — The Archive of Modern Luxury" },
      {
        property: "og:description",
        content: "A curated multi-vendor marketplace of independent luxury designers and boutiques.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="bg-bone text-ink min-h-screen selection:bg-ink selection:text-bone">
      <SiteHeader />
      <Hero />
      <Marquee />
      <CategoryStrip />
      <Trending />
      <EditorialSplit />
      <FeaturedSellers />
      <TrustStrip />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  return (
    <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden bg-paper">
      {/* Immersive background image with Ken Burns zoom effect */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 7, ease: [0.25, 1, 0.5, 1] }}
        className="absolute inset-0 h-full w-full"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source
            src="src/assets/1234blehj.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />

      <div className="absolute left-8 top-28 z-10 hidden md:block">
        <span className="inline-flex items-center gap-2 rounded-full border border-bone/35 bg-bone/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-bone/90 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-bone animate-pulse" />
          Edition 04 · Winter 2026
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-bone"
        >
          <motion.h1
            variants={itemVariants}
            className="font-display text-balance text-6xl font-medium leading-[0.92] tracking-tighter sm:text-[100px] md:text-[120px]"
          >
            The Archive of<br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className=" font-normal text-bone/90"
            >
              Modern Objects.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-[44ch] text-pretty text-lg leading-relaxed text-bone/80 font-light"
          >
            A curated assembly of global multi-vendor luxury. Sourced for the discerning, authenticated for the permanent collection.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/shop"
              className="group inline-flex h-13 items-center justify-center rounded-full bg-bone px-8 text-[11px] font-semibold uppercase tracking-widest text-ink transition hover:bg-paper active:scale-98 gap-2"
            >
              <span>Shop the Collection</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/sellers"
              className="inline-flex h-13 items-center justify-center rounded-full border border-bone/25 bg-bone/5 px-8 text-[11px] font-semibold uppercase tracking-widest text-bone backdrop-blur-md transition hover:bg-bone/15 active:scale-98"
            >
              Explore Designers
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating scroll down indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 opacity-45 hover:opacity-85 transition cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight - 60, behavior: "smooth" })}
        >
          <span className="text-[9px] font-semibold uppercase tracking-widest text-bone">Scroll</span>
          <div className="w-[1px] h-6 bg-bone" />
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Free Global Shipping", "14-Day Returns", "Authenticated", "Carbon Neutral", "Verified Sellers", "Concierge 24/7"];
  return (
    <div className="overflow-hidden border-y border-ink/5 bg-ink py-4.5 text-bone">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="mx-8 text-[10px] font-medium uppercase tracking-[0.3em] text-bone/60">
            {it} <span className="ml-8 text-bone/35 text-[8px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryStrip() {
  const { categories } = useMarketplace();

  return (
    <section className="border-b border-ink/5 bg-bone relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted-foreground">Explore by Category</p>
            <h2 className="font-display mt-2 text-balance text-4xl font-medium tracking-tight md:text-5xl">
              Shop by intention.
            </h2>
          </div>
          <Link
            to="/shop"
            className="group text-[12px] font-semibold uppercase tracking-widest text-ink hover:text-ink/70 transition flex items-center gap-1.5"
          >
            <span>View all categories</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7"
        >
          {categories.map((c) => (
            <motion.div
              key={c.slug}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
            >
              <Link to="/shop" className="group block text-center">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-paper ring-1 ring-ink/5 transition duration-500 group-hover:shadow-editorial group-hover:ring-ink/10">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle vignette on hover */}
                  <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/5" />
                </div>
                <p className="font-display italic mt-4 text-[13px] font-medium tracking-wide transition group-hover:text-ink/75">
                  {c.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

type TabType = "curated" | "new" | "rare";

function Trending() {
  const { products } = useMarketplace();
  const [activeTab, setActiveTab] = useState<TabType>("curated");

  const approved = products.filter((p) => p.status === "approved");

  // Dynamic products filtering based on interactive tabs
  const getFilteredProducts = () => {
    switch (activeTab) {
      case "new":
        // Show last 6 items
        return [...approved].slice(-6).reverse();
      case "rare":
        // Filter limited run items
        return approved.filter((p) => p.tag && ["rare", "archive", "limited"].includes(p.tag.toLowerCase())).slice(0, 6);
      case "curated":
      default:
        // High rating pieces
        return [...approved].sort((a, b) => b.rating - a.rating).slice(0, 6);
    }
  };

  const displayedProducts = getFilteredProducts();

  return (
    <section className="bg-bone relative">
      <div className="mx-auto max-w-7xl px-6 py-24">

        {/* Dynamic header row with tab controls */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ink/5 pb-8">
          <div>
            <p className="eyebrow text-muted-foreground">Curated Selection</p>
            <h2 className="font-display mt-2 text-balance text-4xl font-medium tracking-tight md:text-5xl">
              Trending pieces.
            </h2>
          </div>

          <div className="flex gap-4">
            {([
              { id: "curated", label: "Curated" },
              { id: "new", label: "New Arrivals" },
              { id: "rare", label: "Archival" }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-[11px] font-bold uppercase tracking-widest relative cursor-pointer transition ${activeTab === tab.id ? "text-ink" : "text-muted-foreground hover:text-ink"
                  }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Staggered load list grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {displayedProducts.map((p, i) => (
              <motion.div
                key={`${activeTab}-${p.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-10 text-[11px] font-semibold uppercase tracking-widest text-bone hover:opacity-90 active:scale-98 transition"
          >
            Explore Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}

function EditorialSplit() {
  return (
    <section className="bg-paper relative border-y border-ink/5">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-24 lg:grid-cols-12 lg:gap-16">

        {/* Editorial double framed image */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bone lg:aspect-[5/6] w-full shadow-editorial ring-1 ring-ink/5 group">
            <motion.img
              src={arrival1}
              alt="New arrival editorial"
              loading="lazy"
              width={1200}
              height={1500}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-102"
              initial={{ opacity: 0.9 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            />
            {/* Absolute badge */}
            <div className="absolute right-6 bottom-6 rounded bg-bone/90 p-4 backdrop-blur-xs text-[10px] uppercase font-bold tracking-widest shadow-sm border border-ink/5">
              Ref. 1290-A
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between lg:col-span-5 py-6">
          <div className="max-w-md">
            <p className="eyebrow text-muted-foreground">New Arrivals — Volume 02</p>
            <h2 className="font-display mt-4 text-balance text-4xl font-medium leading-tight tracking-tight md:text-5xl">
              <span className="italic">Soft</span> structure.<br />
              Permanent silhouettes.
            </h2>
            <p className="mt-6 text-pretty leading-relaxed text-muted-foreground text-sm font-light">
              This season we collected forty-two pieces from twelve ateliers across Europe and Japan — each piece numbered, each authenticated, each shipped with a permanent provenance card.
            </p>
            <div className="mt-10">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-[11px] font-semibold uppercase tracking-widest text-bone hover:opacity-90 active:scale-98 transition"
              >
                Browse the Volume
              </Link>
            </div>
          </div>

          <div className="mt-12 hidden aspect-[4/3] overflow-hidden rounded-xl bg-bone lg:block shadow-sm ring-1 ring-ink/5">
            <img
              src={arrival2}
              alt="Fabric detail zoom"
              loading="lazy"
              width={1200}
              height={1500}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSellers() {
  const { sellers, followedSellers, followSeller, products } = useMarketplace();

  // Show approved sellers
  const approvedSellers = sellers.filter((s) => s.status === "approved").slice(0, 3);

  const handleFollowClick = (e: React.MouseEvent, slug: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    followSeller(slug);
    const isFollowing = followedSellers.includes(slug);
    if (!isFollowing) {
      toast.success(`Now following ${name}`);
    } else {
      toast.info(`No longer following ${name}`);
    }
  };

  return (
    <section className="bg-bone relative">
      <div className="mx-auto max-w-7xl px-6 py-24">

        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted-foreground">The Collective</p>
            <h2 className="font-display mt-2 text-balance text-4xl font-medium tracking-tight md:text-5xl">
              Featured boutiques.
            </h2>
          </div>
          <Link
            to="/sellers"
            className="group text-[12px] font-semibold uppercase tracking-widest text-ink hover:text-ink/70 transition flex items-center gap-1.5"
          >
            <span>All designers Directory</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Premium storefront card grid layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {approvedSellers.map((s) => {
            const isFollowing = followedSellers.includes(s.slug);
            // Get 3 items of this seller for preview row
            const sellerPreviewProducts = products
              .filter((p) => p.sellerSlug === s.slug && p.status === "approved")
              .slice(0, 3);

            return (
              <div
                key={s.slug}
                className="group flex flex-col rounded-2xl bg-paper p-5 ring-1 ring-ink/5 hover:ring-ink/10 transition duration-500 hover:shadow-editorial"
              >
                {/* Header card area click goes to seller storefront */}
                <Link to="/store/$slug" params={{ slug: s.slug }} className="block">
                  <div className="relative h-36 overflow-hidden rounded-xl bg-ink/5">
                    <img
                      src={s.banner}
                      alt={`${s.name} banner`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-102"
                    />
                    <div className="absolute -bottom-6 left-6 grid size-14 place-items-center rounded-full border-4 border-paper bg-ink text-bone shadow-md">
                      <span className="font-display text-sm font-medium">{s.initials}</span>
                    </div>
                  </div>
                </Link>

                <div className="mt-8 px-1 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link to="/store/$slug" params={{ slug: s.slug }} className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display text-xl font-medium truncate group-hover:text-ink/75 transition">{s.name}</h4>
                          <BadgeCheck className="size-4 text-ink/60 shrink-0" />
                        </div>
                        <p className="mt-1 text-[11.5px] text-muted-foreground">
                          {s.city} · ★ {s.rating}
                        </p>
                      </Link>

                      <button
                        onClick={(e) => handleFollowClick(e, s.slug, s.name)}
                        className={`rounded-full px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-widest cursor-pointer transition-all shrink-0 active:scale-95 ${isFollowing
                          ? "bg-paper text-ink border border-ink/15 hover:bg-bone hover:border-ink"
                          : "bg-ink text-bone border border-ink hover:opacity-90"
                          }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>

                    <p className="mt-4 text-[12.5px] text-muted-foreground line-clamp-2 leading-relaxed font-light">
                      {s.bio}
                    </p>
                  </div>

                  {/* Brand dynamic items mini-preview row */}
                  {sellerPreviewProducts.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-ink/5">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Live Collection</p>
                      <div className="flex gap-2">
                        {sellerPreviewProducts.map((p) => (
                          <Link
                            key={p.id}
                            to="/product/$id"
                            params={{ id: p.id }}
                            className="aspect-[3/4] w-14 overflow-hidden rounded bg-bone border border-ink/5 hover:border-ink/20 transition group/thumb relative"
                          >
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover/thumb:scale-105" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-ink/5 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>{s.productCount} Pieces</span>
                    <span>{s.followers} Followers</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Truck, title: "Express Logistics", body: "Global carbon-neutral shipping." },
    { icon: RotateCcw, title: "Simple Returns", body: "14-day seamless collection." },
    { icon: Lock, title: "Encrypted Trade", body: "Secure luxury-level payments." },
    { icon: BadgeCheck, title: "Verified Sellers", body: "Every boutique strictly vetted." },
  ];
  return (
    <section className="bg-bone relative">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20 border-t border-ink/5">
        <div className="grid grid-cols-1 divide-y divide-ink/5 md:grid-cols-4 md:divide-y-0 md:divide-x">
          {items.map(({ icon: Icon, title, body }, idx) => (
            <div
              key={title}
              className={`flex flex-col items-start gap-3 py-6 md:py-0 ${idx === 0 ? "md:pr-8" : idx === 3 ? "md:pl-8" : "md:px-8"
                }`}
            >
              <Icon className="size-5.5 text-ink" strokeWidth={1.5} />
              <p className="font-display text-lg font-medium mt-1">{title}</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed font-light">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
