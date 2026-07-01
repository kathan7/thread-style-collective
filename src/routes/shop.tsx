import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Star, SlidersHorizontal, Search, X, ArrowUpDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "../components/product-card";
import { useMarketplace } from "../hooks/use-marketplace";
import { categories } from "@/lib/catalog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
  const { products } = useMarketplace();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState<"none" | "low-to-high" | "high-to-low">("none");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filter approved products dynamically
  const approvedProducts = products.filter((p) => p.status === "approved");

  // Apply filters and search queries
  let filtered = approvedProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Apply pricing sorts
  if (priceSort === "low-to-high") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (priceSort === "high-to-low") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  // Active filters count
  const activeFiltersCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (priceSort !== "none" ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceSort("none");
    setSearchQuery("");
  };

  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col justify-between">
      <SiteHeader />

      {/* Editorial Header */}
      <section className="mx-auto max-w-7xl w-full px-6 py-16">
        <p className="eyebrow text-muted-foreground">Shop · Collection Catalog</p>
        <h1 className="font-display mt-3 text-balance text-6xl font-medium tracking-tight md:text-7xl">
          The full catalogue.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Archiving {filtered.length} authenticated designer {filtered.length === 1 ? "piece" : "pieces"} from global ateliers.
        </p>
      </section>

      {/* Control Strip */}
      <section className="mx-auto max-w-7xl w-full px-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ink/5 pb-6 mb-10">

          {/* Category badges */}
          <div className="flex flex-wrap gap-1.5 max-w-2xl">
            {["All", ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition cursor-pointer ${selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/10 bg-paper/50 text-ink/75 hover:border-ink/30"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Drawer Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input bar */}
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-full border border-ink/10 bg-paper text-xs text-ink focus:outline-none focus:border-ink w-full md:w-48 transition-all focus:w-64"
              />
              <Search className="size-3.5 text-muted-foreground absolute left-3.5 top-3.5" />
            </div>

            {/* Radix Sheet Drawer */}
            <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
              <SheetTrigger asChild>
                <button className="h-10 cursor-pointer inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 text-[11px] font-semibold uppercase tracking-wider hover:border-ink hover:bg-bone transition-colors">
                  <SlidersHorizontal className="size-3.5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-ink text-[9px] text-bone font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="flex h-full w-full flex-col bg-bone text-ink sm:max-w-md border-l border-ink/10 p-6">
                <SheetHeader className="border-b border-ink/5 pb-4">
                  <SheetTitle className="font-display text-2xl font-medium tracking-tight">Vetting Filters</SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Refine catalog queries by category and financial layouts.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 space-y-8">
                  {/* Category select block inside drawer */}
                  <div className="space-y-3">
                    <p className="eyebrow text-[9px] text-muted-foreground">Design Intent</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["All", ...categories.map((c) => c.name)].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`h-10 text-[11px] font-semibold uppercase tracking-wider rounded border text-center transition cursor-pointer ${selectedCategory.toLowerCase() === cat.toLowerCase()
                              ? "border-ink bg-ink text-bone"
                              : "border-ink/10 bg-paper hover:border-ink/30"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing sort options */}
                  <div className="space-y-3">
                    <p className="eyebrow text-[9px] text-muted-foreground">Price Sorting</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { type: "none", label: "Default catalog layout" },
                        { type: "low-to-high", label: "Price: Low to High" },
                        { type: "high-to-low", label: "Price: High to Low" }
                      ].map((sortOption) => (
                        <button
                          key={sortOption.type}
                          onClick={() => setPriceSort(sortOption.type as any)}
                          className={`h-11 text-xs px-4 flex items-center justify-between rounded border text-left transition cursor-pointer ${priceSort === sortOption.type
                              ? "border-ink bg-ink text-bone font-semibold"
                              : "border-ink/10 bg-paper hover:border-ink/30 text-ink/85"
                            }`}
                        >
                          <span>{sortOption.label}</span>
                          <ArrowUpDown className="size-3.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Footer */}
                <div className="border-t border-ink/10 pt-4 flex gap-3">
                  <button
                    onClick={resetFilters}
                    className="flex-1 h-11 inline-flex items-center justify-center rounded-full border border-ink/15 text-[11px] font-semibold uppercase tracking-wider hover:border-ink transition cursor-pointer"
                  >
                    Reset Query
                  </button>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="flex-1 h-11 inline-flex items-center justify-center rounded-full bg-ink text-bone text-[11px] font-semibold uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Dynamic products list grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-paper/50 border border-ink/5 rounded-2xl">
            <h3 className="font-display text-2xl font-medium mb-2">No matching pieces.</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">We couldn't find any approved catalog entries fitting your search terms.</p>
            <button
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-widest text-bone cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
