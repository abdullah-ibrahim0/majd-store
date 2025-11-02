"use client";
import * as React from "react";
import Link from "next/link";
import { Check, Package, MapPin } from "lucide-react";
import { Header } from "../../../components/layout/Header";
import { Footer } from "../../../components/layout/Footer";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomBadge } from "../../../components/ui/CustomBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";

// Mock Data - TODO: Replace with Supabase query
const orderData = {
  orderNumber: "ORD-XYZ123ABC",
  status: "confirmed",
  date: "November 1, 2024",
  estimatedDelivery: "November 5-7, 2024",
  customer: {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    address: "123 Fashion Street, Apt 4B, New York, NY 10001",
  },
  items: [
    {
      id: "1",
      name: "Elegant Silk Evening Dress",
      image: "https://images.unsplash.com/photo-1678637803638-0bcc1e13ecae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
      size: "M",
      color: "Black",
      quantity: 1,
      price: 249.99,
    },
    {
      id: "2",
      name: "Luxe Oud Perfume",
      image: "https://images.unsplash.com/photo-1761659760494-32b921a2449f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
      quantity: 2,
      price: 149.99,
    },
  ],
  subtotal: 549.97,
  discount: 50.00,
  shipping: 0,
  total: 499.97,
};

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-brand-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-brand-dark mb-4">Order Confirmed!</h1>
            <p className="text-text-medium text-lg mb-2">
              Thank you for your purchase
            </p>
            <p className="text-text-medium">
              Order number: <span className="text-brand-dark">{orderData.orderNumber}</span>
            </p>
            <p className="text-sm text-text-medium mt-4">
              A confirmation email has been sent to {orderData.customer.email}
            </p>
          </div>

          <div className="space-y-6">
            {/* Order Details */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-medium text-sm mb-1">Order Date</p>
                    <p className="text-brand-dark">{orderData.date}</p>
                  </div>
                  <CustomBadge variant="success">{orderData.status}</CustomBadge>
                </div>
                
                <div>
                  <p className="text-text-medium text-sm mb-1">Estimated Delivery</p>
                  <p className="text-brand-dark">{orderData.estimatedDelivery}</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-brand-dark">
                  <p className="mb-1">{orderData.customer.name}</p>
                  <p className="text-text-medium">{orderData.customer.address}</p>
                  <p className="text-text-medium mt-2">{orderData.customer.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-brand-dark mb-1">{item.name}</h4>
                      {(item.size || item.color) && (
                        <p className="text-sm text-text-medium mb-2">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " • "}
                          {item.color && item.color}
                        </p>
                      )}
                      <p className="text-sm text-text-medium">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-dark">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-text-medium">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${orderData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-medium">
                  <span>Shipping</span>
                  <span>{orderData.shipping === 0 ? "FREE" : `$${orderData.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-brand-dark pt-3 border-t">
                  <span>Total</span>
                  <span className="text-xl">${orderData.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <CustomButton variant="primary" className="flex-1" asChild>
                <Link href="/products">Continue Shopping</Link>
              </CustomButton>
              <CustomButton variant="outline" className="flex-1">
                Track Order
              </CustomButton>
            </div>

            {/* Help */}
            <Card className="border-none shadow-md bg-blue-50">
              <CardContent className="p-6 text-center">
                <h4 className="text-brand-dark mb-2">Need Help?</h4>
                <p className="text-sm text-text-medium mb-4">
                  If you have any questions about your order, please contact our customer support team.
                </p>
                <CustomButton variant="outline" size="sm">
                  Contact Support
                </CustomButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
