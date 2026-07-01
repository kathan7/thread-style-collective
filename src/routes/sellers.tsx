import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useMarketplace } from "../hooks/use-marketplace";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const { sellers, followedSellers, followSeller } = useMarketplace();

  const approvedSellers = sellers.filter((s) => s.status === "approved");

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
        <section className="mx-auto max-w-7xl px-6 py-16">
          <p className="eyebrow text-muted-foreground">The Collective</p>
          <h1 className="font-display mt-3 text-balance text-6xl font-medium tracking-tight md:text-7xl">
            Verified designers.<br /><span className="italic">From everywhere.</span>
          </h1>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          {approvedSellers.length === 0 ? (
            <div className="text-center py-20 bg-paper/50 rounded-2xl border border-ink/5">
              <p className="text-xs text-muted-foreground">No approved ateliers are registered currently.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {approvedSellers.map((s, i) => {
                const isFollowing = followedSellers.includes(s.slug);
                return (
                  <motion.div
                    key={s.slug}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    className="group flex flex-col h-full overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5 transition hover:shadow-editorial"
                  >
                    {/* Header Image Link */}
                    <Link to="/store/$slug" params={{ slug: s.slug }} className="relative h-44 overflow-hidden bg-ink/5">
                      <motion.img
                        src={s.banner}
                        alt={s.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </Link>

                    {/* Card Content (Separated layout, no nested interactive elements) */}
                    <div className="flex flex-1 flex-col gap-4 p-6 justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link to="/store/$slug" params={{ slug: s.slug }} className="min-w-0 block">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-display text-2xl font-medium truncate hover:text-ink/75 transition">{s.name}</h3>
                              <BadgeCheck className="size-4 text-ink/60 shrink-0" />
                            </div>
                            <p className="mt-1 text-[12px] text-muted-foreground">{s.city} · ★ {s.rating}</p>
                          </Link>

                          <button
                            onClick={(e) => handleFollowClick(e, s.slug, s.name)}
                            className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest cursor-pointer transition-all shrink-0 active:scale-95 ${isFollowing
                                ? "bg-paper text-ink border border-ink/15 hover:bg-bone hover:border-ink"
                                : "bg-ink text-bone border border-ink hover:opacity-90"
                              }`}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </button>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light line-clamp-2">{s.bio}</p>
                      </div>

                      <div className="mt-auto flex justify-between border-t border-ink/5 pt-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        <span>{s.productCount} Pieces</span>
                        <span>{s.followers} Followers</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
