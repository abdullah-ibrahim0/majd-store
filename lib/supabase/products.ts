import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';

const supabase = createClient();

/**
 * Get all active products with optional filters
 */
export async function getProducts(filters?: {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images(*),
        product_variants(
          id,
          size,
          color,
          stock_quantity,
          sku
        )
      `)
      .eq('is_active', true);

    if (filters?.categorySlug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .single();

      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('base_price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('base_price', filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.sizes && filters.sizes.length > 0) {
      if (filters.sizes.length === 1) {
        query = query.eq('product_variants.size', filters.sizes[0]);
      } else {
        const sizeFilterStr = filters.sizes
          .map(size => `product_variants.size.eq.${size}`)
          .join(',');
        query = query.or(sizeFilterStr);
      }
    }

    if (filters?.colors && filters.colors.length > 0) {
      const colorFilterStr = filters.colors
        .map(color => `product_variants.color.ilike.*${color}*`)
        .join(',');
      query = query.or(colorFilterStr);
    }

    if (filters?.inStock) {
      query = query.gt('product_variants.stock_quantity', 0);
    }

    if (
      typeof filters?.limit === 'number' &&
      typeof filters?.offset === 'number'
    ) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}






/**
 * Get single product by slug with variants and images
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(*),
        product_variants(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Product | null;
  } catch (error) {
    console.error(`Failed to fetch product ${slug}:`, error);
    throw error;
  }
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    throw error;
  }
}

/**
 * Get products by category ID
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    throw error;
  }
}

/**
 * Create product (admin only)
 */
// lib/supabase/products.ts
export async function createProduct(
  product: Omit<Product, 'id' | 'created_at'>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update product (admin only)
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    throw error;
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    throw error;
  }
}

// // Get low stock products (variants with stock < 5)
// export async function getLowStockProducts(limit = 5): Promise<any[]> {  // Type as needed, e.g., {id, name, sku, stock}
//   try {
//     const { data, error } = await supabase
//       .from('product_variants')
//       .select(`
//         id,
//         sku,
//         stock_quantity,
//         product:products(id, name)
//       `)
//       .lt('stock_quantity', 5)
//       .gt('stock_quantity', 0)
//       .order('stock_quantity', { ascending: true })
//       .limit(limit);

//     if (error) throw error;
//     return data.map(v => ({ id: v.product.id, name: v.product.name, sku: v.sku, stock: v.stock_quantity }));
//   } catch (error) {
//     console.error('Failed to fetch low stock products:', error);
//     throw error;
//   }
// }