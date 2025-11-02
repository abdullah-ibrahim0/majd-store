"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/client";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import type { Product, Category, ProductImage, ProductVariant } from "@/lib/types";

const supabase = createClient();

interface ProductWithRelations extends Product {
  category: Category;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: productData } = await supabase
          .from("products")
          .select(`
            *,
            category:categories!category_id (*),
            product_images (*),
            product_variants (*)
          `)
          .eq("id", id)
          .single();

        if (!productData) {
          setNotFoundError(true);
          return;
        }

        setProduct(productData as ProductWithRelations);

        const { data: categoriesData } = await supabase.from("categories").select("*");
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (notFoundError) {
    return notFound();
  }

  return (
    <AdminPageWrapper>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-brand-dark" />
        </div>
      ) : product ? (
        <ProductForm product={product} categories={categories} />
      ) : (
        notFound()
      )}
    </AdminPageWrapper>
  );
}
