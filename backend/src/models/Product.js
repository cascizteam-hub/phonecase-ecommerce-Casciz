import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    model: { type: String, required: true }, // e.g. "iPhone 15 Pro"
    color: { type: String },
    sku: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    priceOverride: { type: Number, min: 0 },
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    brand: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    variants: [variantSchema],
    tags: [{ type: String, trim: true, lowercase: true }],
    material: { type: String, trim: true },
    totalStock: { type: Number, default: 0, min: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

productSchema.pre('save', function computeTotals() {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  } else {
    this.numReviews = 0;
    this.rating = 0;
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
