import { useState, useEffect } from 'react'
import type { CartItem } from '@/lib/types'
import { getCart, addToCart, removeFromCart, updateCartItemQuantity } from '@/lib/supabase/cart'

export function useCart(userId?: string, sessionId?: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Initial load
  useEffect(() => {
    if (!userId && !sessionId) return
    getCart(userId, sessionId).then(setCartItems).catch(console.error)
  }, [userId, sessionId])

  // Add to cart handler
  const addItem = async (productId: string, variantId: string, quantity: number = 1) => {
    try {
      const item = await addToCart(productId, variantId, quantity, userId, sessionId)
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => i.id === item.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = item
          return updated
        } else {
          return [...prev, item]
        }
      })
    } catch (error) {
      console.error('Add to cart failed', error)
    }
  }

  // Remove cart item handler
  const removeItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId)
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId))
    } catch (error) {
      console.error('Remove from cart failed', error)
    }
  }

  // Update quantity handler
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return
    try {
      const updatedItem = await updateCartItemQuantity(cartItemId, quantity)
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => i.id === cartItemId)
        if (idx < 0) return prev
        const updated = [...prev]
        updated[idx] = updatedItem
        return updated
      })
    } catch (error) {
      console.error('Update quantity failed', error)
    }
  }

  return {
    cartItems, addItem, removeItem, updateQuantity,
  }
}
