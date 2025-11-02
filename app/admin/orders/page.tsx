"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Eye, Download, } from "lucide-react";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomBadge } from "../../../components/ui/CustomBadge";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

// Mock Data - TODO: Replace with Supabase queries
const allOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "Sarah Johnson",
    phone: "+1 234 567 8901",
    total: 299.99,
    status: "pending",
    date: "2024-11-01 14:30",
    items: 2,
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: "Michael Chen",
    phone: "+1 234 567 8902",
    total: 549.99,
    status: "confirmed",
    date: "2024-11-01 12:15",
    items: 3,
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: "Emma Wilson",
    phone: "+1 234 567 8903",
    total: 189.99,
    status: "shipped",
    date: "2024-10-31 18:45",
    items: 1,
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: "James Brown",
    phone: "+1 234 567 8904",
    total: 799.99,
    status: "delivered",
    date: "2024-10-31 10:20",
    items: 4,
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: "Lisa Anderson",
    phone: "+1 234 567 8905",
    total: 149.99,
    status: "pending",
    date: "2024-10-30 16:00",
    items: 1,
  },
  {
    id: "6",
    orderNumber: "ORD-2024-006",
    customer: "David Martinez",
    phone: "+1 234 567 8906",
    total: 449.99,
    status: "confirmed",
    date: "2024-10-30 09:30",
    items: 2,
  },
  {
    id: "7",
    orderNumber: "ORD-2024-007",
    customer: "Sophia Taylor",
    phone: "+1 234 567 8907",
    total: 329.99,
    status: "shipped",
    date: "2024-10-29 13:45",
    items: 3,
  },
  {
    id: "8",
    orderNumber: "ORD-2024-008",
    customer: "Robert Lee",
    phone: "+1 234 567 8908",
    total: 899.99,
    status: "delivered",
    date: "2024-10-29 11:20",
    items: 5,
  },
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

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    confirmed: allOrders.filter((o) => o.status === "confirmed").length,
    shipped: allOrders.filter((o) => o.status === "shipped").length,
    delivered: allOrders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-brand-dark mb-2">Orders</h1>
          <p className="text-text-medium">
            Manage customer orders ({orderStats.total} total)
          </p>
        </div>
        <CustomButton variant="outline">
          <Download className="w-5 h-5" />
          Export Orders
        </CustomButton>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-brand-dark mb-1">{orderStats.total}</p>
            <p className="text-sm text-text-medium">Total Orders</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-yellow-600 mb-1">{orderStats.pending}</p>
            <p className="text-sm text-text-medium">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-blue-600 mb-1">{orderStats.confirmed}</p>
            <p className="text-sm text-text-medium">Confirmed</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-purple-600 mb-1">{orderStats.shipped}</p>
            <p className="text-sm text-text-medium">Shipped</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-green-600 mb-1">{orderStats.delivered}</p>
            <p className="text-sm text-text-medium">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-medium" />
              <input
                type="search"
                placeholder="Search by order number, customer, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-input bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="text-text-medium">{order.phone}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell className="text-brand-dark">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <CustomBadge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </CustomBadge>
                    </TableCell>
                    <TableCell className="text-text-medium">{order.date}</TableCell>
                    <TableCell className="text-right">
                      <CustomButton variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </CustomButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-brand-dark mb-1">{order.orderNumber}</p>
                    <p className="text-sm text-text-medium">{order.customer}</p>
                    <p className="text-sm text-text-medium">{order.phone}</p>
                  </div>
                  <CustomBadge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </CustomBadge>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-text-medium">
                    <span>{order.items} items • </span>
                    <span className="text-brand-dark">${order.total.toFixed(2)}</span>
                  </div>
                  <CustomButton variant="outline" size="sm" asChild>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </CustomButton>
                </div>
                
                <p className="text-xs text-text-medium">{order.date}</p>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-text-medium">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex justify-center">
          <nav className="flex items-center gap-2">
            <CustomButton variant="outline" size="sm" disabled>
              Previous
            </CustomButton>
            <CustomButton variant="primary" size="sm">1</CustomButton>
            <CustomButton variant="outline" size="sm">2</CustomButton>
            <CustomButton variant="outline" size="sm">3</CustomButton>
            <CustomButton variant="outline" size="sm">Next</CustomButton>
          </nav>
        </div>
      )}
    </div>
  );
}
