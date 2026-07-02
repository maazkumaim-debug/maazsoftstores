import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  Check,
  Copy,
  FolderPlus,
  Package,
  Layers,
  Search,
  Lock,
  X,
  Settings
} from "lucide-react";
import { Category, Product } from "../types";
import {
  SQL_SETUP_SCRIPT,
  createOrUpdateCategory,
  deleteCategoryFromDB,
  createOrUpdateProduct,
  deleteProductFromDB
} from "../lib/supabase";

interface DashboardProps {
  categories: Category[];
  products: Product[];
  isFallback: boolean;
  onRefreshData: () => void;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { name: "برجر كلاسيك", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80" },
  { name: "برجر دجاج", url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80" },
  { name: "بيتزا مارغريتا", url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80" },
  { name: "بيتزا بيبيروني", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
  { name: "بطاطس جبنة", url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80" },
  { name: "سلطة يونانية", url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80" },
  { name: "موهيتو فراولة", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80" },
  { name: "كعكة شوكولاتة", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80" }
];

const PRESET_BADGES = [
  "🌶️ حار",
  "🔥 الأكثر مبيعاً",
  "✨ جديد",
  "🥦 نباتي",
  "👨‍🍳 توقيع الشيف",
  "⭐ المفضل للأطفال",
  "🍯 عسل حار",
  "🧀 دبل جبنة"
];

export default function Dashboard({
  categories,
  products,
  isFallback,
  onRefreshData,
  onClose
}: DashboardProps) {
  // Authorization State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  // Security Form State
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  const getSavedPin = () => {
    return localStorage.getItem("restaurant_dashboard_pin") || "1234";
  };

  // General Tabs: "categories" | "products" | "sql" | "security" | "settings"
  const [activeTab, setActiveTab] = useState<"categories" | "products" | "sql" | "security" | "settings">("products");

  // Store Settings state
  const [storeNameState, setStoreNameState] = useState(() => localStorage.getItem("store_name") || "ايسي كوب | Icy Cup");
  const [storeDescState, setStoreDescState] = useState(() => localStorage.getItem("store_description") || "انتعاشك اليومي");
  const [creditTextState, setCreditTextState] = useState(() => localStorage.getItem("credit_text") ?? "برمجة وتصميم / معاذ الكميم");
  const [creditPhoneState, setCreditPhoneState] = useState(() => localStorage.getItem("credit_phone") ?? "779698389");

  // Notification Banner State
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState<string | null>(null);

  // Category Edit Form State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Product Edit Form State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [customBadgeText, setCustomBadgeText] = useState("");

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin === getSavedPin()) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("store_name", storeNameState.trim() || "ايسي كوب | Icy Cup");
    localStorage.setItem("store_description", storeDescState.trim() || "انتعاشك اليومي");
    localStorage.setItem("credit_text", creditTextState.trim());
    localStorage.setItem("credit_phone", creditPhoneState.trim());
    setDbStatusMsg("تم تحديث معلومات المتجر وحقوق التصميم بنجاح!");
  };

  const handleChangePin = (e: FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) {
      alert("الرجاء إدخال رمز أمان غير فارغ.");
      return;
    }
    if (newPin.trim().length < 4) {
      alert("الرجاء اختيار رمز أمان لا يقل عن 4 أرقام.");
      return;
    }
    if (newPin !== confirmNewPin) {
      alert("رمزا الأمان اللذان أدخلتهما غير متطابقين.");
      return;
    }
    localStorage.setItem("restaurant_dashboard_pin", newPin.trim());
    setDbStatusMsg(`تم تحديث رمز الأمان بنجاح! الرمز الجديد هو: ${newPin.trim()}`);
    setNewPin("");
    setConfirmNewPin("");
  };

  const copySQLToClipboard = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  // --- Category Actions ---
  const handleOpenNewCategory = () => {
    setEditingCategory({
      name: "",
      display_order: categories.length + 1,
      is_visible: true
    });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory?.name?.trim()) return;
    setIsSavingCategory(true);
    try {
      if (isFallback) {
        // Fallback simulated update
        const id = editingCategory.id || `cat-${Date.now()}`;
        const updatedCat: Category = {
          id,
          name: editingCategory.name,
          display_order: editingCategory.display_order ?? 1,
          is_visible: editingCategory.is_visible ?? true
        };
        const currentCache = JSON.parse(localStorage.getItem("restaurant_categories_cache") || "[]");
        let updatedCache;
        if (editingCategory.id) {
          updatedCache = currentCache.map((c: any) => (c.id === id ? updatedCat : c));
        } else {
          updatedCache = [...currentCache, updatedCat];
        }
        localStorage.setItem("restaurant_categories_cache", JSON.stringify(updatedCache));
        setDbStatusMsg("تم حفظ القسم بنجاح محلياً!");
      } else {
        const { error } = await createOrUpdateCategory(editingCategory);
        if (error) throw error;
        setDbStatusMsg("تم تحديث القسم في قاعدة بيانات Supabase بنجاح!");
      }
      setEditingCategory(null);
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert(`فشل الحفظ: ${err.message || err}`);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع منتجاته أيضاً.")) return;
    try {
      if (isFallback) {
        const currentCache = JSON.parse(localStorage.getItem("restaurant_categories_cache") || "[]");
        const updatedCache = currentCache.filter((c: any) => c.id !== id);
        localStorage.setItem("restaurant_categories_cache", JSON.stringify(updatedCache));

        // Delete associated products
        const prodCache = JSON.parse(localStorage.getItem("restaurant_products_cache") || "[]");
        const updatedProdCache = prodCache.filter((p: any) => p.category_id !== id);
        localStorage.setItem("restaurant_products_cache", JSON.stringify(updatedProdCache));

        setDbStatusMsg("تم الحذف بنجاح محلياً!");
      } else {
        const { error } = await deleteCategoryFromDB(id);
        if (error) throw error;
        setDbStatusMsg("تم حذف القسم من Supabase!");
      }
      onRefreshData();
    } catch (err: any) {
      alert(`فشل الحذف: ${err.message || err}`);
    }
  };

  const handleToggleCategoryVisibility = async (cat: Category) => {
    try {
      const payload = { ...cat, is_visible: !cat.is_visible };
      if (isFallback) {
        const currentCache = JSON.parse(localStorage.getItem("restaurant_categories_cache") || "[]");
        const updatedCache = currentCache.map((c: any) => (c.id === cat.id ? payload : c));
        localStorage.setItem("restaurant_categories_cache", JSON.stringify(updatedCache));
      } else {
        await createOrUpdateCategory(payload);
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderCategory = async (cat: Category, direction: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((c) => c.id === cat.id);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const otherCat = sorted[swapIdx];

    // Swap their display order values
    const originalOrder = cat.display_order;
    const swapOrder = otherCat.display_order;

    // Ensure we have unique non-overlapping orders, if they are identical
    const catNewOrder = originalOrder === swapOrder ? (direction === "up" ? originalOrder - 1 : originalOrder + 1) : swapOrder;
    const otherNewOrder = originalOrder;

    try {
      if (isFallback) {
        const currentCache = JSON.parse(localStorage.getItem("restaurant_categories_cache") || "[]");
        const updatedCache = currentCache.map((c: any) => {
          if (c.id === cat.id) return { ...c, display_order: catNewOrder };
          if (c.id === otherCat.id) return { ...c, display_order: otherNewOrder };
          return c;
        });
        localStorage.setItem("restaurant_categories_cache", JSON.stringify(updatedCache));
      } else {
        await createOrUpdateCategory({ id: cat.id, name: cat.name, display_order: catNewOrder, is_visible: cat.is_visible });
        await createOrUpdateCategory({ id: otherCat.id, name: otherCat.name, display_order: otherNewOrder, is_visible: otherCat.is_visible });
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };


  // --- Product Actions ---
  const handleOpenNewProduct = () => {
    setEditingProduct({
      name: "",
      description: "",
      price: 150,
      image_url: PRESET_IMAGES[0].url,
      category_id: categories[0]?.id || "",
      display_order: products.length + 1,
      is_visible: true,
      badges: []
    });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name?.trim() || !editingProduct?.category_id) return;
    setIsSavingProduct(true);
    try {
      if (isFallback) {
        const id = editingProduct.id || `prod-${Date.now()}`;
        const updatedProd: Product = {
          id,
          category_id: editingProduct.category_id,
          name: editingProduct.name,
          description: editingProduct.description ?? "",
          price: Number(editingProduct.price) || 0,
          image_url: editingProduct.image_url ?? "",
          display_order: editingProduct.display_order ?? 1,
          is_visible: editingProduct.is_visible ?? true,
          badges: editingProduct.badges ?? []
        };
        const currentCache = JSON.parse(localStorage.getItem("restaurant_products_cache") || "[]");
        let updatedCache;
        if (editingProduct.id) {
          updatedCache = currentCache.map((p: any) => (p.id === id ? updatedProd : p));
        } else {
          updatedCache = [...currentCache, updatedProd];
        }
        localStorage.setItem("restaurant_products_cache", JSON.stringify(updatedCache));
        setDbStatusMsg("تم حفظ المنتج بنجاح محلياً!");
      } else {
        const { error } = await createOrUpdateProduct(editingProduct);
        if (error) throw error;
        setDbStatusMsg("تم تحديث المنتج في قاعدة بيانات Supabase بنجاح!");
      }
      setEditingProduct(null);
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert(`فشل الحفظ: ${err.message || err}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      if (isFallback) {
        const currentCache = JSON.parse(localStorage.getItem("restaurant_products_cache") || "[]");
        const updatedCache = currentCache.filter((p: any) => p.id !== id);
        localStorage.setItem("restaurant_products_cache", JSON.stringify(updatedCache));
        setDbStatusMsg("تم حذف المنتج بنجاح محلياً!");
      } else {
        const { error } = await deleteProductFromDB(id);
        if (error) throw error;
        setDbStatusMsg("تم حذف المنتج من قاعدة البيانات!");
      }
      onRefreshData();
    } catch (err: any) {
      alert(`فشل الحذف: ${err.message || err}`);
    }
  };

  const handleToggleProductVisibility = async (prod: Product) => {
    try {
      const payload = { ...prod, is_visible: !prod.is_visible };
      if (isFallback) {
        const currentCache = JSON.parse(localStorage.getItem("restaurant_products_cache") || "[]");
        const updatedCache = currentCache.map((p: any) => (p.id === prod.id ? payload : p));
        localStorage.setItem("restaurant_products_cache", JSON.stringify(updatedCache));
      } else {
        await createOrUpdateProduct(payload);
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderProduct = async (prod: Product, direction: "up" | "down") => {
    // Filter products within the same category to re-order them properly
    const catProds = [...products]
      .filter((p) => p.category_id === prod.category_id)
      .sort((a, b) => a.display_order - b.display_order);

    const idx = catProds.findIndex((p) => p.id === prod.id);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= catProds.length) return;

    const otherProd = catProds[swapIdx];

    const originalOrder = prod.display_order;
    const swapOrder = otherProd.display_order;

    const prodNewOrder = originalOrder === swapOrder ? (direction === "up" ? originalOrder - 1 : originalOrder + 1) : swapOrder;
    const otherNewOrder = originalOrder;

    try {
      if (isFallback) {
        const currentCache = JSON.parse(localStorage.getItem("restaurant_products_cache") || "[]");
        const updatedCache = currentCache.map((p: any) => {
          if (p.id === prod.id) return { ...p, display_order: prodNewOrder };
          if (p.id === otherProd.id) return { ...p, display_order: otherNewOrder };
          return p;
        });
        localStorage.setItem("restaurant_products_cache", JSON.stringify(updatedCache));
      } else {
        await createOrUpdateProduct({ ...prod, display_order: prodNewOrder });
        await createOrUpdateProduct({ ...otherProd, display_order: otherNewOrder });
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBadge = (badge: string) => {
    if (!editingProduct) return;
    const currentBadges = editingProduct.badges || [];
    let updated: string[];
    if (currentBadges.includes(badge)) {
      updated = currentBadges.filter((b) => b !== badge);
    } else {
      updated = [...currentBadges, badge];
    }
    setEditingProduct({ ...editingProduct, badges: updated });
  };

  const handleAddCustomBadge = () => {
    if (!editingProduct || !customBadgeText.trim()) return;
    const currentBadges = editingProduct.badges || [];
    if (!currentBadges.includes(customBadgeText.trim())) {
      setEditingProduct({
        ...editingProduct,
        badges: [...currentBadges, customBadgeText.trim()]
      });
    }
    setCustomBadgeText("");
  };

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const searchMatch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.description.toLowerCase().includes(productSearch.toLowerCase());
    return searchMatch;
  });

  // --- RENDERS ---

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">لوحة تحكم المدير</h3>
            <p className="text-zinc-400 text-xs">يرجى إدخال رمز الأمان لإدارة الأقسام والمنتجات.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="أدخل رمز الأمان المخصص أو (1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-center text-white text-lg tracking-widest focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-500 placeholder:tracking-normal placeholder:text-xs"
                autoFocus
                id="pin-input"
              />
              {pinError && (
                <p className="text-red-500 text-xs font-semibold mt-2">الرمز الذي أدخلته غير صحيح. يرجى المحاولة مجدداً.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-colors cursor-pointer text-sm"
              >
                العودة للمنيو
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold rounded-xl shadow-md shadow-amber-500/10 transition-colors cursor-pointer text-sm"
              >
                دخول
              </button>
            </div>
          </form>

          <div className="text-[10px] text-zinc-600 border-t border-zinc-800 pt-4">
            💡 رمز الأمان الافتراضي هو <code className="text-zinc-400">1234</code> (يمكن تعديله لاحقاً من داخل لوحة التحكم)
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden" dir="rtl">
      {/* DB Status Message Alert */}
      <AnimatePresence>
        {dbStatusMsg && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-50 bg-amber-500 text-zinc-950 p-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-between"
          >
            <span>{dbStatusMsg}</span>
            <button
              onClick={() => setDbStatusMsg(null)}
              className="p-1 hover:bg-amber-600/30 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-zinc-950 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">إدارة المطعم المتكاملة</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isFallback ? "bg-amber-500 animate-pulse" : "bg-green-500 animate-ping"}`} />
              <span className="text-[10px] text-zinc-400 font-semibold">
                {isFallback ? "وضع المحاكاة (كاش محلي)" : "متصل بـ Supabase"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
          id="exit-dashboard-btn"
        >
          <span>الخروج من لوحة التحكم</span>
          <ArrowRight size={14} className="rotate-180" />
        </button>
      </header>

      {/* Main Tabs Selection */}
      <div className="bg-zinc-900 px-6 border-b border-zinc-800 flex gap-4 overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveTab("products")}
          className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "products" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Package size={14} />
          <span>المنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "categories" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Layers size={14} />
          <span>الأقسام وفئات الطعام ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "sql" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Database size={14} />
          <span>مزامنة قاعدة البيانات SQL</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "security" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Lock size={14} />
          <span>رمز الدخول والأمان</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "settings" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Settings size={14} />
          <span>إعدادات المتجر</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
        
        {/* --- SQL INSTRUCTIONS PANEL (HIGH IMPORTANCE) --- */}
        {activeTab === "sql" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-400 text-xs leading-relaxed">
              <Info className="shrink-0" size={18} />
              <div>
                <p className="font-bold mb-1 text-white">لماذا هذا السكريبت؟</p>
                <p>
                  قاعدة بيانات Supabase الخاصة بك تحتاج إلى هيكل معين للجداول لتخزين الأقسام والمنتجات مع خاصية الترتيب والأوسمة. انسخ هذا الكود والصقه مباشرة في محرّر Supabase (SQL Editor) لبناء الجداول وتفعيل الحماية تلقائياً وتسهيل الاتصال الحي.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-zinc-800/60 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">سكريبت إعداد الجداول (SQL Script)</span>
                <button
                  onClick={copySQLToClipboard}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 px-3 py-1.5 bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                  id="copy-sql-btn"
                >
                  {copiedSQL ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSQL ? "تم النسخ!" : "نسخ السكريبت"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] text-zinc-300 font-mono leading-relaxed bg-zinc-950 max-h-[400px]">
                {SQL_SETUP_SCRIPT}
              </pre>
            </div>
          </div>
        )}

        {/* --- SECURITY TAB --- */}
        {activeTab === "security" && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-400 text-xs leading-relaxed">
              <Lock className="shrink-0 text-amber-500" size={18} />
              <div>
                <p className="font-bold mb-1 text-white">رمز الدخول والأمان للوحة التحكم</p>
                <p>
                  يمكنك تغيير رمز المرور الخاص بلوحة التحكم هنا لحماية منيو المطعم الخاص بك. الرمز الجديد سيتم حفظه محلياً في المتصفح وسيُطلب عند محاولة الدخول للوحة التحكم في المرات القادمة.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePin} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-black text-white border-b border-zinc-800 pb-3">تحديث رمز الأمان</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">الرمز الجديد (4 أرقام أو أكثر)</label>
                  <input
                    type="password"
                    placeholder="أدخل الرمز السري الجديد"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">تأكيد الرمز الجديد</label>
                  <input
                    type="password"
                    placeholder="أعد إدخال الرمز السري للتأكيد"
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} className="stroke-[3]" />
                <span>حفظ رمز الدخول الجديد</span>
              </button>
            </form>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-400 text-xs leading-relaxed">
              <Settings className="shrink-0 text-amber-500" size={18} />
              <div>
                <p className="font-bold mb-1 text-white">إعدادات وهوية المتجر</p>
                <p>
                  من هنا يمكنك تعديل الاسم التجاري لمتجرك والوصف الفرعي الذي يظهر في أعلى صفحة المنيو الإلكتروني مباشرة.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-black text-white border-b border-zinc-800 pb-3">تعديل اسم المتجر وحقوق البرمجة والتصميم</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">اسم المتجر (مثال: ROYAL BAKERY)</label>
                  <input
                    type="text"
                    placeholder="أدخل اسم المتجر الجديد"
                    value={storeNameState}
                    onChange={(e) => setStoreNameState(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">وصف المتجر (مثال: منيو الكتروني ذكي وفاخر)</label>
                  <input
                    type="text"
                    placeholder="أدخل وصف المتجر الفرعي"
                    value={storeDescState}
                    onChange={(e) => setStoreDescState(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-2">
                  <h4 className="text-xs font-black text-amber-500 mb-3">حقوق البرمجة والتصميم (أعلى يمين الصفحة)</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">نص الحقوق الرئيسي (مثال: برمجة وتصميم / معاذ الكميم)</label>
                      <input
                        type="text"
                        placeholder="أدخل نص الحقوق"
                        value={creditTextState}
                        onChange={(e) => setCreditTextState(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">الرقم الفرعي / رقم الهاتف (مثال: 779698389)</label>
                      <input
                        type="text"
                        placeholder="أدخل رقم الهاتف أو النص الإضافي"
                        value={creditPhoneState}
                        onChange={(e) => setCreditPhoneState(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} className="stroke-[3]" />
                <span>حفظ التعديلات</span>
              </button>
            </form>
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === "categories" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">إدارة الأقسام وفئات المنيو</h3>
                <p className="text-zinc-400 text-xs">قم بإضافة وتعديل وحذف الأقسام وتغيير ترتيب ظهورها للعملاء.</p>
              </div>
              <button
                onClick={handleOpenNewCategory}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                id="add-cat-btn"
              >
                <FolderPlus size={14} />
                <span>إضافة فئة جديدة</span>
              </button>
            </div>

            {/* List */}
            <div className="grid gap-3">
              {categories
                .sort((a, b) => a.display_order - b.display_order)
                .map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-display text-xs">#{cat.display_order}</span>
                        <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                      </div>
                      {!cat.is_visible && (
                        <span className="px-2.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 rounded-full flex items-center gap-1 font-semibold">
                          <EyeOff size={10} /> مخفي عن الزوار
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Sorting */}
                      <button
                        onClick={() => handleOrderCategory(cat, "up")}
                        disabled={idx === 0}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all disabled:opacity-20 cursor-pointer"
                        title="تحريك لأعلى"
                        id={`cat-up-${cat.id}`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleOrderCategory(cat, "down")}
                        disabled={idx === categories.length - 1}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all disabled:opacity-20 cursor-pointer"
                        title="تحريك لأسفل"
                        id={`cat-down-${cat.id}`}
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => handleToggleCategoryVisibility(cat)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          cat.is_visible ? "bg-zinc-800 text-emerald-500 hover:bg-zinc-700" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                        }`}
                        title={cat.is_visible ? "إخفاء عن الزوار" : "إظهار للزوار"}
                        id={`cat-vis-${cat.id}`}
                      >
                        {cat.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-500 hover:text-amber-400 rounded-xl transition-colors cursor-pointer"
                        title="تعديل الاسم"
                        id={`cat-edit-${cat.id}`}
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 bg-zinc-800 hover:bg-red-950/50 text-red-500 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                        title="حذف القسم"
                        id={`cat-del-${cat.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

              {categories.length === 0 && (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  لا توجد أي فئات مضافة حالياً. أضف قسماً لتبدأ بترتيبه!
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === "products" && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white">إدارة وجبات ومنتجات المنيو</h3>
                <p className="text-zinc-400 text-xs">قم بإضافة وتعديل وترتيب المنتجات وحذفها من قاعدة البيانات.</p>
              </div>

              <div className="flex gap-2.5 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="ابحث عن وجبة..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    id="prod-search-input"
                  />
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors whitespace-nowrap"
                  id="add-prod-btn"
                >
                  <Plus size={14} />
                  <span>إضافة وجبة جديدة</span>
                </button>
              </div>
            </div>

            {/* List by Categories for elegant layout */}
            <div className="space-y-6">
              {categories.map((cat) => {
                const catProducts = filteredProducts
                  .filter((p) => p.category_id === cat.id)
                  .sort((a, b) => a.display_order - b.display_order);

                if (catProducts.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
                      {cat.name}
                    </h4>

                    <div className="grid gap-3">
                      {catProducts.map((prod, idx) => (
                        <div
                          key={prod.id}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                              <img
                                src={prod.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <h5 className="font-bold text-sm text-white">{prod.name}</h5>
                                <span className="text-[10px] text-zinc-500 font-display">#{prod.display_order}</span>
                                {!prod.is_visible && (
                                  <span className="px-1.5 py-0.5 bg-zinc-800 text-[9px] text-zinc-400 rounded-full flex items-center gap-0.5 font-semibold">
                                    <EyeOff size={8} /> مخفي
                                  </span>
                                )}
                              </div>
                              <p className="text-zinc-400 text-xs line-clamp-1 max-w-sm sm:max-w-md">
                                {prod.description || "لا يوجد وصف"}
                              </p>
                              {/* Badges */}
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[10px] text-amber-500 font-extrabold mr-1">
                                  {prod.price} ر.س
                                </span>
                                {prod.badges && prod.badges.map((b, i) => (
                                  <span key={i} className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-md font-medium">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {/* Sorting */}
                            <button
                              onClick={() => handleOrderProduct(prod, "up")}
                              disabled={idx === 0}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer"
                              title="تحريك لأعلى"
                              id={`prod-up-${prod.id}`}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => handleOrderProduct(prod, "down")}
                              disabled={idx === catProducts.length - 1}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer"
                              title="تحريك لأسفل"
                              id={`prod-down-${prod.id}`}
                            >
                              <ArrowDown size={12} />
                            </button>

                            {/* Visibility */}
                            <button
                              onClick={() => handleToggleProductVisibility(prod)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                prod.is_visible ? "bg-zinc-800 text-emerald-500 hover:bg-zinc-700" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                              }`}
                              title={prod.is_visible ? "إخفاء الوجبة" : "إظهار الوجبة"}
                              id={`prod-vis-${prod.id}`}
                            >
                              {prod.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-500 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                              title="تعديل الوجبة"
                              id={`prod-edit-${prod.id}`}
                            >
                              <Edit2 size={12} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 bg-zinc-800 hover:bg-red-950/50 text-red-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="حذف الوجبة"
                              id={`prod-del-${prod.id}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {products.length === 0 && (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  لا توجد أي وجبات طعام مضافة حالياً. أضف وجبة لتبدأ!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- CATEGORY EDITING DIALOG (MODAL) --- */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4 text-zinc-100"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} />
              <span>{editingCategory.id ? "تعديل قسم الطعام" : "إضافة قسم جديد"}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">اسم القسم (مع الإيموجي للمنظر الجمالي)</label>
                <input
                  type="text"
                  placeholder="مثال: 🍔 البرجر اللذيذ"
                  value={editingCategory.name || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  id="cat-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">ترتيب العرض (الرقم الأصغر يظهر أولاً)</label>
                <input
                  type="number"
                  placeholder="ترتيب الفئة"
                  value={editingCategory.display_order ?? ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, display_order: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  id="cat-order-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat-visible-checkbox"
                  checked={editingCategory.is_visible ?? true}
                  onChange={(e) => setEditingCategory({ ...editingCategory, is_visible: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="cat-visible-checkbox" className="text-xs font-bold text-zinc-300">ظهور للزوار ومستخدمي المنيو</label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={isSavingCategory}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                id="save-cat-btn"
              >
                {isSavingCategory ? "جاري الحفظ..." : "حفظ القسم"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- PRODUCT EDITING DIALOG (MODAL) --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4 text-zinc-100 my-8"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} />
              <span>{editingProduct.id ? "تعديل الوجبة" : "إضافة وجبة جديدة"}</span>
            </h3>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">القسم الفئة المنتمية لها</label>
                <select
                  value={editingProduct.category_id || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-white"
                  id="prod-cat-select"
                >
                  <option value="">-- اختر القسم --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">اسم الوجبة</label>
                  <input
                    type="text"
                    placeholder="مثال: برجر دجاج مقرمش"
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-white"
                    id="prod-name-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">السعر (ر.س)</label>
                  <input
                    type="number"
                    placeholder="مثال: 25"
                    value={editingProduct.price ?? ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-white"
                    id="prod-price-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">وصف المكونات</label>
                <textarea
                  placeholder="وصف مكونات الوجبة ومميزاتها بالتفصيل..."
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-white"
                  id="prod-desc-input"
                />
              </div>

              {/* Image URL with presets */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">رابط صورة الوجبة</label>
                <input
                  type="text"
                  placeholder="انسخ رابط صورة طعام أو اختر من النماذج بالأسفل"
                  value={editingProduct.image_url || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-white mb-2"
                  id="prod-image-input"
                />

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block font-semibold">نماذج صور طعام جاهزة بنقرة واحدة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image_url: img.url })}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                          editingProduct.image_url === img.url
                            ? "bg-amber-500/10 border-amber-500 text-amber-500"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges/Tags selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">أوسمة وتصنيفات الوجبة</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_BADGES.map((badge) => {
                    const hasBadge = editingProduct.badges?.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => handleToggleBadge(badge)}
                        className={`px-2.5 py-1 text-xs rounded-xl border transition-all cursor-pointer ${
                          hasBadge
                            ? "bg-amber-500 text-zinc-950 border-amber-500 font-extrabold"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 font-semibold"
                        }`}
                      >
                        {badge}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Badge addition */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أو اكتب وساماً مخصصاً..."
                    value={customBadgeText}
                    onChange={(e) => setCustomBadgeText(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    id="custom-badge-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBadge}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* display order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">ترتيب المنتج داخل القسم</label>
                  <input
                    type="number"
                    value={editingProduct.display_order ?? ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, display_order: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-white"
                    id="prod-order-input"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="prod-visible-checkbox"
                    checked={editingProduct.is_visible ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_visible: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="prod-visible-checkbox" className="text-xs font-bold text-zinc-300">ظهور للزوار بالمنيو</label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={isSavingProduct}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                id="save-prod-btn"
              >
                {isSavingProduct ? "جاري الحفظ..." : "حفظ المنتج"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
