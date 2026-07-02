export interface Category {
  id: string;
  name: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  display_order: number;
  is_visible: boolean;
  badges: string[]; // e.g. ["🌶️ الحار", "🔥 الأكثر مبيعاً", "✨ جديد"]
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: number;
  items: OrderItem[];
  total_price: number;
  created_at: string;
}
