import { motion } from "motion/react";
import { Plus, Minus, ZoomIn } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  quantityInCart: number;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onImageClick: (product: Product) => void;
}

export default function ProductCard({
  product,
  quantityInCart,
  onUpdateQuantity,
  onImageClick
}: ProductCardProps) {
  const isAdded = quantityInCart > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`relative p-3.5 bg-white border rounded-[32px] transition-all flex flex-col justify-between h-full ${
        isAdded
          ? "border-[#4a2c11] shadow-xl shadow-[#4a2c11]/5"
          : "border-zinc-100/90 hover:border-zinc-200/80 hover:shadow-xl hover:shadow-[#4a2c11]/5 shadow-xs"
      }`}
      dir="rtl"
    >
      <div>
        {/* Product Image Panel with Zoom Trigger */}
        <div className="relative w-full aspect-square rounded-[24px] overflow-hidden bg-[#faf6f0] shrink-0 group shadow-xs">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
            onClick={() => onImageClick(product)}
            referrerPolicy="no-referrer"
          />
          {/* Subtle Zoom Prompt */}
          <button
            onClick={() => onImageClick(product)}
            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white cursor-pointer"
            aria-label="تكبير الصورة"
          >
            <ZoomIn size={20} />
          </button>

          {/* Badges row layered neatly on top of the image */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1 max-w-[85%]">
              {product.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[9px] font-black text-[#fdfbf7] bg-[#4a2c11] rounded-lg shrink-0 shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info */}
        <div className="text-center mt-3 px-1">
          {/* Name */}
          <h3 className="font-extrabold text-[#4a2c11] text-sm sm:text-base leading-snug">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-zinc-500 text-[11px] line-clamp-1 leading-relaxed mt-1">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="text-[#8b5a2b] font-black text-base sm:text-lg mt-2 font-display">
            {product.price} ريال
          </div>
        </div>
      </div>

      {/* Cart Action Block */}
      <div className="mt-3.5">
        {isAdded ? (
          <div className="flex items-center justify-between w-full bg-gradient-to-r from-[#4a2c11] to-[#8b5a2b] text-white rounded-2xl overflow-hidden py-1.5 px-2 shadow-md">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              aria-label="تقليل الكمية"
              id={`card-dec-${product.id}`}
            >
              <Minus size={14} className="stroke-[3]" />
            </button>
            <span className="text-xs sm:text-sm font-black min-w-[28px] text-center font-display">
              {quantityInCart} في الفاتورة
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              aria-label="زيادة الكمية"
              id={`card-inc-${product.id}`}
            >
              <Plus size={14} className="stroke-[3]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onUpdateQuantity(product.id, 1)}
            className="w-full py-2.5 bg-gradient-to-r from-[#4a2c11] via-[#6f4e37] to-[#8b5a2b] hover:shadow-lg active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
            id={`add-to-cart-btn-${product.id}`}
          >
            <span>أضف للفاتورة +</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
