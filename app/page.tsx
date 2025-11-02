"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { CategoryCard, type Category } from "../components/ui/CategoryCard";
import { ProductCard, type Product as ProductCardType } from "../components/ui/ProductCard";
import { CustomButton } from "../components/ui/CustomButton";
import { CustomInput } from "../components/ui/CustomInput";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

import { getCategories } from "../lib/supabase/categories"; // adjust path as needed
import { getFeaturedProducts } from "../lib/supabase/products"; // adjust path as needed
import type { Product } from "../lib/types";

const trustBadges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $100",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "Easy return policy",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "100% protected",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support",
  },
];

export default function HomePage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<ProductCardType[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);

        const featuredData: Product[] = await getFeaturedProducts(4);
        // Map fetched Product to include image_url for ProductCard
        const mappedProducts: ProductCardType[] = featuredData.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          base_price: product.base_price,
          discount_price: product.discount_price ?? undefined,
          image_url: product.product_images && product.product_images.length > 0
            ? product.product_images[0].image_url
            : null,
          is_featured: product.is_featured,
        }));
        setFeaturedProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch categories or featured products", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-brand-dark text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20">
              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-brand-accent">Style with Glory</h1>
                <p className="text-lg text-gray-300">
                  Discover our exclusive collection of luxury fashion. From elegant dresses to sophisticated suits, premium kids&apos; wear to exquisite perfumes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <CustomButton variant="secondary" size="lg" asChild>
                    <Link href="/products">
                      Shop Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </CustomButton>
                  <CustomButton variant="outline" size="lg" asChild className="border-white text-white hover:bg-white hover:text-brand-dark">
                    <Link href="/products?featured=true">New Arrivals</Link>
                  </CustomButton>
                </div>
              </div>

              {/* Hero Image */}
              <div className="order-1 lg:order-2">
                <div className="relative aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                    alt="Luxury fashion model"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-brand-dark mb-4">Shop by Category</h2>
              <p className="text-text-medium">Explore our curated collections for every style</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 lg:mb-12">
              <div>
                <h2 className="text-brand-dark mb-2">Featured Products</h2>
                <p className="text-text-medium">Handpicked favorites from our latest collection</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 text-brand-dark hover:text-brand-accent transition-colors"
              >
                View All
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex gap-4 pb-4">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="w-[280px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center sm:hidden">
              <CustomButton variant="outline" asChild>
                <Link href="/products">View All Products</Link>
              </CustomButton>
            </div>
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-brand-dark to-brand-dark/90 rounded-xl p-8 lg:p-12 text-white text-center">
              <h3 className="text-brand-accent mb-4">Limited Time Offer</h3>
              <p className="text-lg mb-6">
                Get 20% off on all new arrivals. Use code: <span className="bg-brand-accent text-brand-dark px-3 py-1 rounded">GLORY20</span>
              </p>
              <CustomButton variant="secondary" size="lg" asChild>
                <Link href="/products?featured=true">Shop New Arrivals</Link>
              </CustomButton>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {trustBadges.map((badge, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-14 h-14 mx-auto bg-brand-dark/10 rounded-full flex items-center justify-center">
                    <badge.icon className="w-7 h-7 text-brand-dark" />
                  </div>
                  <h4 className="text-brand-dark">{badge.title}</h4>
                  <p className="text-sm text-text-medium">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h3 className="text-brand-dark mb-4">Join Our Newsletter</h3>
              <p className="text-text-medium">
                Subscribe to receive updates on new arrivals, special offers, and exclusive promotions.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <CustomInput type="email" placeholder="Enter your email address" className="flex-1" />
              <CustomButton variant="primary" size="lg" type="submit">Subscribe</CustomButton>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
