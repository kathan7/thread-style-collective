import { useState } from "react";
import { Search, Heart, ShoppingBag, User, Plus, Minus, Trash2, ShieldCheck, LogOut, Package } from "lucide-react";
import { useMarketplace } from "../hooks/use-marketplace";
import { formatPrice } from "../lib/api";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

const PLACEHOLDER = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80";

export function SiteHeader() {
  const { currentUser, logout, cart, updateCartQuantity, removeFromCart, wishlist } = useMarketplace();
  const [cartOpen, setCartOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.current_price) * item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/5 bg-bone/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-display text-[22px] font-semibold uppercase tracking-tight">
            Thread<span className="italic font-medium">market</span>
          </Link>
          <nav className="hidden gap-7 md:flex">
            <Link to="/shop" className="text-[13px] font-medium tracking-wide text-ink/80 hover:text-ink transition">Shop</Link>
            {currentUser?.role === "admin" && (
              <Link to="/dashboard/admin" className="text-[13px] font-medium tracking-wide text-ink/80 hover:text-ink transition">Admin</Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/shop" className="hidden h-9 items-center gap-2 rounded-full bg-paper px-4 text-sm text-muted-foreground ring-1 ring-ink/5 lg:flex">
            <Search className="size-4" />
            <span>Search...</span>
          </Link>

          <Link to="/wishlist" aria-label="Wishlist" className="relative flex size-9 items-center justify-center rounded-full hover:bg-paper transition-colors">
            <Heart className={`size-5 ${wishlist.length > 0 ? "fill-ink" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-bone">
                {wishlist.length}
              </span>
            )}
          </Link>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-ink/10 bg-paper hover:bg-bone transition-colors">
                  <span className="text-[11px] font-bold uppercase">{currentUser.name.slice(0, 2)}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-bone border border-ink/10 shadow-editorial rounded-lg mt-1 mr-2" align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  {currentUser.name}<br />
                  <span className="text-[10px]">{currentUser.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-ink/5" />
                {currentUser.role === "customer" && (
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs py-2" asChild>
                    <Link to="/account"><Package className="size-3.5" /> My Orders</Link>
                  </DropdownMenuItem>
                )}
                {currentUser.role === "admin" && (
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs py-2" asChild>
                    <Link to="/dashboard/admin"><ShieldCheck className="size-3.5" /> Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-ink/5" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive gap-2 text-xs py-2">
                  <LogOut className="size-3.5" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" aria-label="Sign in" className="flex size-9 items-center justify-center rounded-full hover:bg-paper transition-colors">
              <User className="size-5" />
            </Link>
          )}

          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-bone hover:opacity-90 transition-opacity">
                <ShoppingBag className="size-4" />
                Cart ({cartItemCount})
              </button>
            </SheetTrigger>
            <SheetContent className="flex h-full w-full flex-col bg-bone text-ink sm:max-w-md border-l border-ink/10 p-6">
              <SheetHeader className="border-b border-ink/5 pb-4">
                <SheetTitle className="font-display text-2xl font-medium">Your Cart</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">Review items before checkout</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-4">
                {cart.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <ShoppingBag className="size-10 text-muted-foreground/45 mb-4" />
                    <p className="font-display text-xl font-medium">Cart is empty</p>
                    <Link to="/shop" onClick={() => setCartOpen(false)} className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-wider text-bone">
                      Browse Shop
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.variant_id} className="flex gap-4 border-b border-ink/5 pb-4">
                        <div className="aspect-[3/4] w-20 overflow-hidden rounded bg-paper">
                          <img src={item.image_url || PLACEHOLDER} alt={item.product_name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium line-clamp-1">{item.product_name}</h4>
                              <button onClick={() => removeFromCart(item.variant_id)} className="text-muted-foreground hover:text-ink p-1">
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {item.attributes?.size && `Size ${item.attributes.size}`}
                              {item.attributes?.color && ` · ${item.attributes.color}`}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex items-center gap-2 rounded-full border border-ink/10 px-2 py-1 bg-paper">
                              <button onClick={() => updateCartQuantity(item.variant_id, item.quantity - 1)} className="p-0.5"><Minus className="size-3" /></button>
                              <span className="text-[12px] font-medium min-w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.variant_id, Math.min(item.stock_quantity, item.quantity + 1))} className="p-0.5"><Plus className="size-3" /></button>
                            </div>
                            <span className="font-display font-medium text-sm">{formatPrice(Number(item.current_price) * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-ink/10 pt-4 space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-display text-2xl font-medium">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <Link
                    to={currentUser ? "/checkout" : "/auth"}
                    onClick={() => setCartOpen(false)}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-[12px] font-semibold uppercase tracking-widest text-bone hover:opacity-90"
                  >
                    {currentUser ? "Checkout" : "Sign in to Checkout"}
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
