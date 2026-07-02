import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch, getToken } from "../lib/api";
import type { User, UserRole, Product, Category, CartItem, CustomerOrder } from "../lib/types";

interface MarketplaceContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  products: Product[];
  categories: Category[];
  productsLoading: boolean;
  refreshProducts: () => Promise<void>;
  getProduct: (slug: string) => Promise<Product | null>;

  cart: CartItem[];
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: number, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateCartQuantity: (variantId: number, quantity: number) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  clearCart: () => void;

  customerOrders: CustomerOrder[];
  refreshOrders: () => Promise<void>;

  wishlist: string[];
  toggleWishlist: (productSlug: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const mapUser = (user: { id: number; email: string; name: string; role: string }): User => ({
    id: user.id.toString(),
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  });

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        apiFetch<Product[]>("/api/products"),
        apiFetch<Category[]>("/api/products/categories"),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const getProduct = useCallback(async (slug: string): Promise<Product | null> => {
    try {
      return await apiFetch<Product>(`/api/products/${slug}`);
    } catch {
      return null;
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!getToken()) {
      setCart([]);
      return;
    }
    setCartLoading(true);
    try {
      const data = await apiFetch<{ items: CartItem[] }>("/api/cart");
      setCart(data.items);
    } catch {
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!getToken()) {
      setCustomerOrders([]);
      return;
    }
    try {
      const orders = await apiFetch<CustomerOrder[]>("/api/user/orders");
      setCustomerOrders(orders);
    } catch {
      setCustomerOrders([]);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("tm_user");
    const token = getToken();

    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const savedWishlist = localStorage.getItem("tm_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    refreshProducts().finally(() => setIsLoading(false));
  }, [refreshProducts]);

  // Load cart & orders when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshCart();
      if (currentUser.role === "customer") refreshOrders();
    } else {
      setCart([]);
      setCustomerOrders([]);
    }
  }, [currentUser, refreshCart, refreshOrders]);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiFetch<{ token: string; user: { id: number; email: string; name: string; role: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );

      localStorage.setItem("tm_token", data.token);
      const user = mapUser(data.user);
      setCurrentUser(user);
      localStorage.setItem("tm_user", JSON.stringify(user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const data = await apiFetch<{ token: string; user: { id: number; email: string; name: string; role: string } }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ email, password, name }) }
      );

      localStorage.setItem("tm_token", data.token);
      const user = mapUser(data.user);
      setCurrentUser(user);
      localStorage.setItem("tm_user", JSON.stringify(user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Registration failed" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setCustomerOrders([]);
    localStorage.removeItem("tm_user");
    localStorage.removeItem("tm_token");
  };

  const addToCart = async (variantId: number, quantity = 1) => {
    if (!currentUser) {
      return { success: false, error: "Please sign in to add items to cart" };
    }
    try {
      const data = await apiFetch<{ items: CartItem[] }>("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });
      setCart(data.items);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to add to cart" };
    }
  };

  const updateCartQuantity = async (variantId: number, quantity: number) => {
    try {
      const data = await apiFetch<{ items: CartItem[] }>("/api/cart/update", {
        method: "PUT",
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });
      setCart(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (variantId: number) => {
    try {
      const data = await apiFetch<{ items: CartItem[] }>(`/api/cart/remove/${variantId}`, {
        method: "DELETE",
      });
      setCart(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productSlug: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productSlug)
        ? prev.filter((s) => s !== productSlug)
        : [...prev, productSlug];
      localStorage.setItem("tm_wishlist", JSON.stringify(next));
      return next;
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
        products,
        categories,
        productsLoading,
        refreshProducts,
        getProduct,
        cart,
        cartLoading,
        refreshCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        customerOrders,
        refreshOrders,
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}

// Re-export types for convenience
export type { User, UserRole, Product, Category, CartItem, CustomerOrder, ShippingAddress } from "../lib/types";
