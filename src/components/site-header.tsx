import { useState } from "react";
import { Search, Heart, ShoppingBag, User, Plus, Minus, Trash2, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { 
    currentUser, 
    logout, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    wishlist 
  } = useMarketplace();

  const [cartOpen, setCartOpen] = useState(false);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

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
          {/* Search bar */}
          <a href="/shop" className="hidden h-9 items-center gap-2 rounded-full bg-paper px-4 text-sm text-muted-foreground ring-1 ring-ink/5 transition hover:ring-ink/25 lg:flex">
            <Search className="size-4" />
            <span>Search collection...</span>
          </a>
          <a href="/shop" className="lg:hidden" aria-label="Search">
            <Search className="size-5" />
          </a>

          {/* Wishlist */}
          <a href="/wishlist" aria-label="Wishlist" className="relative flex size-9 items-center justify-center rounded-full hover:bg-paper transition-colors">
            <Heart className={`size-5 ${wishlist.length > 0 ? "fill-ink" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-bone">
                {wishlist.length}
              </span>
            )}
          </a>

          {/* Account Dropdown or Auth Link */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-ink/10 bg-paper hover:bg-bone transition-colors" aria-label="User menu">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-bone border border-ink/10 text-ink shadow-editorial rounded-lg mt-1 mr-2" align="end">
                <DropdownMenuLabel className="font-sans text-xs text-muted-foreground font-normal">
                  Logged in as <span className="font-semibold text-ink">{currentUser.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-ink/5" />
                <DropdownMenuItem className="cursor-pointer hover:bg-paper gap-2 text-xs py-2" asChild>
                  <a href={`/dashboard/${currentUser.role}`}>
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard ({currentUser.role})</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-ink/5" />
                <DropdownMenuItem 
                  onClick={logout} 
                  className="cursor-pointer hover:bg-destructive/10 text-destructive hover:text-destructive gap-2 text-xs py-2"
                >
                  <LogOut className="size-3.5" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href="/auth" aria-label="Account" className="flex size-9 items-center justify-center rounded-full hover:bg-paper transition-colors">
              <User className="size-5" />
            </a>
          )}

          {/* Cart slide-out using Radix Sheet */}
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium tracking-wide text-bone ring-1 ring-ink hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="size-4" />
                <span>Cart ({cartItemCount})</span>
              </button>
            </SheetTrigger>
            <SheetContent className="flex h-full w-full flex-col bg-bone text-ink sm:max-w-md border-l border-ink/10 p-6">
              <SheetHeader className="border-b border-ink/5 pb-4">
                <SheetTitle className="font-display text-2xl font-medium tracking-tight">Your Archive</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Review the pieces curated in your custom order.
                </SheetDescription>
              </SheetHeader>

              {/* Cart items scroll list */}
              <div className="flex-1 overflow-y-auto py-4">
                {cart.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <ShoppingBag className="size-10 text-muted-foreground/45 mb-4" strokeWidth={1.2} />
                    <p className="font-display text-xl font-medium text-ink">Your cart is empty.</p>
                    <p className="mt-2 text-xs text-muted-foreground max-w-[28ch]">Explore the collections to add authenticated luxury pieces to your archive.</p>
                    <a
                      href="/shop"
                      onClick={() => setCartOpen(false)}
                      className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone"
                    >
                      Browse Catalogue
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item, index) => (
                      <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 border-b border-ink/5 pb-4">
                        <div className="aspect-[3/4] w-20 overflow-hidden rounded bg-paper">
                          <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.product.seller}</p>
                                <h4 className="text-sm font-medium text-ink mt-0.5 line-clamp-1">{item.product.name}</h4>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                                className="text-muted-foreground hover:text-ink transition-colors p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            <div className="mt-1 flex gap-2 text-[11px] text-muted-foreground">
                              <span>Size: {item.size}</span>
                              <span>·</span>
                              <span>Color: {item.color}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex items-center gap-2 rounded-full border border-ink/10 px-2 py-1 bg-paper">
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                                className="p-0.5 hover:opacity-75 transition-opacity"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="text-[12px] font-medium min-w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                                className="p-0.5 hover:opacity-75 transition-opacity"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <span className="font-display font-medium text-sm">
                              ${(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-ink/10 pt-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex items-end justify-between border-t border-ink/5 pt-3">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-display text-2xl font-medium">${cartSubtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href="/checkout"
                      onClick={() => setCartOpen(false)}
                      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-8 text-[12px] font-semibold uppercase tracking-[0.2em] text-bone transition hover:opacity-90"
                    >
                      Checkout Order
                    </a>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider py-1">
                      <ShieldCheck className="size-3.5" />
                      <span>Authenticated & Insured shipping</span>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
