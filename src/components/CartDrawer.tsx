import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { CartItem } from "../types";
import { useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  lastOrderNum: number | null;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  lastOrderNum
}: CartDrawerProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleConfirmCheckout = () => {
    onCheckout();
    setIsSuccess(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs" dir="rtl">
        {/* Backdrop click close */}
        <div className="absolute inset-0" onClick={isSuccess ? handleCloseSuccess : onClose} />

        {/* Modal / Sheet */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.5 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#8b5a2b]" />
              <h3 className="text-lg font-extrabold text-zinc-800">فاتورتك</h3>
              <span className="bg-[#4a2c11]/10 text-[#4a2c11] px-2 py-0.5 text-xs font-bold rounded-full">
                {cartItems.length} منتجات
              </span>
            </div>
            <button
              onClick={isSuccess ? handleCloseSuccess : onClose}
              className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
              id="close-cart-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
              <motion.div
                initial={{ scale: 0.5, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle size={52} className="stroke-[1.5]" />
              </motion.div>

              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-zinc-800">تم إرسال طلبك بنجاح!</h4>
                <p className="text-zinc-500 text-sm max-w-sm">
                  طلبك مسجل الآن برقم <span className="text-[#8b5a2b] font-extrabold text-base font-display">#{lastOrderNum}</span>.
                  يرجى التوجه إلى الكاشير أو إظهار شاشة هاتفك لإتمام الدفع واستلام الوجبة شهية وطازجة.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 w-full text-xs text-zinc-500">
                💡 تم حفظ الطلب تلقائياً في خانة "الطلبات السابقة" بالصفحة الرئيسية لتتبع تفاصيله في أي وقت.
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full py-3.5 bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                id="success-done-btn"
              >
                <span>متابعة التصفح</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Cart list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                      <ShoppingBag size={24} />
                    </div>
                    <p className="text-zinc-500 font-bold text-sm">فاتورتك فارغة حالياً</p>
                    <p className="text-zinc-400 text-xs mt-1 max-w-xs">
                      تصفح الأقسام والمنتجات الشهية وأضفها لفاتورتك!
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      layout
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-all"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        <img
                          src={item.product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-zinc-800 text-sm sm:text-base leading-tight">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                              title="حذف"
                              id={`remove-item-${item.product.id}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {item.product.badges && item.product.badges.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              <span className="text-[10px] text-[#8b5a2b] bg-[#fdf8f4] px-1.5 py-0.5 rounded-md font-medium">
                                {item.product.badges[0]}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-extrabold text-[#8b5a2b] text-sm sm:text-base">
                            {item.product.price * item.quantity} ر.س
                          </span>

                          <div className="flex items-center border border-zinc-200/80 bg-white rounded-lg overflow-hidden shrink-0">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="p-1 hover:bg-zinc-100 text-[#4a2c11] transition-colors cursor-pointer"
                              id={`dec-qty-${item.product.id}`}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-3 text-sm font-bold text-zinc-800 font-display min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="p-1 hover:bg-zinc-100 text-[#4a2c11] transition-colors cursor-pointer"
                              id={`inc-qty-${item.product.id}`}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Checkout area */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-zinc-500 text-xs">
                      <span>مجموع المشتريات:</span>
                      <span className="font-bold">{totalPrice} ر.س</span>
                    </div>
                    <div className="flex justify-between text-zinc-800 font-extrabold text-base pt-2 border-t border-zinc-200/60">
                      <span>المجموع الإجمالي:</span>
                      <span className="text-[#8b5a2b]">{totalPrice} ر.س</span>
                    </div>
                  </div>

                  <div className="bg-[#4a2c11]/10 border border-[#4a2c11]/20 text-[#4a2c11] rounded-xl p-3 text-center text-xs font-black">
                    💬 أعرض طلبك على الكاشير
                  </div>

                  <button
                    onClick={handleConfirmCheckout}
                    className="w-full py-4 bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] hover:opacity-90 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#4a2c11]/15 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                    id="submit-order-btn"
                  >
                    <span>إنهاء وإغلاق الفاتورة</span>
                    <ShoppingBag size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
