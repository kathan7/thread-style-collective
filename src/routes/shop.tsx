import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal, Search, ArrowUpDown, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "../components/product-card";
import { useMarketplace } from "../hooks/use-marketplace";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — THREADMARKET" },
      { name: "description", content: "Browse our collection of clothing and accessories." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { products, categories, productsLoading } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState<"none" | "low-to-high" | "high-to-low">("none");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  let filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (p.category_name || "").toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (priceSort === "low-to-high") {
    filtered = [...filtered].sort((a, b) => Number(a.base_price) - Number(b.base_price));
  } else if (priceSort === "high-to-low") {
    filtered = [...filtered].sort((a, b) => Number(b.base_price) - Number(a.base_price));
  }

  const activeFiltersCount = (selectedCategory !== "All" ? 1 : 0) + (priceSort !== "none" ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceSort("none");
    setSearchQuery("");
  };

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      <section className="mx-auto max-w-7xl w-full px-6 py-16">
        <p className="eyebrow text-muted-foreground">Shop</p>
        <h1 className="font-display mt-3 text-balance text-5xl font-medium tracking-tight md:text-6xl">
          Our collection
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {productsLoading ? "Loading..." : `${filtered.length} product${filtered.length === 1 ? "" : "s"} available`}
        </p>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ink/5 pb-6 mb-10">
          <div className="flex flex-wrap gap-1.5 max-w-2xl">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/10 bg-paper/50 text-ink/75 hover:border-ink/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-full border border-ink/10 bg-paper text-xs text-ink focus:outline-none focus:border-ink w-full md:w-48 transition-all focus:w-64"
              />
              <Search className="size-3.5 text-muted-foreground absolute left-3.5 top-3.5" />
            </div>

            <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
              <SheetTrigger asChild>
                <button className="h-10 cursor-pointer inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 text-[11px] font-semibold uppercase tracking-wider hover:border-ink transition-colors">
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-ink text-[9px] text-bone font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="flex h-full w-full flex-col bg-bone text-ink sm:max-w-md border-l border-ink/10 p-6">
                <SheetHeader className="border-b border-ink/5 pb-4">
                  <SheetTitle className="font-display text-2xl font-medium">Filters</SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">Filter by category and price</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-6 space-y-8">
                  <div className="space-y-3">
                    <p className="eyebrow text-[9px] text-muted-foreground">Category</p>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryNames.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`h-10 text-[11px] font-semibold uppercase tracking-wider rounded border transition cursor-pointer ${
                            selectedCategory.toLowerCase() === cat.toLowerCase()
                              ? "border-ink bg-ink text-bone"
                              : "border-ink/10 bg-paper hover:border-ink/30"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="eyebrow text-[9px] text-muted-foreground">Price</p>
                    {[
                      { type: "none", label: "Default" },
                      { type: "low-to-high", label: "Low to High" },
                      { type: "high-to-low", label: "High to Low" },
                    ].map((sortOption) => (
                      <button
                        key={sortOption.type}
                        onClick={() => setPriceSort(sortOption.type as typeof priceSort)}
                        className={`h-11 w-full text-xs px-4 flex items-center justify-between rounded border transition cursor-pointer ${
                          priceSort === sortOption.type
                            ? "border-ink bg-ink text-bone font-semibold"
                            : "border-ink/10 bg-paper hover:border-ink/30"
                        }`}
                      >
                        {sortOption.label}
                        <ArrowUpDown className="size-3.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-ink/10 pt-4 flex gap-3">
                  <button onClick={resetFilters} className="flex-1 h-11 rounded-full border border-ink/15 text-[11px] font-semibold uppercase tracking-wider hover:border-ink transition cursor-pointer">
                    Reset
                  </button>
                  <button onClick={() => setFilterDrawerOpen(false)} className="flex-1 h-11 rounded-full bg-ink text-bone text-[11px] font-semibold uppercase tracking-wider hover:opacity-90 transition cursor-pointer">
                    Apply
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {productsLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-paper/50 border border-ink/5 rounded-2xl">
            <h3 className="font-display text-2xl font-medium mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              {products.length === 0
                ? "No products listed yet. The admin can add products from the admin panel."
                : "Try adjusting your filters or search."}
            </p>
            {products.length > 0 && (
              <button onClick={resetFilters} className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone cursor-pointer">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
