"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, CreditCard, Printer, Check } from "lucide-react";
import { CustomButton } from "../../../../components/ui/CustomButton";
import { CustomBadge } from "../../../../components/ui/CustomBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";

// Mock Data - TODO: Replace with Supabase query by order ID
const orderData = {
  id: "1",
  orderNumber: "ORD-2024-001",
  status: "pending",
  created_at: "2024-11-01 14:30",
  updated_at: "2024-11-01 14:30",
  customer: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 234 567 8901",
    address: "123 Fashion Street, Apartment 4B",
    city: "New York",
    postalCode: "10001",
    country: "United States",
  },
  items: [
    {
      id: "1",
      product_name: "Elegant Silk Evening Dress",
      product_image: "https://images.unsplash.com/photo-1678637803638-0bcc1e13ecae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
      size: "M",
      color: "Black",
      quantity: 1,
      price: 249.99,
    },
    {
      id: "2",
      product_name: "Luxe Oud Perfume",
      product_image: "https://images.unsplash.com/photo-1761659760494-32b921a2449f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
      quantity: 1,
      price: 149.99,
    },
  ],
  payment: {
    method: "Cash on Delivery",
    subtotal: 399.98,
    discount: 50.00,
    shipping: 0,
    total: 349.98,
  },
  notes: "Please call before delivery. Prefer morning delivery between 9-11 AM.",
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "shipped":
      return "default";
    case "delivered":
      return "success";
    default:
      return "default";
  }
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export default function OrderDetailPage() {
  const [currentStatus, setCurrentStatus] = React.useState(orderData.status);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // TODO: Update order status in Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </Link>
          <h1 className="text-brand-dark mb-2">Order Details</h1>
          <p className="text-text-medium">
            Order {orderData.orderNumber} • {orderData.created_at}
          </p>
        </div>
        <CustomButton variant="outline" onClick={handlePrint}>
          <Printer className="w-5 h-5" />
          Print Invoice
        </CustomButton>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Information
                </CardTitle>
                <CustomBadge variant={getStatusBadgeVariant(currentStatus)} className="text-sm">
                  {currentStatus}
                </CustomBadge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-medium mb-1">Order Number</p>
                  <p className="text-brand-dark">{orderData.orderNumber}</p>
                </div>
                <div>
                  <p className="text-text-medium mb-1">Order Date</p>
                  <p className="text-brand-dark">{orderData.created_at}</p>
                </div>
                <div>
                  <p className="text-text-medium mb-1">Last Updated</p>
                  <p className="text-brand-dark">{orderData.updated_at}</p>
                </div>
                <div>
                  <p className="text-text-medium mb-1">Total Items</p>
                  <p className="text-brand-dark">{orderData.items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-text-medium text-sm mb-1">Name</p>
                  <p className="text-brand-dark">{orderData.customer.name}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-medium text-sm mb-1">Email</p>
                    <p className="text-brand-dark">{orderData.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-text-medium text-sm mb-1">Phone</p>
                    <p className="text-brand-dark">{orderData.customer.phone}</p>
                  </div>
                </div>
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
              <div className="text-brand-dark space-y-1">
                <p>{orderData.customer.address}</p>
                <p>{orderData.customer.city}, {orderData.customer.postalCode}</p>
                <p>{orderData.customer.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              <ImageWithFallback
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-brand-dark">{item.product_name}</p>
                              {(item.size || item.color) && (
                                <p className="text-xs text-text-medium">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && item.color && " • "}
                                  {item.color && item.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-medium">Payment Method</span>
                  <span className="text-brand-dark">{orderData.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-medium">Subtotal</span>
                  <span className="text-brand-dark">${orderData.payment.subtotal.toFixed(2)}</span>
                </div>
                {orderData.payment.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${orderData.payment.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-medium">Shipping</span>
                  <span className="text-brand-dark">
                    {orderData.payment.shipping === 0 ? "FREE" : `$${orderData.payment.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-brand-dark">Total</span>
                  <span className="text-brand-dark text-xl">
                    ${orderData.payment.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {orderData.notes && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-brand-dark">Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-medium">{orderData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          {/* Update Status */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status" className="mb-2 block">
                  Current Status
                </Label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CustomButton
                variant="primary"
                className="w-full"
                onClick={handleStatusUpdate}
                disabled={isUpdating || currentStatus === orderData.status}
              >
                {isUpdating ? (
                  <>Updating...</>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Update Status
                  </>
                )}
              </CustomButton>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-brand-dark">Order Placed</p>
                    <p className="text-sm text-text-medium">{orderData.created_at}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    ["confirmed", "shipped", "delivered"].includes(currentStatus)
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}></div>
                  <div>
                    <p className={
                      ["confirmed", "shipped", "delivered"].includes(currentStatus)
                        ? "text-brand-dark"
                        : "text-text-medium"
                    }>
                      Order Confirmed
                    </p>
                    <p className="text-sm text-text-medium">
                      {["confirmed", "shipped", "delivered"].includes(currentStatus) ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    ["shipped", "delivered"].includes(currentStatus)
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}></div>
                  <div>
                    <p className={
                      ["shipped", "delivered"].includes(currentStatus)
                        ? "text-brand-dark"
                        : "text-text-medium"
                    }>
                      Order Shipped
                    </p>
                    <p className="text-sm text-text-medium">
                      {["shipped", "delivered"].includes(currentStatus) ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    currentStatus === "delivered" ? "bg-green-600" : "bg-gray-300"
                  }`}></div>
                  <div>
                    <p className={
                      currentStatus === "delivered" ? "text-brand-dark" : "text-text-medium"
                    }>
                      Order Delivered
                    </p>
                    <p className="text-sm text-text-medium">
                      {currentStatus === "delivered" ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CustomButton variant="outline" className="w-full">
                Email Customer
              </CustomButton>
              <CustomButton variant="outline" className="w-full">
                Call Customer
              </CustomButton>
              <CustomButton variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                Cancel Order
              </CustomButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
