import { use } from 'react'
import { getProducts, getFeaturedProducts, getProductBySlug } from '@/lib/supabase/products'

// Use server components async data fetching pattern
export function useProducts(filters?: {
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  featured?: boolean
}) {
  return use(getProducts(filters))
}

export function useFeaturedProducts(limit: number = 4) {
  return use(getFeaturedProducts(limit))
}

export function useProduct(slug: string) {
  return use(getProductBySlug(slug))
}
