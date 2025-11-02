"use client";
import * as React from "react";
import Link from "next/link";
import { ShoppingBag, FileText, DollarSign, Package, ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomBadge } from "../../components/ui/CustomBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

import AdminPageWrapper from "../../components/admin/AdminPageWrapper"; // Import your wrapper

// Mock Data - TODO: Replace with Supabase queries
const stats = [
  {
    title: "Total Products",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Total Orders",
    value: "1,247",
    change: "+23%",
    trend: "up",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Pending Orders",
    value: "23",
    change: "-5%",
    trend: "down",
    icon: ShoppingBag,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

const recentOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "Sarah Johnson",
    total: 299.99,
    status: "pending",
    date: "2024-11-01",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: "Michael Chen",
    total: 549.99,
    status: "confirmed",
    date: "2024-11-01",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: "Emma Wilson",
    total: 189.99,
    status: "shipped",
    date: "2024-10-31",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: "James Brown",
    total: 799.99,
    status: "delivered",
    date: "2024-10-31",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: "Lisa Anderson",
    total: 149.99,
    status: "pending",
    date: "2024-10-30",
  },
];

const lowStockProducts = [
  { id: "1", name: "Elegant Silk Evening Dress", sku: "ESE-BLK-L", stock: 3 },
  { id: "2", name: "Classic Tailored Suit", sku: "CTS-NAV-M", stock: 2 },
  { id: "3", name: "Designer Kids Collection", sku: "DKC-BLU-S", stock: 4 },
];

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

export default function AdminDashboard() {
  return (
    <AdminPageWrapper>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-brand-dark mb-2">Dashboard</h1>
          <p className="text-text-medium">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-text-medium">{stat.title}</p>
                    <p className="text-3xl text-brand-dark">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                        {stat.change}
                      </span>
                      <span className="text-text-medium">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-brand-dark">Recent Orders</CardTitle>
              <CustomButton variant="ghost" asChild>
                <Link href="/admin/orders">View All</Link>
              </CustomButton>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <CustomBadge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </CustomBadge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">
                          <CustomButton variant="ghost" size="sm" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </CustomButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-brand-dark">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brand-dark line-clamp-2">{product.name}</p>
                      <p className="text-xs text-text-medium">{product.sku}</p>
                    </div>
                    <CustomBadge variant="warning" className="flex-shrink-0">
                      {product.stock} left
                    </CustomBadge>
                  </div>
                ))}
                <CustomButton variant="outline" className="w-full mt-4" asChild>
                  <Link href="/admin/products">Manage Inventory</Link>
                </CustomButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-brand-dark">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CustomButton variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link href="/admin/products/new">
                  <Package className="w-6 h-6" />
                  Add New Product
                </Link>
              </CustomButton>
              <CustomButton variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link href="/admin/orders">
                  <FileText className="w-6 h-6" />
                  View Orders
                </Link>
              </CustomButton>
              <CustomButton variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link href="/admin/categories">
                  <ShoppingBag className="w-6 h-6" />
                  Manage Categories
                </Link>
              </CustomButton>
              <CustomButton variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
                <Link href="/admin/discounts">
                  <DollarSign className="w-6 h-6" />
                  Discount Codes
                </Link>
              </CustomButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}
