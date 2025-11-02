import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Upload product image to storage
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  try {
    const fileName = `${productId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload product image:', error);
    throw error;
  }
}

/**
 * Upload category image to storage
 */
export async function uploadCategoryImage(
  file: File,
  categoryId: string
): Promise<string> {
  try {
    const fileName = `${categoryId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('category-images')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('category-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload category image:', error);
    throw error;
  }
}

/**
 * Delete image from storage
 */
export async function deleteImage(
  bucket: 'product-images' | 'category-images',
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
}
