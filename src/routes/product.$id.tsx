import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heart, Star, BadgeCheck, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProduct, products } from "@/lib/catalog";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — ${loaderData.product.seller} | THREADMARKET` },
          { name: "description", content: `${loaderData.product.name} by ${loaderData.product.seller}. Curated multi-vendor luxury on THREADMARKET.` },
          { property: "og:title", content: `${loaderData.product.name} — ${loaderData.product.seller}` },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-bone">
      <p className="font-display text-3xl">Product not found.</p>
    </div>
  ),
});

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = [
  { name: "Bone", hex: "#f5f4f0" },
  { name: "Charcoal", hex: "#2b2b2c" },
  { name: "Ink", hex: "#111110" },
];
const TABS = ["Description", "Reviews", "Shipping", "Returns"] as const;

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(COLORS[1].name);
  const [tab, setTab] = useState<typeof TABS[number]>("Description");
  const gallery = [product.image, product.image, product.image, product.image];
  const [active, setActive] = useState(0);
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="bg-bone text-ink">
      <SiteHeader />

      <nav className="mx-auto max-w-7xl px-6 pt-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          <a href="/" className="hover:text-ink">Home</a> / <a href="/shop" className="hover:text-ink">Shop</a> / <a href="/shop" className="hover:text-ink">{product.category}</a> / <span className="text-ink">{product.name}</span>
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
                  className={`aspect-[3/4] overflow-hidden rounded-md bg-paper ring-1 transition ${active === i ? "ring-ink" : "ring-ink/10 hover:ring-ink/40"}`}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="group relative flex-1 overflow-hidden rounded-lg bg-paper">
              <img
                src={gallery[active]}
                alt={product.name}
                width={1200}
                height={1600}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <button
                aria-label="Wishlist"
                className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-bone/90 ring-1 ring-ink/5 backdrop-blur-xs transition hover:bg-bone"
              >
                <Heart className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-bone">Verified Atelier</span>
              <a href={`/store/${product.sellerSlug}`} className="eyebrow text-muted-foreground hover:text-ink">
                By {product.seller}
              </a>
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
              <span className="text-muted-foreground">
                {product.rating} · {product.reviews} reviews
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
                    className={`size-9 rounded-full ring-2 ring-offset-2 ring-offset-bone transition ${color === c.name ? "ring-ink" : "ring-transparent"}`}
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
                <button className="text-[11px] font-medium uppercase tracking-widest underline underline-offset-4 text-muted-foreground">Size guide</button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-12 rounded-md border text-sm font-medium transition ${size === s ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3">
              <button className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 text-[12px] font-semibold uppercase tracking-[0.2em] text-bone transition hover:opacity-90">
                Add to Cart
              </button>
              <button className="inline-flex h-14 items-center justify-center rounded-full border border-ink/15 bg-bone px-8 text-[12px] font-semibold uppercase tracking-[0.2em] transition hover:border-ink">
                Buy Now
              </button>
            </div>

            {/* Stock */}
            <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-emerald-600" /> In stock — ships within 48 hours
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
                    className={`pb-3 text-[12px] font-semibold uppercase tracking-widest transition ${tab === t ? "border-b border-ink text-ink" : "text-muted-foreground hover:text-ink"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="prose-sm mt-6 max-w-none text-sm leading-relaxed text-muted-foreground">
                {tab === "Description" && (
                  <p>
                    Crafted from 100% ethically sourced Merino wool with cupro lining. Sculpted shoulders, drop-cut sleeves, and a single horn button at the lapel. Each piece is numbered and limited to a run of 50, hand-finished in {product.seller}'s atelier.
                  </p>
                )}
                {tab === "Reviews" && (
                  <p>{product.reviews} verified reviews · average {product.rating} / 5. "Incredible weight and drape — feels like an heirloom." — Margot, Paris</p>
                )}
                {tab === "Shipping" && (
                  <p>Free express shipping worldwide via DHL. Orders before 14:00 CET ship same day. Delivery 2–5 business days. Tracked and insured.</p>
                )}
                {tab === "Returns" && (
                  <p>14-day free returns. Items must be unworn with original tags and packaging. Refunds processed within 3 business days of receipt.</p>
                )}
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
                <p className="text-sm text-muted-foreground">Verified Atelier · 248 pieces · 12.4k followers</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex h-11 items-center rounded-full border border-ink/15 px-6 text-[11px] font-medium uppercase tracking-widest transition hover:border-ink">
                Follow
              </button>
              <a
                href={`/store/${product.sellerSlug}`}
                className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-[11px] font-medium uppercase tracking-widest text-bone"
              >
                Visit Store
              </a>
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
              <a key={p.id} href={`/product/${p.id}`} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-paper">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <p className="eyebrow text-muted-foreground">{p.seller}</p>
                    <h3 className="mt-1 text-base font-medium">{p.name}</h3>
                  </div>
                  <p className="font-display text-lg font-medium">${p.price.toLocaleString()}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function TrustChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {icon}
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{text}</p>
    </div>
  );
}
