export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  attributes: { size?: string; color?: string };
  price: number | null;
  effective_price?: number;
  stock_quantity: number;
  image_url?: string | null;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  category_name: string | null;
  category_slug: string | null;
  status: string;
  primary_image: string | null;
  images: string[];
  variants: ProductVariant[];
  total_stock: number;
}

export interface CartItem {
  id: number;
  variant_id: number;
  quantity: number;
  current_price: number;
  product_name: string;
  product_slug: string;
  sku: string;
  stock_quantity: number;
  attributes: { size?: string; color?: string };
  image_url: string | null;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  placed_at: string;
  items?: Array<{
    id: number;
    product_name_snapshot: string;
    price_snapshot: number;
    quantity: number;
    subtotal: number;
  }>;
}

export interface ShippingAddress {
  full_name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}
