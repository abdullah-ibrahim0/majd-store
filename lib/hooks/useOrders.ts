import { useState, useEffect } from 'react'
import type { Order } from '@/lib/types'
import { getUserOrders, getAllOrders, updateOrderStatus } from '@/lib/supabase/orders'

export function useUserOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    getUserOrders(userId).then(setOrders).catch(console.error)
  }, [userId])

  return {
    orders
  }
}

export function useAdminOrders(filter?: { status?: string }) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    getAllOrders(filter).then(setOrders).catch(console.error)
  }, [filter?.status])

  return {
    orders
  }
}

export async function changeOrderStatus(orderId: string, status: string) {
  try {
    return await updateOrderStatus(orderId, status)
  } catch (e) {
    console.error('Failed to update order status', e)
  }
}
