import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ coupons });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  const { valid, reason } = coupon.isValid(orderAmount);
  if (!valid) {
    res.status(400);
    throw new Error(reason);
  }

  const discountAmount = coupon.computeDiscount(orderAmount);
  res.status(200).json({ valid: true, discountAmount, coupon: { code: coupon.code, description: coupon.description } });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ coupon });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  Object.assign(coupon, req.body);
  await coupon.save();
  res.status(200).json({ coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.status(200).json({ message: 'Coupon deleted' });
});
