import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, RotateCcw, Lock, BadgeCheck, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import { ProductCard } from "../components/product-card";
import { motion } from "framer-motion";
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
              to="/auth"
              className="inline-flex h-13 items-center justify-center rounded-full border border-bone/25 bg-bone/5 px-8 text-[11px] font-semibold uppercase tracking-widest text-bone backdrop-blur-md transition hover:bg-bone/15 active:scale-98"
            >
              Create Account
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
            <p className="eyebrow text-muted-foreground">Categories</p>
            <h2 className="font-display mt-2 text-balance text-4xl font-medium tracking-tight md:text-5xl">
              Shop by category
            </h2>
          </div>
          <Link to="/shop" className="group text-[12px] font-semibold uppercase tracking-widest text-ink hover:text-ink/70 transition flex items-center gap-1.5">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">Categories will appear once products are added by admin.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                className="rounded-full border border-ink/10 bg-paper px-6 py-3 text-sm font-medium hover:border-ink hover:bg-ink hover:text-bone transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Trending() {
  const { products, productsLoading } = useMarketplace();
  const displayedProducts = products.slice(0, 6);

  return (
    <section className="bg-bone relative">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 border-b border-ink/5 pb-8">
          <p className="eyebrow text-muted-foreground">Latest Products</p>
          <h2 className="font-display mt-2 text-4xl font-medium tracking-tight md:text-5xl">Shop now</h2>
        </div>

        {productsLoading ? (
          <p className="text-muted-foreground text-center py-12">Loading products...</p>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-12 bg-paper/50 border border-ink/5 rounded-2xl">
            <p className="text-muted-foreground mb-4">No products listed yet.</p>
            <p className="text-sm text-muted-foreground">Admin can add products from the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProducts.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link to="/shop" className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-10 text-[11px] font-semibold uppercase tracking-widest text-bone hover:opacity-90 transition">
            View All Products
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
