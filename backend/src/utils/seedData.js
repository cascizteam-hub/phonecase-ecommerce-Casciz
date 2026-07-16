import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const CATEGORY_DEFS = [
  { name: 'iPhone Cases', slug: 'iphone-cases', description: 'Protective cases for iPhone models' },
  { name: 'Samsung Cases', slug: 'samsung-cases', description: 'Protective cases for Samsung Galaxy models' },
];

const PRODUCT_DEFS = [
  {
    name: 'Clear Shockproof Case',
    slug: 'clear-shockproof-case',
    description: 'A durable, crystal-clear shockproof case with reinforced corners.',
    brand: 'CaseCraft',
    categorySlug: 'iphone-cases',
    price: 599,
    discountPrice: 499,
    material: 'TPU + Polycarbonate',
    variants: [
      { model: 'iPhone 15', color: 'Clear', sku: 'CSC-15-CLR', stock: 25 },
      { model: 'iPhone 15 Pro', color: 'Clear', sku: 'CSC-15P-CLR', stock: 15 },
    ],
    tags: ['clear', 'shockproof', 'iphone15'],
    isFeatured: true,
  },
  {
    name: 'Matte Silicone Case',
    slug: 'matte-silicone-case',
    description: 'Soft-touch matte silicone case with a microfiber lining.',
    brand: 'CaseCraft',
    categorySlug: 'iphone-cases',
    price: 799,
    variants: [
      { model: 'iPhone 15', color: 'Midnight Black', sku: 'MSC-15-BLK', stock: 20 },
      { model: 'iPhone 15', color: 'Sage Green', sku: 'MSC-15-GRN', stock: 18 },
    ],
    tags: ['matte', 'silicone'],
    isFeatured: true,
  },
  {
    name: 'Leather Wallet Case',
    slug: 'leather-wallet-case',
    description: 'Genuine leather case with card slots and a kickstand.',
    brand: 'UrbanArmor',
    categorySlug: 'samsung-cases',
    price: 1299,
    discountPrice: 999,
    variants: [{ model: 'Galaxy S24', color: 'Brown', sku: 'LWC-S24-BRN', stock: 12 }],
    tags: ['leather', 'wallet'],
  },
];

export const seedBaseline = async () => {
  const adminEmail = 'admin@phonecase.test';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: adminEmail, password: 'admin123', role: 'admin' });
    console.log(`Seeded admin user: ${adminEmail} / admin123`);
  }

  const categoriesBySlug = {};
  for (const def of CATEGORY_DEFS) {
    let category = await Category.findOne({ slug: def.slug });
    if (!category) {
      category = await Category.create(def);
      console.log(`Seeded category: ${def.name}`);
    }
    categoriesBySlug[def.slug] = category;
  }

  for (const def of PRODUCT_DEFS) {
    const exists = await Product.findOne({ slug: def.slug });
    if (exists) continue;
    const { categorySlug, ...rest } = def;
    await Product.create({ ...rest, category: categoriesBySlug[categorySlug]._id, images: [] });
    console.log(`Seeded product: ${def.name}`);
  }
};
