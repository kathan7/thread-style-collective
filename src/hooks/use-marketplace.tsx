import React, { createContext, useContext, useState, useEffect } from "react";
import { products as initialProducts, sellers as initialSellers, categories as initialCategories, Product, Seller, Category } from "../lib/catalog";

// Types
export type UserRole = "customer" | "seller" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeSlug?: string; // If seller, maps to their store
  addresses?: Address[];
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  sellerSlug: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: Address;
  commissionPaid: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface MarketplaceContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, role: UserRole) => boolean;
  register: (email: string, name: string, role: UserRole, storeName?: string) => boolean;
  logout: () => void;
  updateAddresses: (addresses: Address[]) => void;

  // Catalog
  products: (Product & { status: "approved" | "pending" })[];
  addSellerProduct: (p: Omit<Product, "id" | "rating" | "reviews">) => void;
  approveProduct: (id: string) => void;
  rejectProduct: (id: string) => void;
  deleteProduct: (id: string) => void;

  // Sellers
  sellers: (Seller & { status: "approved" | "pending" })[];
  updateSellerSettings: (slug: string, updates: Partial<Seller>) => void;
  followSeller: (slug: string) => void;
  followedSellers: string[]; // List of seller slugs followed by current user
  approveSeller: (slug: string) => void;
  rejectSeller: (slug: string) => void;

  // Categories
  categories: Category[];
  addCategory: (name: string, imageUrl?: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;

  // Reviews
  reviews: Review[];
  addReview: (productId: string, rating: number, comment: string) => void;

  // Orders
  orders: Order[];
  createOrder: (address: Address) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  // Initial states with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<(Product & { status: "approved" | "pending" })[]>([]);
  const [sellers, setSellers] = useState<(Seller & { status: "approved" | "pending" })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [followedSellers, setFollowedSellers] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load initial data
  useEffect(() => {
    // Auth
    const savedUser = localStorage.getItem("tm_user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    // Products (Merge initial catalog items as approved)
    const savedProducts = localStorage.getItem("tm_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const initialWithStatus = initialProducts.map((p) => ({ ...p, status: "approved" as const }));
      setProducts(initialWithStatus);
      localStorage.setItem("tm_products", JSON.stringify(initialWithStatus));
    }

    // Sellers
    const savedSellers = localStorage.getItem("tm_sellers");
    if (savedSellers) {
      setSellers(JSON.parse(savedSellers));
    } else {
      const initialWithStatus = initialSellers.map((s) => ({ ...s, status: "approved" as const }));
      setSellers(initialWithStatus);
      localStorage.setItem("tm_sellers", JSON.stringify(initialWithStatus));
    }

    // Categories
    const savedCategories = localStorage.getItem("tm_categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
      localStorage.setItem("tm_categories", JSON.stringify(initialCategories));
    }

    // Followed sellers
    const savedFollowed = localStorage.getItem("tm_followed");
    if (savedFollowed) setFollowedSellers(JSON.parse(savedFollowed));

    // Cart
    const savedCart = localStorage.getItem("tm_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    // Wishlist
    const savedWishlist = localStorage.getItem("tm_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    // Reviews
    const savedReviews = localStorage.getItem("tm_reviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      const seedReviews: Review[] = [
        { id: "r1", productId: "structure-overcoat", userName: "Margot, Paris", rating: 5, comment: "Incredible weight and drape — feels like an heirloom.", createdAt: "2026-04-12" },
        { id: "r2", productId: "helix-earring", userName: "Joon-ho, Seoul", rating: 4, comment: "Stunning minimalist shape. A bit smaller than expected but very beautiful.", createdAt: "2026-05-01" },
      ];
      setReviews(seedReviews);
      localStorage.setItem("tm_reviews", JSON.stringify(seedReviews));
    }

    // Orders
    const savedOrders = localStorage.getItem("tm_orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Helper to sync to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Auth Operations
  const login = (email: string, role: UserRole): boolean => {
    const normalizedEmail = email.toLowerCase().trim();
    let name = "Guest Customer";
    let storeSlug: string | undefined;

    if (role === "admin") {
      name = "Marketplace Admin";
    } else if (role === "seller") {
      if (normalizedEmail.includes("monolith") || normalizedEmail === "seller@threadmarket.com") {
        name = "Studio Monolith Team";
        storeSlug = "studio-monolith";
      } else if (normalizedEmail.includes("nordic")) {
        name = "Nordic Collective Team";
        storeSlug = "nordic-collective";
      } else {
        name = "Komorebi Archive Team";
        storeSlug = "komorebi-archive";
      }
    } else {
      name = normalizedEmail.split("@")[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    const defaultAddresses: Address[] = [
      {
        id: "addr-1",
        name: "Home Address",
        street: "124 Ruede Grenelle",
        city: "Paris",
        postalCode: "75007",
        country: "France",
        isDefault: true,
      },
    ];

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      name,
      role,
      storeSlug,
      addresses: defaultAddresses,
    };

    setCurrentUser(newUser);
    saveToStorage("tm_user", newUser);
    return true;
  };

  const register = (email: string, name: string, role: UserRole, storeName?: string): boolean => {
    let storeSlug: string | undefined;
    if (role === "seller" && storeName) {
      storeSlug = storeName.toLowerCase().replace(/\s+/g, "-");
      if (!sellers.some((s) => s.slug === storeSlug)) {
        const newSeller: Seller & { status: "approved" | "pending" } = {
          slug: storeSlug,
          name: storeName,
          city: "Paris",
          rating: 5.0,
          followers: "0",
          productCount: 0,
          banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200",
          initials: storeName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          bio: `Independent design house representing ${storeName}. Pending moderation.`,
          status: "pending", // Start pending verification
        };
        const updatedSellers = [...sellers, newSeller];
        setSellers(updatedSellers);
        saveToStorage("tm_sellers", updatedSellers);
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase().trim(),
      name,
      role,
      storeSlug,
      addresses: [
        {
          id: "addr-1",
          name: "Default Address",
          street: "123 Fashion Blvd",
          city: "Milan",
          postalCode: "20121",
          country: "Italy",
          isDefault: true,
        },
      ],
    };

    setCurrentUser(newUser);
    saveToStorage("tm_user", newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("tm_user");
  };

  const updateAddresses = (addresses: Address[]) => {
    if (!currentUser) return;
    const updated = { ...currentUser, addresses };
    setCurrentUser(updated);
    saveToStorage("tm_user", updated);
  };

  // Product Listings (Seller / Admin)
  const addSellerProduct = (p: Omit<Product, "id" | "rating" | "reviews">) => {
    const newProduct: Product & { status: "approved" | "pending" } = {
      ...p,
      id: p.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      rating: 5.0,
      reviews: 0,
      status: "pending", // Needs Admin approval
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveToStorage("tm_products", updated);
  };

  const approveProduct = (id: string) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const sSlug = p.sellerSlug;
        const updatedSellers = sellers.map((s) => {
          if (s.slug === sSlug) {
            return { ...s, productCount: s.productCount + 1 };
          }
          return s;
        });
        setSellers(updatedSellers);
        saveToStorage("tm_sellers", updatedSellers);

        return { ...p, status: "approved" as const };
      }
      return p;
    });
    setProducts(updated);
    saveToStorage("tm_products", updated);
  };

  const rejectProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveToStorage("tm_products", updated);
  };

  const deleteProduct = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;

    // Decrement seller productCount if the product was approved
    if (p.status === "approved") {
      const sSlug = p.sellerSlug;
      const updatedSellers = sellers.map((s) => {
        if (s.slug === sSlug) {
          return { ...s, productCount: Math.max(0, s.productCount - 1) };
        }
        return s;
      });
      setSellers(updatedSellers);
      saveToStorage("tm_sellers", updatedSellers);
    }

    const updated = products.filter((prod) => prod.id !== id);
    setProducts(updated);
    saveToStorage("tm_products", updated);
  };

  // Seller approvals (Admin)
  const approveSeller = (slug: string) => {
    const updated = sellers.map((s) => {
      if (s.slug === slug) {
        return { ...s, status: "approved" as const, bio: s.bio.replace(". Pending moderation.", ".") };
      }
      return s;
    });
    setSellers(updated);
    saveToStorage("tm_sellers", updated);
  };

  const rejectSeller = (slug: string) => {
    const updated = sellers.filter((s) => s.slug !== slug);
    setSellers(updated);
    saveToStorage("tm_sellers", updated);
  };

  // Seller settings & interactions
  const updateSellerSettings = (slug: string, updates: Partial<Seller>) => {
    const updated = sellers.map((s) => (s.slug === slug ? { ...s, ...updates } : s));
    setSellers(updated);
    saveToStorage("tm_sellers", updated);
  };

  const followSeller = (slug: string) => {
    let newFollowed: string[];
    let change = 0;

    if (followedSellers.includes(slug)) {
      newFollowed = followedSellers.filter((s) => s !== slug);
      change = -1;
    } else {
      newFollowed = [...followedSellers, slug];
      change = 1;
    }

    setFollowedSellers(newFollowed);
    saveToStorage("tm_followed", newFollowed);

    const updatedSellers = sellers.map((s) => {
      if (s.slug === slug) {
        let numVal = parseFloat(s.followers);
        const isK = s.followers.toLowerCase().includes("k");
        if (isK) numVal = numVal * 1000;

        const finalNum = Math.max(0, numVal + change);
        const newStr = finalNum >= 1000 ? `${(finalNum / 1000).toFixed(1)}k` : `${finalNum}`;

        return { ...s, followers: newStr };
      }
      return s;
    });
    setSellers(updatedSellers);
    saveToStorage("tm_sellers", updatedSellers);
  };

  // Categories
  const addCategory = (name: string, imageUrl?: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    if (categories.some((c) => c.slug === slug)) return;

    const newCategory: Category = {
      slug,
      name,
      image: imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400"
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    saveToStorage("tm_categories", updated);
  };

  // Cart Operations
  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const existing = cart.find(
      (item) => item.product.id === product.id && item.size === size && item.color === color,
    );

    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((item) =>
        item.product.id === product.id && item.size === size && item.color === color
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    } else {
      newCart = [...cart, { product, size, color, quantity }];
    }

    setCart(newCart);
    saveToStorage("tm_cart", newCart);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    const newCart = cart.filter(
      (item) => !(item.product.id === productId && item.size === size && item.color === color),
    );
    setCart(newCart);
    saveToStorage("tm_cart", newCart);
  };

  const updateCartQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    const newCart = cart.map((item) =>
      item.product.id === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item,
    );
    setCart(newCart);
    saveToStorage("tm_cart", newCart);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("tm_cart");
  };

  // Wishlist Operations
  const toggleWishlist = (productId: string) => {
    let newWishlist: string[];
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter((id) => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    setWishlist(newWishlist);
    saveToStorage("tm_wishlist", newWishlist);
  };

  // Reviews
  const addReview = (productId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: currentUser?.name || "Verified Collector",
      rating,
      comment,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const newReviews = [newReview, ...reviews];
    setReviews(newReviews);
    saveToStorage("tm_reviews", newReviews);

    const prodReviews = newReviews.filter((r) => r.productId === productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;

    const updatedProds = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          rating: parseFloat(avgRating.toFixed(1)),
          reviews: prodReviews.length,
        };
      }
      return p;
    });
    setProducts(updatedProds);
    saveToStorage("tm_products", updatedProds);
  };

  // Orders / Checkout
  const createOrder = (shippingAddress: Address): Order => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const commissionPaid = total * 0.15;

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      sellerSlug: item.product.sellerSlug,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: currentUser?.id || "guest",
      customerName: currentUser?.name || "Anonymous Guest",
      items: orderItems,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
      shippingAddress,
      commissionPaid,
    };

    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    saveToStorage("tm_orders", newOrders);
    clearCart();

    return newOrder;
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    saveToStorage("tm_orders", updated);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateAddresses,
        products,
        addSellerProduct,
        approveProduct,
        rejectProduct,
        deleteProduct,
        sellers,
        updateSellerSettings,
        followSeller,
        followedSellers,
        approveSeller,
        rejectSeller,
        categories,
        addCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        reviews,
        addReview,
        orders,
        createOrder,
        updateOrderStatus,
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
