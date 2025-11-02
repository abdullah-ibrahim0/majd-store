export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  base_price: number;
  discount_price: number |undefined;
  rating: number | null;           // ✅ ADD THIS
  reviews_count: number | null;     // ✅ ADD THIS
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  image_url?: string | null;        // ✅ ADD THIS
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  category?: Category;
}

export interface ProductForCard extends Product {
  image_url: string | null;        // ✅ CHANGE from `string` to `string | null`
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface UserProfile {
  id: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
  user?: UserProfile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
  size: string | null;
  color: string | null;
}

export interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  min_purchase: number | null;
  max_uses: number | null;
  current_uses: number;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
}
