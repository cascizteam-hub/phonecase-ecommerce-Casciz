import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import Order from '../models/Order.js';

// POST /api/payments/razorpay/order  { orderId }
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100), // paise
    currency: 'INR',
    receipt: order._id.toString(),
  });

  order.paymentResult = { ...order.paymentResult, razorpayOrderId: razorpayOrder.id };
  await order.save();

  res.status(201).json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /api/payments/razorpay/verify
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to verify payment for this order');
  }
  if (order.isPaid) {
    res.status(200).json({ message: 'Payment already verified', order });
    return;
  }
  // Bind verification to the razorpay_order_id we issued for THIS order — otherwise a
  // user could replay a validly-signed order_id/payment_id pair from a different
  // (e.g. cheaper) order of their own to mark this order as paid.
  if (order.paymentResult?.razorpayOrderId !== razorpay_order_id) {
    res.status(400);
    throw new Error('Payment verification failed: order mismatch');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const expected = Buffer.from(expectedSignature, 'hex');
  const provided = Buffer.from(razorpay_signature || '', 'hex');
  const signatureValid =
    expected.length === provided.length && crypto.timingSafeEqual(expected, provided);

  if (!signatureValid) {
    res.status(400);
    throw new Error('Payment verification failed: invalid signature');
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'processing';
  order.paymentResult = {
    ...order.paymentResult,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  };
  await order.save();

  res.status(200).json({ message: 'Payment verified successfully', order });
});
