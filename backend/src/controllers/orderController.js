import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const SHIPPING_FLAT_RATE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

// Recomputes prices server-side from live product data — never trust client-sent prices.
const buildOrderItems = async (cartItems) => {
  const orderItems = [];
  let itemsPrice = 0;

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);
    if (!product || !product.isActive) {
      const err = new Error(`Product not available: ${cartItem.productId}`);
      err.statusCode = 400;
      throw err;
    }

    let variant;
    if (cartItem.variantId) {
      variant = product.variants.id(cartItem.variantId);
      if (!variant) {
        const err = new Error(`Variant not found for product ${product.name}`);
        err.statusCode = 400;
        throw err;
      }
      if (variant.stock < cartItem.quantity) {
        const err = new Error(`Insufficient stock for ${product.name} (${variant.color || ''} ${variant.model || ''})`);
        err.statusCode = 400;
        throw err;
      }
    }

    const price = variant?.priceOverride ?? product.discountPrice ?? product.price;

    orderItems.push({
      product: product._id,
      variantId: variant?._id,
      name: product.name,
      image: product.images?.[0]?.url,
      model: variant?.model,
      color: variant?.color,
      price,
      quantity: cartItem.quantity,
    });

    itemsPrice += price * cartItem.quantity;

    if (variant) {
      variant.stock -= cartItem.quantity;
      await product.save();
    }
  }

  return { orderItems, itemsPrice };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, couponCode, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }
  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  const { orderItems, itemsPrice } = await buildOrderItems(items);

  let discountAmount = 0;
  let couponData;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      res.status(400);
      throw new Error('Invalid coupon code');
    }
    const { valid, reason } = coupon.isValid(itemsPrice);
    if (!valid) {
      res.status(400);
      throw new Error(reason);
    }
    discountAmount = coupon.computeDiscount(itemsPrice);
    coupon.usedCount += 1;
    await coupon.save();
    couponData = { code: coupon.code, discountAmount };
  }

  const shippingPrice = itemsPrice - discountAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const totalPrice = Math.max(itemsPrice - discountAmount + shippingPrice, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    coupon: couponData,
    itemsPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    paymentMethod: paymentMethod || 'razorpay',
  });

  res.status(201).json({ order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.status(200).json({ order });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }
  if (!['pending', 'processing'].includes(order.status)) {
    res.status(400);
    throw new Error('Order can no longer be cancelled');
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();
  res.status(200).json({ order });
});

// ---- Admin ----

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ orders, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (status === 'delivered') order.deliveredAt = new Date();
  if (status === 'cancelled') order.cancelledAt = new Date();

  await order.save();
  res.status(200).json({ order });
});
