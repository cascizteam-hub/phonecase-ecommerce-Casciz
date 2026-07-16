import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// GET /api/dashboard/summary (admin)
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [totalOrders, totalCustomers, totalProducts, revenueAgg, lowStock, recentOrders] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Product.countDocuments({ isActive: true, totalStock: { $lte: 5 } }),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
  ]);

  const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  res.status(200).json({
    totalOrders,
    totalCustomers,
    totalProducts,
    totalRevenue: revenueAgg[0]?.total || 0,
    lowStockCount: lowStock,
    ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    recentOrders,
  });
});

// GET /api/dashboard/sales?period=7d|30d|12m (admin)
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '12m' ? 365 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const sales = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: since } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json({ sales, topProducts });
});

// GET /api/dashboard/inventory (admin) — low stock report
export const getInventoryReport = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .select('name totalStock variants images')
    .sort({ totalStock: 1 });

  res.status(200).json({ products });
});
