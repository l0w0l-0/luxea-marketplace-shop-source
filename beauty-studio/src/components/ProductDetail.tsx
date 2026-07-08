/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Product, Review, User } from "../types";
import { getImageSrc, formatMoney } from "../shared/commerce";

interface ProductDetailProps {
  product: Product;
  onAddToCart: (p: Product, colorId: string) => void;
  onBuyNow?: (p: Product, colorId: string, quantity: number) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  reviews: Review[];
  onBack: () => void;
  user: User | null;
  onSubmitReview: (productId: string, rating: number, comment: string, skinTone: string) => void;
}

/**
 * หน้ารายละเอียดสินค้าเครื่องสำอางแบบเต็มหน้าจอ (Detailed Product Page Screen)
 * นำเสนอข้อมูลเฉดสีทั้งหมด เนื้อสี รีวิวลูกค้าจากระบบหลังบ้าน และตัวเลือกปรับเปลี่ยนปริมาณที่ต้องการสั่งซื้อ
 * และเพิ่มฟีเจอร์เขียนรีวิวและให้คะแนนดาวในหน้านี้ได้ทันที
 */
export default function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  reviews,
  onBack,
  user,
  onSubmitReview,
}: ProductDetailProps) {
  
  // จัดเก็บเฉดสีที่เลือกในหน้ารายละเอียด
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].id : ""
  );
  
  // ปริมาณชิ้นที่ต้องการหยิบใส่ตะกร้า
  const [quantity, setQuantity] = useState(1);

  // สเตตฟอร์มรีวิวใหม่
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newSkinTone, setNewSkinTone] = useState("ผิวขาว");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const selectedColorOption =
    product.colors.find((color) => color.id === selectedColor) ?? product.colors[0];

  const skinToneOptions = ["ผิวขาว", "ผิวสองสี", "ผิวสีน้ำผึ้ง/ผิวแทน", "ผิวเข้ม"];

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setReviewMessage("❌ กรุณาเข้าสู่ระบบก่อนเขียนรีวิวค่ะ");
      return;
    }
    if (!newComment.trim()) {
      setReviewMessage("❌ กรุณากรอกความคิดเห็นของคุณด้วยค่ะ");
      return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
      onSubmitReview(product.id, newRating, newComment.trim(), newSkinTone);
      setNewComment("");
      setNewRating(5);
      setIsSubmittingReview(false);
      setReviewMessage("🎉 ส่งรีวิวสำเร็จเรียบร้อยแล้วค่ะ! รอแอดมินอนุมัติรีวิวนะคะ");
      setTimeout(() => setReviewMessage(""), 4000);
    }, 1200);
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_1fr] animate-fade-in">
      
      {/* ฝั่งซ้าย: รูปภาพแกลเลอรีขนาดใหญ่ */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-4 hover:opacity-80 cursor-pointer text-sm"
        >
          ← กลับไปหน้าร้าน
        </button>
        
        <div className="glass-xl rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--color-primary-50)] to-white p-6 border border-[var(--color-border)]">
          <div className="relative w-full h-96 rounded-[var(--radius-xl)] overflow-hidden bg-white shadow-sm aspect-square">
            <div
              className="absolute inset-0 opacity-25"
              style={{ backgroundColor: product.color }}
            />
            <img
              src={getImageSrc(product.image)}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.32),transparent_45%),linear-gradient(180deg,transparent_18%,rgba(58,46,46,0.08)_100%)]" />
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: ข้อมูลรายละเอียดและปุ่มแอคชัน */}
      <aside className="space-y-6 self-start">
        <div className="glass-xl rounded-[var(--radius-2xl)] p-8 border border-[var(--color-border)] bg-white/70">
          
          <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
            <p className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-primary-50)] px-3 py-1 rounded-full">
              {product.category}
            </p>
            <button
              type="button"
              className={`wishlist-btn cursor-pointer ${isWishlisted ? "active" : ""}`}
              onClick={() => onToggleWishlist(product.id)}
            >
              {isWishlisted ? "❤️" : "🤍"}
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-display text-[var(--color-text)] font-black leading-tight">
            {product.name}
          </h1>

          {/* เรตติ้งและสถานะสินค้าพรีเมียม */}
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-6">
            <div className="flex items-center text-yellow-500">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-[var(--color-text-secondary)] font-bold">
              {product.rating.toFixed(1)} ({product.reviewCount} รีวิวจากคุณลูกค้า)
            </span>
            {product.isPremium && (
              <span className="badge-premium text-xs">✨ Luxury Selection</span>
            )}
          </div>

          {/* ราคาหลักของชิ้นงาน */}
          <p className="text-4xl font-black text-[var(--color-primary)] mb-6">
            {formatMoney(product.price)}
          </p>

          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          {/* แสดงกล่องตัวเลือกเฉดสี */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-3 uppercase tracking-wider">
              เฉดสีทั้งหมด ({product.shade})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`rounded-[var(--radius-lg)] border p-4 text-left transition-all cursor-pointer ${
                    selectedColor === c.id
                      ? "border-[var(--color-primary)] bg-[linear-gradient(135deg,rgba(163,93,106,0.10),rgba(255,255,255,0.96))] shadow-[0_16px_34px_rgba(163,93,106,0.14)]"
                      : "border-[var(--color-border)] bg-white/82 hover:border-[rgba(163,93,106,0.26)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full shadow-md shrink-0 border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-[var(--color-text)] truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {c.hex}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-[var(--color-text-secondary)] font-bold">
                    <span className="text-center bg-gray-100/80 rounded py-0.5">{c.undertone ?? "Neutral"}</span>
                    <span className="text-center bg-gray-100/80 rounded py-0.5">{c.finish ?? "Soft"}</span>
                    <span className="text-center bg-gray-100/80 rounded py-0.5">{c.stock > 0 ? `${c.stock} ชิ้น` : "หมด"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* รายละเอียดสเปกอย่างละเอียดของเฉดสีที่เลือก */}
          {selectedColorOption && (
            <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-primary-50)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                สเปกของเฉดสีที่เลือก (Selected Shade)
              </p>
              <div className="mt-3 flex items-start gap-3">
                <span
                  className="mt-1 h-5 w-5 rounded-full shadow-sm shrink-0 border border-black/10"
                  style={{ backgroundColor: selectedColorOption.hex }}
                />
                <div>
                  <p className="text-base font-bold text-[var(--color-text)]">
                    {selectedColorOption.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-medium">
                    รหัสสี: {selectedColorOption.hex} · โทนผิว: {selectedColorOption.undertone ?? "Neutral"} · เนื้อผลิตภัณฑ์: {selectedColorOption.finish ?? "Matte"} · ระดับการปกปิด: {selectedColorOption.coverage ?? "Medium Coverage"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* การปรับแต่งปริมาณจำนวนสินค้า */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary)] mb-3">
              จำนวนสินค้า
            </h3>
            <div className="flex items-center gap-3 bg-white/80 p-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] w-fit shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn btn-secondary w-10 h-10 p-0 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                -
              </button>
              <span className="text-xl font-black min-w-[3rem] text-center text-[var(--color-text)]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="btn btn-secondary w-10 h-10 p-0 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* ปุ่มทำรายการ */}
          <div className="space-y-3">
            <button
              type="button"
              className="btn btn-primary w-full text-lg h-14 cursor-pointer animate-pulse"
              disabled={product.stock === 0}
              onClick={() => {
                onAddToCart(product, selectedColor);
              }}
            >
              {product.stock === 0 ? "สินค้าหมดคลัง" : "หยิบใส่ตะกร้า"}
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full text-lg h-14 cursor-pointer font-bold"
              disabled={product.stock === 0}
              onClick={() => onBuyNow?.(product, selectedColor, quantity)}
            >
              ซื้อทันที (Buy Now)
            </button>
          </div>
        </div>

        {/* เขียนรีวิวสินค้า (Write a Review Form) */}
        <div className="glass-xl rounded-[var(--radius-2xl)] p-8 border border-[var(--color-border)] bg-white/70">
          <h3 className="text-xl font-display text-[var(--color-primary)] font-bold mb-4">
            เขียนรีวิวสินค้าของคุณ ✍️
          </h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewMessage && (
                <div className={`p-3 rounded-lg text-sm font-semibold ${reviewMessage.startsWith("❌") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                  {reviewMessage}
                </div>
              )}
              {/* เรตติ้งดาว */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                  ให้คะแนนสินค้าของคุณ
                </label>
                <div className="flex items-center gap-1.5 text-2xl">
                  {Array.from({ length: 5 }, (_, i) => {
                    const ratingValue = i + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        onClick={() => setNewRating(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className={`transition-transform hover:scale-125 cursor-pointer ${
                          ratingValue <= (hoverRating ?? newRating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* เลือกโทนผิว */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                  ลักษณะสีผิวของคุณ
                </label>
                <div className="flex flex-wrap gap-2">
                  {skinToneOptions.map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setNewSkinTone(st)}
                      className={`text-xs px-3.5 py-2 rounded-full font-bold transition-all border cursor-pointer ${
                        newSkinTone === st
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                          : "bg-white text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* ข้อความรีวิว */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                  ความคิดเห็นของคุณ
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="เขียนรีวิวผลิตภัณฑ์ ความรู้สึกหลังใช้ เนื้อสัมผัส กลิ่น หรือความติดทนนาน..."
                  className="w-full bg-white/80 border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="btn btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? "กำลังส่งรีวิว..." : "ส่งรีวิวผลิตภัณฑ์"}
              </button>
            </form>
          ) : (
            <div className="bg-pink-50/50 border border-pink-100 rounded-[var(--radius-xl)] p-4 text-center">
              <p className="text-sm font-bold text-[var(--color-primary)] mb-2">
                คุณยังไม่ได้เข้าสู่ระบบ
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                กรุณาเข้าสู่ระบบก่อนเพื่อแบ่งปันรีวิวความสวยของคุณนะคะ ✨
              </p>
            </div>
          )}
        </div>

        {/* ส่วนกล่องแสดงรีวิวของสินค้า (Customer Reviews Panel) */}
        <div className="glass-xl rounded-[var(--radius-2xl)] p-8 border border-[var(--color-border)]">
          <h2 className="text-2xl font-display text-[var(--color-primary)] font-bold mb-6">
            เสียงตอบรับจากคุณลูกค้า ({reviews.length} รีวิว)
          </h2>
          
          {reviews.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">
              ยังไม่มีข้อคิดเห็นเพิ่มเติมสำหรับสินค้านี้ มาร่วมเป็นคนแรกที่รีวิวกันเถอะ!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 bg-white/80 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border)] pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-200)] to-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold text-lg shadow-sm">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[var(--color-text)]">
                            {review.userName}
                          </p>
                          {review.status === "pending" && (
                            <span className="text-[9px] bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded">
                              รออนุมัติ
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">
                          {review.createdAt} {review.skinTone ? `· ${review.skinTone}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`${i < Math.round(review.rating) ? "text-yellow-400" : "text-gray-300"} text-sm`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed font-medium">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
