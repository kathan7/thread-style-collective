import { createFileRoute } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { products, categories } from "@/lib/catalog";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop the Collection — THREADMARKET" },
      { name: "description", content: "Browse curated luxury fashion from verified designers and boutiques worldwide." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const grid = [...products, ...products];
  return (
    <div className="bg-bone text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="eyebrow text-muted-foreground">Shop · All Collections</p>
        <h1 className="font-display mt-3 text-balance text-6xl font-medium tracking-tight md:text-7xl">
          The full catalogue.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {grid.length} pieces from {categories.length} categories across {3} verified ateliers.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex flex-wrap gap-2">
          {["All", ...categories.map((c) => c.name)].map((c, i) => (
            <button
              key={c}
              className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-widest transition ${i === 0 ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {grid.map((p, i) => (
            <a key={i} href={`/product/${p.id}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <button className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-bone/80 ring-1 ring-ink/5 backdrop-blur-xs">
                  <Heart className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="eyebrow text-muted-foreground">{p.seller}</p>
                  <h3 className="mt-1 truncate text-sm font-medium">{p.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Star className="size-3 fill-ink stroke-ink" /> {p.rating}
                  </div>
                </div>
                <p className="font-display text-base font-medium">${p.price.toLocaleString()}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
