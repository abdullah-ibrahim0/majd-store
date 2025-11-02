"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "./utils";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export interface CartItemData {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export function CartItem({ item, onUpdateQuantity, onRemove, className }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && onUpdateQuantity) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id);
    }
  };

  return (
    <div className={cn("flex gap-4 p-4 bg-white rounded-lg shadow-sm", className)}>
      {/* Product Image */}
      <Link href={`/products/${item.product_slug}`} className="flex-shrink-0">
        <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={item.product_image}
            alt={item.product_name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div className="flex-1">
            <Link href={`/products/${item.product_slug}`}>
              <h4 className="text-brand-dark hover:text-brand-accent transition-colors line-clamp-2">
                {item.product_name}
              </h4>
            </Link>
            
            {/* Variant Info */}
            {(item.size || item.color) && (
              <div className="mt-1 text-sm text-text-medium">
                {item.size && <span>Size: {item.size}</span>}
                {item.size && item.color && <span className="mx-2">•</span>}
                {item.color && <span>Color: {item.color}</span>}
              </div>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-text-medium hover:text-red-600 transition-colors"
            aria-label="Remove item"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price and Quantity */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-brand-dark">
            ${item.price.toFixed(2)}
          </span>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className="min-w-[2rem] text-center">
              {item.quantity}
            </span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
