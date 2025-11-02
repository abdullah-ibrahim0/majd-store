import { use } from 'react'
import { getCategories, getSubcategories } from '@/lib/supabase/categories'

export function useCategories() {
  return use(getCategories())
}

export function useSubcategories(parentId: string) {
  return use(getSubcategories(parentId))
}
