"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomBadge } from "../../../components/ui/CustomBadge";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { createClient } from "../../../lib/supabase/client";
import type { Product, ProductVariant, Category, ProductImage } from "../../../lib/types";
import AdminPageWrapper from "../../../components/admin/AdminPageWrapper";

// Initialize Supabase client
const supabase = createClient();

interface ProductWithRelations extends Product {
  category: Category;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

function AdminProductsContent() {
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Fetch products + images + variants + category
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            *,
            category:categories!category_id (id, name, slug),
            product_images (*),
            product_variants (*)
          `)
          .order("created_at", { ascending: false });

        if (productsError) throw productsError;

        const { data: categoriesData, error: catError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (catError) throw catError;

        setProducts(productsData as ProductWithRelations[]);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Delete product
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product.");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  // Filter logic
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category?.slug === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-dark" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-brand-dark mb-2">Products</h1>
          <p className="text-text-medium">Manage your product catalog ({products.length} products)</p>
        </div>
        <CustomButton variant="primary" asChild>
          <Link href="/admin/products/new">
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </CustomButton>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-medium" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 border border-input bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-brand-dark"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const variantCount = product.product_variants.length;
                  const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);
                  const mainImage = product.product_images?.[0]?.image_url || product.image_url || "/images/default-product.jpg";

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="line-clamp-2">{product.name}</div>
                        {variantCount > 1 && (
                          <p className="text-xs text-text-light">{variantCount} variants</p>
                        )}
                      </TableCell>
                      <TableCell>{product.category?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-brand-dark">
                            ${product.discount_price != null
                              ? product.discount_price.toFixed(2)
                              : product.base_price.toFixed(2)}
                          </span>
                          {product.discount_price != null && (
                            <span className="text-xs text-text-light line-through">
                              ${product.base_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {totalStock === 0 ? (
                          <CustomBadge variant="error">Out of Stock</CustomBadge>
                        ) : totalStock < 10 ? (
                          <CustomBadge variant="warning">{totalStock}</CustomBadge>
                        ) : (
                          <span className="text-text-medium">{totalStock}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <CustomBadge variant={product.is_active ? "success" : "error"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </CustomBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <CustomButton variant="ghost" size="sm" asChild>
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </CustomButton>
                          <CustomButton variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </CustomButton>
                          <CustomButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleting === product.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </CustomButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y">
            {filteredProducts.map((product) => {
              const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);
              const mainImage = product.product_images?.[0]?.image_url || product.image_url || "/images/default-product.jpg";

              return (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-brand-dark line-clamp-2 mb-1">{product.name}</h4>
                      <p className="text-sm text-text-medium mb-2">{product.category?.name || "-"}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-dark">
                          ${product.discount_price != null
                            ? product.discount_price.toFixed(2)
                            : product.base_price.toFixed(2)}
                        </span>
                        {product.discount_price != null && (
                          <span className="text-xs text-text-light line-through">
                            ${product.base_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CustomBadge variant={product.is_active ? "success" : "error"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </CustomBadge>
                    {totalStock === 0 ? (
                      <CustomBadge variant="error">Out of Stock</CustomBadge>
                    ) : totalStock < 10 ? (
                      <CustomBadge variant="warning">{totalStock} in stock</CustomBadge>
                    ) : (
                      <span className="text-sm text-text-medium">{totalStock} in stock</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <CustomButton variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </CustomButton>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {deleting === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </CustomButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-text-medium">No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminPageWrapper>
      <AdminProductsContent />
    </AdminPageWrapper>
  );
}
