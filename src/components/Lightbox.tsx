import { motion, AnimatePresence } from "motion/react";
import { X, Flame, ShieldAlert, Heart, Star } from "lucide-react";
import { Product } from "../types";

interface LightboxProps {
  product: Product | null;
  onClose: () => void;
}

export default function Lightbox({ product, onClose }: LightboxProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl overflow-hidden bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl"
          dir="rtl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 z-10 text-white bg-black/50 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all duration-200"
            aria-label="إغلاق"
            id="close-lightbox-btn"
          >
            <X size={20} />
          </button>

          {/* Product Image */}
          <div className="relative h-64 sm:h-96 w-full overflow-hidden">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />
            
            {/* Badges Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
              {product.badges && product.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                <span className="inline-flex items-center text-sm text-zinc-400">
                  <Star size={14} className="text-amber-500 fill-amber-500 ml-1" />
                  من المطبخ الخاص بنا
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-amber-500">
                  {product.price}
                </span>
                <span className="text-zinc-400 text-sm mr-1">ر.س</span>
              </div>
            </div>

            <p className="text-zinc-300 text-base leading-relaxed mb-6">
              {product.description || "لا يوجد وصف متوفر لهذا المنتج المميّز حالياً. تم تحضيره من أجود المكونات الطازجة."}
            </p>

            {/* Health / Special info badges */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-800/40 border border-zinc-800/60 rounded-2xl text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-amber-500" />
                <span>مكونات طازجة 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                <span>حسب معايير الصحة والسلامة</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
