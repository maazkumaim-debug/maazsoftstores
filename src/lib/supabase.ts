import { createClient } from "@supabase/supabase-js";
import { Category, Product } from "../types";

// User's provided credentials as fallback so that the app works out of the box in AI Studio
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://eqowmcvcewlkgmlrskax.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxb3dtY3ZjZXdsa2dtbHJza2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NzEwNDgsImV4cCI6MjA5ODM0NzA0OH0.N9Z4fduri2PF8vFtTj7AbLCm0-F9Qnx6AF21SunMFsg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Default mock categories if DB connection fails/empty
export const INITIAL_MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "🍔 البرجر اللذيذ", display_order: 1, is_visible: true },
  { id: "cat-2", name: "🍕 البيتزا الإيطالية", display_order: 2, is_visible: true },
  { id: "cat-3", name: "🍟 المقبلات والبطاطس", display_order: 3, is_visible: true },
  { id: "cat-4", name: "🍹 العصائر والمشروبات", display_order: 4, is_visible: true },
  { id: "cat-5", name: "🍰 الحلويات الشهية", display_order: 5, is_visible: true }
];

// Default mock products if DB connection fails/empty
export const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    category_id: "cat-1",
    name: "برجر اللحم الكلاسيكي",
    description: "شريحة لحم بقري مشوية على اللهب، خس طازج، طماطم، بصل، صلصة المايونيز والكاتشب الخاصة بنا، خبز البريوش الفاخر.",
    price: 320,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    display_order: 1,
    is_visible: true,
    badges: ["🔥 الأكثر مبيعاً", "✨ مميز"]
  },
  {
    id: "prod-2",
    category_id: "cat-1",
    name: "برجر دجاج كرسبي الحار",
    description: "صدر دجاج مقرمش متبل بخلطتنا الحارة، جبنة شيدر ذائبة، خس، هالبينو، وصلصة الديناميت الحارة اللذيذة.",
    price: 280,
    image_url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
    display_order: 2,
    is_visible: true,
    badges: ["🌶️ حار", "✨ جديد"]
  },
  {
    id: "prod-3",
    category_id: "cat-2",
    name: "بيتزا مارغريتا الكلاسيكية",
    description: "صلصة الطماطم الإيطالية الغنية، جبنة الموزاريلا الطبيعية 100%، أوراق الريحان الطازجة، وزيت الزيتون البكر.",
    price: 390,
    image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
    display_order: 1,
    is_visible: true,
    badges: ["🥦 نباتي"]
  },
  {
    id: "prod-4",
    category_id: "cat-2",
    name: "بيتزا بيبيروني بالجبنة",
    description: "شرائح بيبيروني بقري فاخرة، جبنة موزاريلا ذائبة، صلصة البيتزا السرية، رذاذ من العسل الحار.",
    price: 450,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    display_order: 2,
    is_visible: true,
    badges: ["🔥 الأكثر مبيعاً"]
  },
  {
    id: "prod-5",
    category_id: "cat-3",
    name: "بطاطس بالجبنة والبهارات",
    description: "أصابع بطاطس مقرمشة مغطاة بصلصة الجبنة الغنية، قطع اللحم المقدد المقرمش، وهالبينو مفروم.",
    price: 180,
    image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    display_order: 1,
    is_visible: true,
    badges: ["⭐ المفضل للأطفال"]
  },
  {
    id: "prod-6",
    category_id: "cat-4",
    name: "عصير موهيتو الفراولة الطازج",
    description: "مزيج منعش من الفراولة الطازجة، أوراق النعناع، شرائح الليمون، الثلج المجروش والمياه الفوارة.",
    price: 120,
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    display_order: 1,
    is_visible: true,
    badges: ["🍹 منعش"]
  }
];

// Helper to check if tables exist and fetch data, with dynamic fallback
export async function fetchCategoriesFromDB(): Promise<{ data: Category[]; fromFallback: boolean }> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Error fetching categories from DB, using fallback:", error);
      return { data: getCachedCategories() || INITIAL_MOCK_CATEGORIES, fromFallback: true };
    }

    if (!data || data.length === 0) {
      return { data: INITIAL_MOCK_CATEGORIES, fromFallback: true };
    }

    // Save to local cache
    cacheCategories(data);
    return { data, fromFallback: false };
  } catch (err) {
    console.error("Failed to query categories:", err);
    return { data: getCachedCategories() || INITIAL_MOCK_CATEGORIES, fromFallback: true };
  }
}

export async function fetchProductsFromDB(): Promise<{ data: Product[]; fromFallback: boolean }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Error fetching products from DB, using fallback:", error);
      return { data: getCachedProducts() || INITIAL_MOCK_PRODUCTS, fromFallback: true };
    }

    if (!data || data.length === 0) {
      return { data: INITIAL_MOCK_PRODUCTS, fromFallback: true };
    }

    // Adapt database badges format if stored as array or string
    const sanitizedProducts: Product[] = data.map((item) => {
      let badgesArray: string[] = [];
      if (Array.isArray(item.badges)) {
        badgesArray = item.badges;
      } else if (typeof item.badges === "string") {
        try {
          const parsed = JSON.parse(item.badges);
          badgesArray = Array.isArray(parsed) ? parsed : [item.badges];
        } catch {
          badgesArray = item.badges.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }
      return {
        ...item,
        badges: badgesArray
      };
    });

    // Save to local cache
    cacheProducts(sanitizedProducts);
    return { data: sanitizedProducts, fromFallback: false };
  } catch (err) {
    console.error("Failed to query products:", err);
    return { data: getCachedProducts() || INITIAL_MOCK_PRODUCTS, fromFallback: true };
  }
}

// Caching Helpers for Offline-first and Supabase reads optimization
export function getCachedCategories(): Category[] | null {
  const cached = localStorage.getItem("restaurant_categories_cache");
  return cached ? JSON.parse(cached) : null;
}

export function cacheCategories(data: Category[]) {
  localStorage.setItem("restaurant_categories_cache", JSON.stringify(data));
}

export function getCachedProducts(): Product[] | null {
  const cached = localStorage.getItem("restaurant_products_cache");
  return cached ? JSON.parse(cached) : null;
}

export function cacheProducts(data: Product[]) {
  localStorage.setItem("restaurant_products_cache", JSON.stringify(data));
}

// Database write helpers
export async function createOrUpdateCategory(category: Partial<Category>): Promise<{ data: any; error: any }> {
  const isNew = !category.id || category.id.startsWith("cat-");
  
  if (isNew) {
    const newId = category.id?.startsWith("cat-") ? undefined : category.id;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: category.name,
        display_order: category.display_order ?? 0,
        is_visible: category.is_visible ?? true
      })
      .select();
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: category.name,
        display_order: category.display_order,
        is_visible: category.is_visible
      })
      .eq("id", category.id)
      .select();
    return { data, error };
  }
}

export async function deleteCategoryFromDB(id: string): Promise<{ error: any }> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  return { error };
}

export async function createOrUpdateProduct(product: Partial<Product>): Promise<{ data: any; error: any }> {
  const isNew = !product.id || product.id.startsWith("prod-");
  const payload = {
    category_id: product.category_id,
    name: product.name,
    description: product.description ?? "",
    price: product.price ?? 0,
    image_url: product.image_url ?? "",
    display_order: product.display_order ?? 0,
    is_visible: product.is_visible ?? true,
    badges: product.badges ?? []
  };

  if (isNew) {
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select();
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", product.id)
      .select();
    return { data, error };
  }
}

export async function deleteProductFromDB(id: string): Promise<{ error: any }> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}

// SQL Script generator for the user's Supabase dashboard
export const SQL_SETUP_SCRIPT = `-- انسخ هذا الكود والصقه في محرّر SQL في Supabase (SQL Editor) لإنشاء الجداول المطلوبة:

-- 1. جدول الفئات/الأقسام
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  badges TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. تفعيل الحماية لـ Row Level Security (اختياري، أو تعطيلها للتبسيط)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الوصول (السماح للجميع بالقراءة، وللمستخدمين غير الموثقين بالتعديل للتبسيط في العرض التجريبي)
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON products FOR DELETE USING (true);

-- 5. إدراج بيانات تجريبية (فئات)
INSERT INTO categories (id, name, display_order, is_visible) VALUES
  ('11111111-1111-1111-1111-111111111111', '🍔 البرجر اللذيذ', 1, TRUE),
  ('22222222-2222-2222-2222-222222222222', '🍕 البيتزا الإيطالية', 2, TRUE),
  ('33333333-3333-3333-3333-333333333333', '🍟 المقبلات والبطاطس', 3, TRUE),
  ('44444444-4444-4444-4444-444444444444', '🍹 العصائر والمشروبات', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. إدراج بيانات تجريبية (منتجات)
INSERT INTO products (category_id, name, description, price, image_url, display_order, is_visible, badges) VALUES
  ('11111111-1111-1111-1111-111111111111', 'برجر اللحم الكلاسيكي', 'شريحة لحم بقري مشوية على اللهب، خس طازج، طماطم، صلصة المايونيز الخاصة خبز البريوش الفاخر.', 320, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 1, TRUE, ARRAY['🔥 الأكثر مبيعاً', '✨ مميز']),
  ('11111111-1111-1111-1111-111111111111', 'برجر دجاج كرسبي الحار', 'صدر دجاج مقرمش متبل بخلطتنا الحارة، جبنة شيدر ذائبة، خس، هالبينو، وصلصة الديناميت الحارة.', 280, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80', 2, TRUE, ARRAY['🌶️ حار', '✨ جديد']),
  ('22222222-2222-2222-2222-222222222222', 'بيتزا مارغريتا الكلاسيكية', 'صلصة الطماطم الإيطالية الغنية، جبنة الموزاريلا الطبيعية 100%، أوراق الريحان الطازجة.', 390, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80', 1, TRUE, ARRAY['🥦 نباتي']),
  ('33333333-3333-3333-3333-333333333333', 'بطاطس بالجبنة والبهارات', 'أصابع بطاطس مقرمشة مغطاة بصلصة الجبنة الغنية، قطع اللحم المقدد المقرمش، وهالبينو مفروم.', 180, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80', 1, TRUE, ARRAY['⭐ المفضل للأطفال'])
ON CONFLICT DO NOTHING;
`;
