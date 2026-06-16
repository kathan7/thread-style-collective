import { Search, Heart, ShoppingBag, User } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/5 bg-bone/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <a href="/" className="font-display text-[22px] font-semibold uppercase tracking-tight">
            Thread<span className="italic font-medium">market</span>
          </a>
          <nav className="hidden gap-7 md:flex">
            {[
              ["Women", "/shop"],
              ["Men", "/shop"],
              ["Collections", "/shop"],
              ["Designers", "/sellers"],
              ["Journal", "/journal"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-medium tracking-wide text-ink/80 transition-colors hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden h-9 items-center gap-2 rounded-full bg-paper px-4 text-sm text-muted-foreground ring-1 ring-ink/5 transition focus-within:ring-ink/30 lg:flex">
            <Search className="size-4" />
            <span>Search collections...</span>
          </button>
          <button className="md:hidden" aria-label="Search">
            <Search className="size-5" />
          </button>
          <a href="/wishlist" aria-label="Wishlist" className="hidden md:block">
            <Heart className="size-5" />
          </a>
          <a href="/auth" aria-label="Account" className="hidden md:block">
            <User className="size-5" />
          </a>
          <a
            href="/cart"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium tracking-wide text-bone ring-1 ring-ink"
          >
            <ShoppingBag className="size-4" />
            <span>Cart (0)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
