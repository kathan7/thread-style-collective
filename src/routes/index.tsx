import { createFileRoute } from "@tanstack/react-router";
import { Heart, Star, ArrowUpRight, Truck, RotateCcw, Lock, BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { categories, products, sellers } from "@/lib/catalog";
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
    <div className="bg-bone text-ink">
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
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden bg-paper">
      <img
        src={heroEditorial}
        alt="Editorial fashion campaign featuring an oversized charcoal wool coat"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover animate-fade"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent" />
      <div className="absolute left-6 top-24 z-10 hidden md:block">
        <p className="eyebrow text-bone/80">Edition 04 · Winter 2026</p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="max-w-3xl text-bone animate-reveal">
          <h1 className="font-display text-balance text-6xl font-medium leading-[0.92] tracking-tighter md:text-[120px]">
            The Archive of<br />
            <span className="italic font-normal">Modern Objects.</span>
          </h1>
          <p className="mt-8 max-w-[44ch] text-pretty text-lg leading-relaxed text-bone/80">
            A curated assembly of global multi-vendor luxury. Sourced for the discerning, authenticated for the permanent collection.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full bg-bone px-8 text-[12px] font-medium uppercase tracking-widest text-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop the Collection
            </a>
            <a
              href="/sellers"
              className="inline-flex h-12 items-center justify-center rounded-full border border-bone/30 bg-bone/5 px-8 text-[12px] font-medium uppercase tracking-widest text-bone backdrop-blur-md transition-colors hover:bg-bone/15"
            >
              Explore Designers
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Free Global Shipping", "14-Day Returns", "Authenticated", "Carbon Neutral", "Verified Sellers", "Concierge 24/7"];
  return (
    <div className="overflow-hidden border-y border-ink/5 bg-ink py-4 text-bone">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="mx-8 text-[11px] font-medium uppercase tracking-[0.3em] text-bone/60">
            {it} <span className="ml-8 text-bone/30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryStrip() {
  return (
    <section className="border-b border-ink/5 bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">Edit by Category</p>
            <h2 className="font-display mt-2 text-balance text-4xl font-medium tracking-tight md:text-5xl">
              Shop by intention.
            </h2>
          </div>
          <a href="/shop" className="hidden text-[12px] font-medium uppercase tracking-widest underline underline-offset-4 md:inline">View all categories</a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <a key={c.slug} href={`/shop`} className="group">
              <div className="aspect-square overflow-hidden rounded-lg bg-paper">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-widest">{c.name}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trending() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">Curated Selection</p>
            <h2 className="font-display mt-2 text-balance text-5xl font-medium tracking-tight md:text-6xl">
              Trending pieces.
            </h2>
          </div>
          <a href="/shop" className="text-[12px] font-medium uppercase tracking-widest underline underline-offset-4">
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: typeof products[number] }) {
  return (
    <a href={`/product/${product.id}`} className="group relative block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={1067}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-bone/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-xs">
            {product.tag}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-bone/80 ring-1 ring-ink/5 backdrop-blur-xs transition-colors hover:bg-bone"
        >
          <Heart className="size-4" />
        </button>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-bone/95 p-4 backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0">
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest">
            <span>Quick View</span>
            <ArrowUpRight className="size-4" />
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{product.seller}</p>
          <h3 className="mt-1.5 truncate text-base font-medium">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="size-3 fill-ink stroke-ink" />
            <span className="font-medium text-ink">{product.rating}</span>
            <span>· {product.reviews}</span>
          </div>
        </div>
        <p className="shrink-0 font-display text-lg font-medium">${product.price.toLocaleString()}</p>
      </div>
    </a>
  );
}

function EditorialSplit() {
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-1 px-6 py-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bone lg:aspect-[5/6]">
            <img src={arrival1} alt="New arrival editorial" loading="lazy" width={1200} height={1500} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col justify-between lg:col-span-5">
          <div className="pt-10 lg:pt-20">
            <p className="eyebrow text-muted-foreground">New Arrivals — Volume 02</p>
            <h2 className="font-display mt-4 text-balance text-5xl font-medium leading-tight tracking-tight md:text-6xl">
              <span className="italic">Soft</span> structure.<br />
              Permanent silhouettes.
            </h2>
            <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
              This season we collected forty-two pieces from twelve ateliers across Europe and Japan — each piece numbered, each authenticated, each shipped with a permanent provenance card.
            </p>
            <a
              href="/shop"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-[12px] font-medium uppercase tracking-widest text-bone"
            >
              Browse the Volume
            </a>
          </div>
          <div className="mt-8 hidden aspect-[4/5] overflow-hidden rounded-lg bg-bone lg:block">
            <img src={arrival2} alt="Fabric detail" loading="lazy" width={1200} height={1500} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSellers() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">The Collective</p>
            <h2 className="font-display mt-2 text-balance text-5xl font-medium tracking-tight">
              Featured boutiques.
            </h2>
          </div>
          <a href="/sellers" className="text-[12px] font-medium uppercase tracking-widest underline underline-offset-4">
            All designers
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {sellers.map((s) => (
            <a
              key={s.slug}
              href={`/store/${s.slug}`}
              className="group flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-ink/5 transition-shadow hover:shadow-editorial"
            >
              <div className="relative h-36 overflow-hidden rounded-xl bg-ink/5">
                <img src={s.banner} alt={`${s.name} banner`} loading="lazy" width={800} height={400} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute -bottom-7 left-6 grid size-16 place-items-center rounded-full border-4 border-paper bg-ink text-bone shadow-sm">
                  <span className="font-display text-base font-medium">{s.initials}</span>
                </div>
              </div>
              <div className="mt-10 px-2 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display text-xl font-medium">{s.name}</h4>
                      <BadgeCheck className="size-4 text-ink/60" />
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {s.city} · ★ {s.rating}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-bone">
                    Follow
                  </span>
                </div>
                <div className="mt-6 flex justify-between text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  <span>{s.productCount} Pieces</span>
                  <span>{s.followers} Followers</span>
                </div>
              </div>
            </a>
          ))}
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
    <section className="border-y border-ink/5 bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <Icon className="size-6 text-ink" strokeWidth={1.5} />
              <p className="font-display text-xl font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
