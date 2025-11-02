import { createClient } from '@/lib/supabase/client';
import type { CartItem } from '@/lib/types';

const supabase = createClient();

/**
 * Get cart items for user or session
 */
export async function getCart(userId?: string, sessionId?: string): Promise<CartItem[]> {
  try {
    let query = supabase.from('cart_items').select(`
      *,
      product:products(*),
      variant:product_variants(*)
    `);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as CartItem[];
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  productId: string,
  variantId: string,
  quantity: number = 1,
  userId?: string,
  sessionId?: string
): Promise<CartItem> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        {
          product_id: productId,
          variant_id: variantId,
          quantity,
          user_id: userId || null,
          session_id: sessionId || null,
        },
        {
          onConflict: userId ? 'user_id,variant_id' : 'session_id,variant_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data as CartItem;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItem> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data as CartItem;
  } catch (error) {
    console.error('Failed to update cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(userId?: string, sessionId?: string): Promise<void> {
  try {
    let query = supabase.from('cart_items').delete();

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { error } = await query;
    if (error) throw error;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    throw error;
  }
}
