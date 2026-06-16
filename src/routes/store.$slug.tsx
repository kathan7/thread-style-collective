import { createFileRoute, notFound } from "@tanstack/react-router";
import { BadgeCheck, Instagram, Globe, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSeller, products } from "@/lib/catalog";

export const Route = createFileRoute("/store/$slug")({
  loader: ({ params }) => {
    const seller = getSeller(params.slug);
    if (!seller) throw notFound();
    return { seller };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.seller.name} — Designer Storefront | THREADMARKET` },
          { name: "description", content: loaderData.seller.bio },
          { property: "og:title", content: `${loaderData.seller.name} on THREADMARKET` },
          { property: "og:description", content: loaderData.seller.bio },
          { property: "og:image", content: loaderData.seller.banner },
        ]
      : [],
  }),
  component: StorePage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-bone"><p className="font-display text-3xl">Store not found.</p></div>
  ),
});

function StorePage() {
  const { seller } = Route.useLoaderData();
  const storeProducts = [...products, ...products].slice(0, 8);

  return (
    <div className="bg-bone text-ink">
      <SiteHeader />

      {/* Banner */}
      <div className="relative h-[44vh] w-full overflow-hidden bg-ink/5">
        <img src={seller.banner} alt={`${seller.name} banner`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bone via-bone/20 to-transparent" />
      </div>

      {/* Identity */}
      <section className="mx-auto -mt-20 max-w-7xl px-6">
        <div className="relative flex flex-col items-start gap-6 rounded-2xl bg-bone p-8 shadow-editorial ring-1 ring-ink/5 md:flex-row md:items-end md:justify-between">
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
                {seller.city} · ★ {seller.rating} · {seller.productCount} pieces · {seller.followers} followers
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex h-11 items-center rounded-full border border-ink/15 px-6 text-[11px] font-medium uppercase tracking-widest hover:border-ink">
              Message
            </button>
            <button className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-[11px] font-medium uppercase tracking-widest text-bone">
              Follow Brand
            </button>
          </div>
        </div>
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
                <a href="#" className="flex items-center gap-3 hover:text-ink"><Instagram className="size-4" /> @{seller.slug}</a>
                <a href="#" className="flex items-center gap-3 hover:text-ink"><Globe className="size-4" /> {seller.slug}.com</a>
                <a href="#" className="flex items-center gap-3 hover:text-ink"><Mail className="size-4" /> hello@{seller.slug}.com</a>
              </div>
              <div className="mt-6 border-t border-ink/10 pt-6 text-[12px] text-muted-foreground">
                Member since 2024 · {seller.productCount} pieces shipped to 42 countries
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
            <div className="hidden gap-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground md:flex">
              <button className="text-ink">All</button>
              <button>New</button>
              <button>Outerwear</button>
              <button>Accessories</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {storeProducts.map((p, i) => (
              <a key={i} href={`/product/${p.id}`} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-paper">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4">
                  <h3 className="truncate text-sm font-medium">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">${p.price.toLocaleString()}</p>
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
