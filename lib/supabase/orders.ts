import { createClient } from '@/lib/supabase/client';
import type { Order, OrderItem } from '@/lib/types';

const supabase = createClient();

/**
 * Create order
 */
export async function createOrder(orderData: {
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  notes?: string;
}): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

/**
 * Add items to order
 */
export async function addOrderItems(items: Omit<OrderItem, 'id'>[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('order_items')
      .insert(items);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to add order items:', error);
    throw error;
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    throw error;
  }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Order[]> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        user:profiles(*)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  } catch (error) {
    console.error('Failed to fetch all orders:', error);
    throw error;
  }
}

/**
 * Get single order with items
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Order | null;
  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Update order notes (admin)
 */
export async function updateOrderNotes(
  orderId: string,
  notes: string
): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ notes })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`Failed to update order notes ${orderId}:`, error);
    throw error;
  }
}
