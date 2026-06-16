import catMen from "@/assets/cat-men.jpg";
import catWomen from "@/assets/cat-women.jpg";
import catStreet from "@/assets/cat-street.jpg";
import catSport from "@/assets/cat-sport.jpg";
import catLuxury from "@/assets/cat-luxury.jpg";
import catFootwear from "@/assets/cat-footwear.jpg";
import catAccess from "@/assets/cat-access.jpg";
import productCoat from "@/assets/product-coat.jpg";
import productBoot from "@/assets/product-boot.jpg";
import productEarring from "@/assets/product-earring.jpg";
import storeBanner1 from "@/assets/store-banner-1.jpg";
import storeBanner2 from "@/assets/store-banner-2.jpg";
import storeBanner3 from "@/assets/store-banner-3.jpg";

export type Category = {
  slug: string;
  name: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "women", name: "Women", image: catWomen },
  { slug: "men", name: "Men", image: catMen },
  { slug: "streetwear", name: "Streetwear", image: catStreet },
  { slug: "sportswear", name: "Sportswear", image: catSport },
  { slug: "luxury", name: "Luxury", image: catLuxury },
  { slug: "footwear", name: "Footwear", image: catFootwear },
  { slug: "accessories", name: "Accessories", image: catAccess },
];

export type Product = {
  id: string;
  name: string;
  seller: string;
  sellerSlug: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  tag?: string;
};

export const products: Product[] = [
  { id: "structure-overcoat", name: "Structure Overcoat", seller: "Aethel Studios", sellerSlug: "aethel", price: 1240, rating: 4.9, reviews: 128, image: productCoat, category: "Women", tag: "New" },
  { id: "helix-earring", name: "Helix Earring", seller: "Forma Object", sellerSlug: "forma", price: 380, rating: 4.8, reviews: 64, image: productEarring, category: "Jewelry" },
  { id: "module-boot-01", name: "Module Boot 01", seller: "Terrain", sellerSlug: "terrain", price: 620, rating: 4.9, reviews: 214, image: productBoot, category: "Footwear", tag: "Bestseller" },
  { id: "raw-silk-shirting", name: "Raw Silk Shirting", seller: "Nomadic", sellerSlug: "nomadic", price: 320, rating: 4.7, reviews: 41, image: productCoat, category: "Men" },
  { id: "platform-chelsea", name: "Platform Chelsea", seller: "Kindred", sellerSlug: "kindred", price: 550, rating: 4.8, reviews: 89, image: productBoot, category: "Footwear" },
  { id: "monolith-shade", name: "Monolith Shade 01", seller: "Atelier Kobo", sellerSlug: "kobo", price: 320, rating: 5.0, reviews: 23, image: productEarring, category: "Accessories", tag: "Limited" },
];

export type Seller = {
  slug: string;
  name: string;
  city: string;
  rating: number;
  followers: string;
  productCount: number;
  banner: string;
  initials: string;
  bio: string;
};

export const sellers: Seller[] = [
  { slug: "studio-monolith", name: "Studio Monolith", city: "Berlin", rating: 4.9, followers: "12.4k", productCount: 248, banner: storeBanner1, initials: "SM", bio: "Architectural womenswear cut from heavy Italian wools. Numbered and finished in our Kreuzberg atelier." },
  { slug: "nordic-collective", name: "Nordic Collective", city: "Copenhagen", rating: 4.8, followers: "8.2k", productCount: 156, banner: storeBanner2, initials: "NC", bio: "A collective of seven Scandinavian designers working with deadstock wool, undyed linen, and recycled cashmere." },
  { slug: "komorebi-archive", name: "Komorebi Archive", city: "Tokyo", rating: 5.0, followers: "31.5k", productCount: 412, banner: storeBanner3, initials: "KA", bio: "Sourced and authenticated archival pieces from Aoyama. Rare editions, vintage couture, and contemporary craft." },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getSeller = (slug: string) => sellers.find((s) => s.slug === slug);
