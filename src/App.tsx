import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Utensils,
  ChevronLeft,
  ChevronRight,
  Database,
  ShoppingBag,
  Clock,
  Menu as MenuIcon,
  AlertCircle,
  WifiOff
} from "lucide-react";
import { Category, Product, CartItem, Order } from "./types";
import {
  fetchCategoriesFromDB,
  fetchProductsFromDB,
  getCachedCategories,
  getCachedProducts,
  cacheCategories,
  cacheProducts,
  INITIAL_MOCK_CATEGORIES,
  INITIAL_MOCK_PRODUCTS
} from "./lib/supabase";

import MenuHeader from "./components/MenuHeader";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import PreviousOrders from "./components/PreviousOrders";
import Lightbox from "./components/Lightbox";
import Dashboard from "./components/Dashboard";

export default function App() {
  // Database States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFallback, setIsFallback] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Active navigation states
  const [activeHeaderTab, setActiveHeaderTab] = useState<"menu" | "orders">("menu");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Panels toggle
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      return path === "/admin" || path.endsWith("/admin") || hash === "#/admin" || hash === "#admin" || search.includes("admin");
    }
    return false;
  });
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);

  // URL state synchronization
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      setIsDashboardOpen(
        path === "/admin" || path.endsWith("/admin") || hash === "#/admin" || hash === "#admin" || search.includes("admin")
      );
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  const handleOpenDashboard = () => {
    setIsDashboardOpen(true);
    if (window.location.pathname !== "/admin") {
      window.history.pushState({}, "", "/admin");
    }
  };

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  };

  // Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [lastOrderNum, setLastOrderNum] = useState<number | null>(null);

  // --- INITIALIZATION & CACHING LOGIC ---
  useEffect(() => {
    // 1. Immediately load data from Cache (Optimized client loading!)
    const cachedCats = getCachedCategories();
    const cachedProds = getCachedProducts();

    if (cachedCats && cachedProds) {
      setCategories(cachedCats);
      setProducts(cachedProds);
      setIsLoading(false);
      // We assume fallback initially until background check succeeds
    } else {
      // If no cache, load default mocks immediately so UI isn't completely blank
      setCategories(INITIAL_MOCK_CATEGORIES);
      setProducts(INITIAL_MOCK_PRODUCTS);
      cacheCategories(INITIAL_MOCK_CATEGORIES);
      cacheProducts(INITIAL_MOCK_PRODUCTS);
      setIsLoading(false);
    }

    // 2. Load Cart from localStorage
    const savedCart = localStorage.getItem("restaurant_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart", e);
      }
    }

    // 3. Load Previous Orders from localStorage
    const savedOrders = localStorage.getItem("restaurant_previous_orders");
    if (savedOrders) {
      try {
        setPreviousOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Error loading previous orders", e);
      }
    }

    // 4. Background fetch latest from database
    loadLatestData();
  }, []);

  const loadLatestData = async () => {
    try {
      const catResponse = await fetchCategoriesFromDB();
      const prodResponse = await fetchProductsFromDB();

      // If both responses returned non-fallback (live Supabase database), set fallback to false
      const failed = catResponse.fromFallback || prodResponse.fromFallback;
      setIsFallback(failed);

      setCategories(catResponse.data);
      setProducts(prodResponse.data);
    } catch (error) {
      console.error("Failed background loading of database, keeping local cache", error);
      setIsFallback(true);
    }
  };

  // Save Cart to localStorage on change
  const saveCartToLocalStorage = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("restaurant_cart", JSON.stringify(updatedCart));
  };

  // --- CART OPERATIONS ---
  const handleUpdateQuantity = (productId: string, delta: number) => {
    const existingIndex = cartItems.findIndex((item) => item.product.id === productId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + delta;

      if (newQty <= 0) {
        updated.splice(existingIndex, 1);
      } else {
        updated[existingIndex].quantity = newQty;
      }
      saveCartToLocalStorage(updated);
    } else if (delta > 0) {
      const productObj = products.find((p) => p.id === productId);
      if (productObj) {
        saveCartToLocalStorage([...cartItems, { product: productObj, quantity: 1 }]);
      }
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    saveCartToLocalStorage(updated);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Get current order counter from localStorage
    const currentCounterStr = localStorage.getItem("restaurant_order_counter");
    const nextOrderNum = currentCounterStr ? Number(currentCounterStr) + 1 : 101;
    localStorage.setItem("restaurant_order_counter", nextOrderNum.toString());

    const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: nextOrderNum,
      items: cartItems.map((item) => ({
        id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url
      })),
      total_price: totalPrice,
      created_at: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...previousOrders];
    setPreviousOrders(updatedOrders);
    localStorage.setItem("restaurant_previous_orders", JSON.stringify(updatedOrders));

    // Reset current Cart
    saveCartToLocalStorage([]);
    setLastOrderNum(nextOrderNum);
  };

  const handleClearOrders = () => {
    setPreviousOrders([]);
    localStorage.removeItem("restaurant_previous_orders");
    localStorage.removeItem("restaurant_order_counter");
  };

  // --- RENDERING HELPERS ---
  const visibleCategories = categories.filter((c) => c.is_visible);
  
  // Products filter
  const visibleProducts = products.filter((p) => {
    // 1. Must be marked visible in DB
    if (!p.is_visible) return false;

    // 2. Must belong to a visible category
    const cat = categories.find((c) => c.id === p.category_id);
    if (!cat || !cat.is_visible) return false;

    // 3. Match selected category tab (if not 'all')
    if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false;

    // 4. Match search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const badgeMatch = p.badges?.some((b) => b.toLowerCase().includes(q));
      return nameMatch || descMatch || badgeMatch;
    }

    return true;
  });

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  if (isDashboardOpen) {
    return (
      <Dashboard
        categories={categories}
        products={products}
        isFallback={isFallback}
        onRefreshData={loadLatestData}
        onClose={handleCloseDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col font-sans relative pb-24 select-none">
      
      {/* 1. Header with custom branding, stats, and search */}
      <MenuHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenDashboard={handleOpenDashboard}
        onOpenOrders={() => {
          setActiveHeaderTab("orders");
        }}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        hasOrders={previousOrders.length > 0}
        activeTab={activeHeaderTab}
        setActiveTab={setActiveHeaderTab}
      />

      {/* 2. Main content view area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6">

        {activeHeaderTab === "menu" ? (
          isFallback ? (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto my-12 bg-white rounded-[32px] border border-[#f5ebd6] shadow-xl shadow-[#4a2c11]/5 p-8" dir="rtl">
              <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <WifiOff size={36} />
              </div>
              <h3 className="font-extrabold text-[#4a2c11] text-lg sm:text-xl mb-3">لا يوجد اتصال بالإنترنت</h3>
              <p className="text-zinc-600 text-sm leading-relaxed mb-6">
                لايوجد اتصال بالإنترنت تأكد من اتصالك بالإنترنت وحاول مره اخرى
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={loadLatestData}
                  className="w-full py-3.5 bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>إعادة المحاولة 🔄</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6" dir="rtl">
              
              {/* Category horizontal scrolling selector tabs */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-5 py-3 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] text-white shadow-md shadow-[#4a2c11]/25"
                      : "bg-white text-[#4a2c11] hover:bg-[#faf4eb] border border-[#f5ebd6]"
                  }`}
                  id="cat-tab-all"
                >
                  <span>الكل ✨</span>
                </button>

                {visibleCategories
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-3 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedCategory === cat.id
                          ? "bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] text-white shadow-md shadow-[#4a2c11]/25"
                          : "bg-white text-[#4a2c11] hover:bg-[#faf4eb] border border-[#f5ebd6]"
                      }`}
                      id={`cat-tab-${cat.id}`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
              </div>

              {/* Products grid display */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleProducts.map((prod) => {
                  const cartItem = cartItems.find((item) => item.product.id === prod.id);
                  const qty = cartItem ? cartItem.quantity : 0;

                  return (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      quantityInCart={qty}
                      onUpdateQuantity={handleUpdateQuantity}
                      onImageClick={(p) => setLightboxProduct(p)}
                    />
                  );
                })}
              </div>

              {/* Empty Menu State */}
              {visibleProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-zinc-500 font-bold text-sm">عذراً! لا توجد وجبات طعام تطابق بحثك حالياً.</p>
                  <p className="text-zinc-400 text-xs mt-1">جرب البحث بكلمة أخرى أو تصفح الأقسام من الأعلى.</p>
                </div>
              )}
            </div>
          )
        ) : (
          /* Previous Orders Tracker panel */
          <PreviousOrders
            orders={previousOrders}
            onClearOrders={handleClearOrders}
          />
        )}
      </main>

      {/* 3. Sticky bottom action bar when there are items in the cart */}
      <AnimatePresence>
        {cartCount > 0 && activeHeaderTab === "menu" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto bg-[#121212] border border-zinc-800/80 text-white rounded-[32px] p-3 shadow-2xl flex items-center justify-between"
            dir="rtl"
          >
            {/* Right: Total Price */}
            <div className="pr-4">
              <span className="text-zinc-400 text-xs block font-bold">المجموع المستحق</span>
              <span className="text-base sm:text-lg font-black text-white">
                الإجمالي: <span className="text-amber-400 font-display">{cartTotal}</span> ريال
              </span>
            </div>

            {/* Left: Highlighted Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] hover:opacity-90 active:scale-95 text-white font-black text-xs sm:text-sm rounded-[22px] shadow-lg shadow-[#4a2c11]/15 transition-all cursor-pointer flex items-center gap-2"
              id="view-cart-sticky-btn"
            >
              <span>فاتورتك ({cartCount}) 🛒</span>
              <ChevronLeft size={16} className="stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DRAWERS & MODALS --- */}

      {/* Cart Slider Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        lastOrderNum={lastOrderNum}
      />

      {/* Zoomed Lightbox of images */}
      <Lightbox
        product={lightboxProduct}
        onClose={() => setLightboxProduct(null)}
      />
    </div>
  );
}
