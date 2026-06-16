import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { sellers } from "@/lib/catalog";

export const Route = createFileRoute("/sellers")({
  head: () => ({
    meta: [
      { title: "Designers & Boutiques — THREADMARKET" },
      { name: "description", content: "Discover verified independent designers and boutiques on THREADMARKET." },
    ],
  }),
  component: SellersPage,
});

function SellersPage() {
  return (
    <div className="bg-bone text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="eyebrow text-muted-foreground">The Collective</p>
        <h1 className="font-display mt-3 text-balance text-6xl font-medium tracking-tight md:text-7xl">
          Verified designers.<br /><span className="italic">From everywhere.</span>
        </h1>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...sellers, ...sellers].map((s, i) => (
            <a key={i} href={`/store/${s.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5 transition hover:shadow-editorial">
              <div className="relative h-44 overflow-hidden bg-ink/5">
                <img src={s.banner} alt={`${s.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display text-2xl font-medium">{s.name}</h3>
                      <BadgeCheck className="size-4 text-ink/60" />
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">{s.city} · ★ {s.rating}</p>
                  </div>
                  <span className="rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-bone">Follow</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{s.bio}</p>
                <div className="mt-auto flex justify-between border-t border-ink/5 pt-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  <span>{s.productCount} Pieces</span>
                  <span>{s.followers} Followers</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
