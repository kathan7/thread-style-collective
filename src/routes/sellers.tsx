import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/sellers")({
  component: SellersRedirect,
});

function SellersRedirect() {
  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium mb-4">Shop our collection</h1>
          <p className="text-muted-foreground mb-8">Browse all products in our store.</p>
          <Link to="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
            Go to Shop
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
