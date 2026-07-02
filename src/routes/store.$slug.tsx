import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/store/$slug")({
  component: StoreRedirect,
});

function StoreRedirect() {
  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium mb-4">Shop our collection</h1>
          <Link to="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone">
            Browse All Products
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
