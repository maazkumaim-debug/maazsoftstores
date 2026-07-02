import { motion } from "motion/react";
import { Clock, ShoppingBag, Trash2, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Order } from "../types";
import { useState } from "react";

interface PreviousOrdersProps {
  orders: Order[];
  onClearOrders: () => void;
}

export default function PreviousOrders({ orders, onClearOrders }: PreviousOrdersProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center" dir="rtl">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-bounce">
          <ShoppingBag size={28} />
        </div>
        <h4 className="text-lg font-bold text-zinc-800 mb-1">لا توجد طلبات سابقة</h4>
        <p className="text-zinc-500 text-sm max-w-xs">
          جميع طلباتك التي ترسلها من السلة ستظهر هنا لتتبعها وتفاصيلها في أي وقت!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-extrabold text-zinc-800 flex items-center gap-2">
          <Clock className="text-amber-500" size={20} />
          <span>طلباتك السابقة ({orders.length})</span>
        </h3>
        <button
          onClick={() => {
            if (confirm("هل أنت متأكد من مسح تاريخ طلباتك بالكامل؟")) {
              onClearOrders();
            }
          }}
          className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100/50 rounded-lg transition-colors cursor-pointer"
          id="clear-orders-btn"
        >
          <Trash2 size={13} />
          <span>مسح الكل</span>
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order, idx) => {
          const isExpanded = expandedOrder === order.id;
          const formattedDate = new Date(order.created_at).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <motion.div
              layout
              key={order.id}
              className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 font-bold font-display">
                    #{order.order_number}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-800 text-sm">طلب رقم #{order.order_number}</h4>
                    <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="block font-extrabold text-amber-600 text-sm">
                      {order.total_price} ر.س
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Expanded items */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-zinc-100 bg-zinc-50/30 p-4"
                >
                  <h5 className="text-xs font-bold text-zinc-400 mb-3 flex items-center gap-1">
                    <FileText size={12} />
                    <span>تفاصيل المنتجات:</span>
                  </h5>
                  <div className="space-y-2.5">
                    {order.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-bold text-xs">{item.quantity}x</span>
                          <span className="text-zinc-800 font-medium">{item.product_name}</span>
                        </div>
                        <span className="font-bold text-zinc-600 text-xs">
                          {item.price * item.quantity} ر.س
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center text-xs text-zinc-500">
                    <span>عدد المواد: {order.items.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                    <span className="font-bold text-zinc-700">المجموع النهائي: {order.total_price} ر.س</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
