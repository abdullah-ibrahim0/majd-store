import * as React from "react";
import Link from "next/link";
import { cn } from "./utils";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  // Fallback image URL to use when category.image_url is null
  const fallbackImageUrl = "/images/default-category.jpg"; // Adjust path accordingly

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="relative aspect-square">
        <ImageWithFallback
          src={category.image_url ?? fallbackImageUrl}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Category Name */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white text-center">{category.name}</h3>
        </div>
      </div>
    </Link>
  );
}
