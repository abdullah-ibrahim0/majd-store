"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomInput } from "../../components/ui/CustomInput";
import { CustomBadge } from "../../components/ui/CustomBadge";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

// Type definition for cart items
interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

// Mock Cart Data - TODO: Get from state management
const cartItems: CartItem[] = [
  {
    id: "1",
    name: "Elegant Silk Evening Dress",
    image: "https://images.unsplash.com/photo-1678637803638-0bcc1e13ecae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    size: "M",
    color: "Black",
    price: 249.99,
    quantity: 1,
  },
  {
    id: "2",
    name: "Classic Tailored Suit",
    image: "https://images.unsplash.com/photo-1714328564923-d4826427c991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    size: "L",
    color: "Navy",
    price: 499.99,
    quantity: 1,
  },
];

const subtotal: number = 749.98;
const discount: number = 149.99;
const shipping: number = 0;
const total: number = 599.99;


export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    // Contact Information
    fullName: "",
    email: "",
    phone: "",
    // Shipping Address
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
    // Payment
    paymentMethod: "cod",
    // Additional
    orderNotes: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // TODO: Submit order to Supabase
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to order confirmation
      const orderId = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-brand-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Cart
            </Link>
            <h1 className="text-brand-dark">Checkout</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-brand-dark mb-6">Contact Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CustomInput
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      error={errors.fullName}
                      required
                      containerClassName="sm:col-span-2"
                    />
                    <CustomInput
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      required
                    />
                    <CustomInput
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      required
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-brand-dark mb-6">Shipping Address</h3>
                  <div className="space-y-4">
                    <CustomInput
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      error={errors.address}
                      placeholder="House number and street name"
                      required
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <CustomInput
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        error={errors.city}
                        required
                      />
                      <CustomInput
                        label="Postal Code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        error={errors.postalCode}
                        required
                      />
                    </div>
                    <CustomInput
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-brand-dark mb-6">Payment Method</h3>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border-2 border-brand-dark rounded-lg bg-brand-dark/5">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-brand-dark">Cash on Delivery</p>
                              <p className="text-sm text-text-medium">Pay when you receive your order</p>
                            </div>
                            <CustomBadge variant="accent">Recommended</CustomBadge>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex-1">
                          <p className="font-semibold text-brand-dark">Credit / Debit Card</p>
                          <p className="text-sm text-text-medium">Coming soon</p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-brand-dark mb-6">Additional Information</h3>
                  <div>
                    <Label htmlFor="orderNotes" className="mb-2 block">
                      Order Notes (Optional)
                    </Label>
                    <Textarea
                      id="orderNotes"
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      placeholder="Notes about your order, e.g., special delivery instructions"
                      rows={4}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white rounded-xl p-6 shadow-md space-y-6">
                  <h3 className="text-brand-dark">Order Summary</h3>

                  {/* Items */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-dark text-white rounded-full flex items-center justify-center text-xs">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-dark line-clamp-2">{item.name}</p>
                          <p className="text-xs text-text-medium">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " • "}
                            {item.color && item.color}
                          </p>
                          <p className="text-sm text-brand-dark mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-6 border-t">
                    <div className="flex justify-between text-text-medium">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-text-medium">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                    </div>

                    <div className="flex justify-between text-brand-dark pt-3 border-t">
                      <span>Total</span>
                      <span className="text-2xl">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <CustomButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    type="submit"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </CustomButton>

                  {/* Terms */}
                  <p className="text-xs text-text-medium text-center">
                    By placing your order, you agree to our{" "}
                    <Link href="/terms" className="text-brand-dark hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-brand-dark hover:underline">
                      Privacy Policy
                    </Link>
                  </p>

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
                      <span>Customer support 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
