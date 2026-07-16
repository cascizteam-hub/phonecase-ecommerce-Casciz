import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number },
    minOrderAmount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function isValid(orderAmount = 0) {
  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (this.expiresAt < new Date()) return { valid: false, reason: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, reason: `Minimum order amount is ${this.minOrderAmount}` };
  }
  return { valid: true };
};

couponSchema.methods.computeDiscount = function computeDiscount(orderAmount) {
  let discount =
    this.discountType === 'percentage' ? (orderAmount * this.discountValue) / 100 : this.discountValue;
  if (this.maxDiscountAmount) discount = Math.min(discount, this.maxDiscountAmount);
  return Math.min(discount, orderAmount);
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
