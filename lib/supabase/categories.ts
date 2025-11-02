import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';

const supabase = createClient();

/**
 * Get all main categories (no parent)
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Category[];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}

/**
 * Get single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Category | null;
  } catch (error) {
    console.error(`Failed to fetch category ${slug}:`, error);
    throw error;
  }
}

/**
 * Get subcategories for a parent category (Women subcategories)
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Category[];
  } catch (error) {
    console.error('Failed to fetch subcategories:', error);
    throw error;
  }
}

/**
 * Get category by ID (for admin)
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Category | null;
  } catch (error) {
    console.error(`Failed to fetch category ${id}:`, error);
    throw error;
  }
}

/**
 * Create category (admin only)
 */
export async function createCategory(
  data: Omit<Category, 'id' | 'created_at'>
): Promise<Category> {
  try {
    const { data: result, error } = await supabase
      .from('categories')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as Category;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
}

/**
 * Update category (admin only)
 */
export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  } catch (error) {
    console.error(`Failed to update category ${id}:`, error);
    throw error;
  }
}

/**
 * Delete category (admin only)
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Failed to delete category ${id}:`, error);
    throw error;
  }
}
