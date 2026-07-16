import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// GET /api/products  (public, supports search/filter/sort/pagination)
export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    model,
    rating,
    sort,
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const filter = { isActive: true };

  if (keyword) {
    filter.$text = { $search: keyword };
  }
  if (category) filter.category = category;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (model) filter['variants.model'] = { $regex: model, $options: 'i' };
  if (rating) filter.rating = { $gte: Number(rating) };
  if (featured === 'true') filter.isFeatured = true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// GET /api/products/:idOrSlug
export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  const product = await Product.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ product });
});

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.slug) body.slug = slugify(body.name);
  if (req.uploadedImages) body.images = req.uploadedImages;

  const product = await Product.create(body);
  res.status(201).json({ product });
});

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  Object.assign(product, req.body);
  if (req.body.name && !req.body.slug) product.slug = slugify(req.body.name);
  if (req.uploadedImages) {
    product.images = [...(product.images || []), ...req.uploadedImages];
  }

  await product.save();
  res.status(200).json({ product });
});

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.status(200).json({ message: 'Product deleted' });
});

// POST /api/products/:id/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, rating: Number(rating), comment });
  await product.save();
  res.status(201).json({ message: 'Review added' });
});

// GET /api/products/filters/meta (brands, price range, models for filter UI)
export const getFilterMeta = asyncHandler(async (req, res) => {
  const [brands, models, priceRange] = await Promise.all([
    Product.distinct('brand', { isActive: true }),
    Product.distinct('variants.model', { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]),
  ]);

  res.status(200).json({
    brands: brands.filter(Boolean),
    models: models.filter(Boolean),
    priceRange: priceRange[0] || { min: 0, max: 0 },
  });
});
