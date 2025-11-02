"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { CustomBadge } from "./CustomBadge";
import { cn } from "./utils";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_price?: number;
  image_url: string|null;
  is_featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  
  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.base_price - product.discount_price!) / product.base_price) * 100)
    : 0;

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
          <ImageWithFallback
  src={product.image_url ?? "/images/default-product.jpg"} // Fallback image URL
  alt={product.name}
  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
/>

          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <CustomBadge variant="accent">New</CustomBadge>
            )}
            {hasDiscount && (
              <CustomBadge variant="error">-{discountPercentage}%</CustomBadge>
            )}
          </div>

          {/* Quick View - Desktop Only */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
            <span className="text-white px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              Quick View
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="text-brand-dark line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-brand-dark">
                  ${product.discount_price!.toFixed(2)}
                </span>
                <span className="text-text-light line-through text-sm">
                  ${product.base_price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-brand-dark">
                ${product.base_price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsWishlisted(!isWishlisted);
        }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Add to wishlist"
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-colors",
            isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
          )}
        />
      </button>
    </div>
  );
}
