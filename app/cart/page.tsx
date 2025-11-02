"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { CartItem, type CartItemData } from "../../components/ui/CartItem";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomInput } from "../../components/ui/CustomInput";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

// Mock Cart Data - TODO: Replace with state management and Supabase
const mockCartItems: CartItemData[] = [
  {
    id: "1",
    product_id: "1",
    product_name: "Elegant Silk Evening Dress",
    product_slug: "elegant-silk-evening-dress",
    product_image: "https://images.unsplash.com/photo-1678637803638-0bcc1e13ecae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    size: "M",
    color: "Black",
    price: 249.99,
    quantity: 1,
  },
  {
    id: "2",
    product_id: "2",
    product_name: "Classic Tailored Suit",
    product_slug: "classic-tailored-suit",
    product_image: "https://images.unsplash.com/photo-1714328564923-d4826427c991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    size: "L",
    color: "Navy",
    price: 499.99,
    quantity: 1,
  },
  {
    id: "3",
    product_id: "4",
    product_name: "Luxe Oud Perfume",
    product_slug: "luxe-oud-perfume",
    product_image: "https://images.unsplash.com/photo-1761659760494-32b921a2449f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    price: 149.99,
    quantity: 2,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = React.useState<CartItemData[]>(mockCartItems);
  const [discountCode, setDiscountCode] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState<{ code: string; amount: number } | null>(null);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validate discount code with Supabase
    if (discountCode.toUpperCase() === "GLORY20") {
      setAppliedDiscount({ code: discountCode, amount: subtotal * 0.2 });
    } else {
      alert("Invalid discount code");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount?.amount || 0;
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal - discountAmount + shipping;

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1761147165029-afbb6b7589c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                alt="Empty cart"
                className="w-64 h-64 mx-auto object-contain opacity-50"
              />
            </div>
            <h1 className="text-brand-dark mb-4">Your Cart is Empty</h1>
            <p className="text-text-medium mb-8">
              Looks like you haven&apos;t added anything to your cart yet. Start shopping to find your perfect style!
            </p>
            <CustomButton variant="primary" size="lg" asChild>
              <Link href="/products">Start Shopping</Link>
            </CustomButton>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
            <h1 className="text-brand-dark">Shopping Cart</h1>
            <p className="text-text-medium">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-24 bg-white rounded-xl p-6 shadow-md space-y-6">
                <h3 className="text-brand-dark">Order Summary</h3>

                {/* Discount Code */}
                <form onSubmit={handleApplyDiscount} className="space-y-2">
                  <div className="flex gap-2">
                    <CustomInput
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      containerClassName="flex-1"
                      disabled={!!appliedDiscount}
                    />
                    {!appliedDiscount && (
                      <CustomButton variant="outline" type="submit">
                        Apply
                      </CustomButton>
                    )}
                  </div>
                  {appliedDiscount && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Tag className="w-4 h-4" />
                      <span>Code &quot;{appliedDiscount.code}&quot; applied!</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedDiscount(null);
                          setDiscountCode("");
                        }}
                        className="ml-auto text-text-medium hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex justify-between text-text-medium">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-text-medium">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-sm text-text-medium">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}

                  <div className="flex justify-between text-brand-dark pt-3 border-t">
                    <span>Total</span>
                    <span className="text-2xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <CustomButton variant="primary" size="lg" className="w-full" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </CustomButton>

                {/* Trust Badges */}
                <div className="pt-6 border-t space-y-2 text-sm text-text-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Free returns within 30 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Customer support available 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
