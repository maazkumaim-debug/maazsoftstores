import { motion } from "motion/react";
import { Search, ShoppingBag, Utensils, Award, Clock, ShieldCheck, Database, FileText } from "lucide-react";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenDashboard: () => void;
  onOpenOrders: () => void;
  cartCount: number;
  onOpenCart: () => void;
  hasOrders: boolean;
  activeTab: "menu" | "orders";
  setActiveTab: (tab: "menu" | "orders") => void;
}

export default function MenuHeader({
  searchQuery,
  onSearchChange,
  onOpenDashboard,
  onOpenOrders,
  cartCount,
  onOpenCart,
  hasOrders,
  activeTab,
  setActiveTab
}: MenuHeaderProps) {
  const storeName = typeof window !== "undefined" ? (localStorage.getItem("store_name") || "ايسي كوب | Icy Cup") : "ايسي كوب | Icy Cup";
  const storeDesc = typeof window !== "undefined" ? (localStorage.getItem("store_description") || "انتعاشك اليومي") : "انتعاشك اليومي";

  return (
    <header className="relative bg-[#20100a] text-[#fdf8f4] overflow-hidden pb-6 shrink-0" dir="rtl">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,90,43,0.3),transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8b5a2b]/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 pt-5 space-y-5 relative z-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#321c13] pb-3">
          {/* Right Brand Logo & Left Developer Credits */}
          <div className="flex items-center justify-between w-full">
            {/* Right: Brand Title */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥤</span>
              <div>
                <h1 className="text-lg font-black tracking-wider text-[#e4a86a] flex items-center gap-1">
                  {storeName}
                </h1>
                <p className="text-[10px] text-[#b09282] font-bold">{storeDesc}</p>
              </div>
            </div>

            {/* Left: Designer & Programmer Credits (Exactly as in the image!) */}
            <div className="text-left font-sans select-text shrink-0">
              <p className="text-emerald-500 text-[11px] sm:text-xs font-black leading-tight">
                برمجة وتصميم / معاذ الكميم
              </p>
              <p className="text-emerald-500 text-[11px] sm:text-xs font-black tracking-widest mt-0.5">
                779698389
              </p>
            </div>
          </div>

          {/* Action Buttons row */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 border-t border-[#321c13] pt-2 sm:pt-0 sm:border-0">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] hover:opacity-90 text-white rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 px-3"
              aria-label="عرض الفاتورة"
              id="cart-floating-btn"
            >
              <ShoppingBag size={15} className="stroke-[2.5]" />
              <span className="text-[10px] font-bold">فاتورتك ({cartCount})</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-1 border-[#20100a] font-display animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs and Search Bar */}
        <div className="space-y-3">
          {/* Menu / Previous orders tabs */}
          <div className="flex border-b border-[#321c13]">
            <button
              onClick={() => setActiveTab("menu")}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "menu" ? "border-[#e4a86a] text-[#e4a86a]" : "border-transparent text-zinc-400 hover:text-white"
              }`}
              id="tab-menu"
            >
              <Utensils size={13} />
              <span>قائمة المشروبات والمنيو</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`mr-6 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "orders" ? "border-[#e4a86a] text-[#e4a86a]" : "border-transparent text-zinc-400 hover:text-white"
              }`}
              id="tab-orders"
            >
              <FileText size={13} />
              <span>الطلبات السابقة</span>
              {hasOrders && (
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              )}
            </button>
          </div>

          {/* Search bar (only visible in menu tab) */}
          {activeTab === "menu" && (
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="ابحث عن مشروب بارد، آيس كوفي، ميلك شيك..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#2d1911]/80 border border-[#3d2419] rounded-2xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e4a86a] transition-colors"
                id="search-input"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
