import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';

// ---- Wishlist (customer) ----

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({ wishlist: user.wishlist });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.findIndex((id) => id.toString() === productId);
  let added;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    added = false;
  } else {
    user.wishlist.push(productId);
    added = true;
  }
  await user.save();
  res.status(200).json({ added, wishlist: user.wishlist });
});

// ---- Admin: customer management ----

export const getUsers = asyncHandler(async (req, res) => {
  const { keyword, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ users, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  res.status(200).json({ user, orders });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.status(200).json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.status(200).json({ message: 'User deleted' });
});
