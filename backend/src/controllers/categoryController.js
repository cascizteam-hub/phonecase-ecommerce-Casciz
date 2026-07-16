import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ categories });
});

export const getCategoryByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const category = await Category.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.status(200).json({ category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.slug) body.slug = slugify(body.name);
  if (req.uploadedImages?.[0]) body.image = req.uploadedImages[0];

  const category = await Category.create(body);
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  Object.assign(category, req.body);
  if (req.body.name && !req.body.slug) category.slug = slugify(req.body.name);
  if (req.uploadedImages?.[0]) category.image = req.uploadedImages[0];

  await category.save();
  res.status(200).json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.status(200).json({ message: 'Category deleted' });
});
