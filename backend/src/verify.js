// One-shot smoke test for the backend API, run against an in-memory MongoDB.
// Exercises the main flows across auth, products, categories, orders,
// coupons, users, and the admin dashboard. Exits 0 on success, 1 on failure.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

import request from 'supertest';
import connectDB, { disconnectDB } from './config/db.js';
import app from './app.js';
import User from './models/User.js';

const results = [];
const check = (label, condition, extra) => {
  results.push({ label, pass: !!condition, extra });
  const icon = condition ? '✓' : '✗';
  console.log(`${icon} ${label}${condition ? '' : `  -> ${JSON.stringify(extra)}`}`);
};

const run = async () => {
  await connectDB();

  // --- Auth: register / login ---
  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
  });
  check('register user -> 201', registerRes.status === 201, registerRes.body);
  const userToken = registerRes.body.token;

  const dupRes = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
  });
  check('duplicate register -> 400', dupRes.status === 400, dupRes.body);

  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'wrong' });
  check('wrong password login -> 401', badLoginRes.status === 401, badLoginRes.body);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'password123' });
  check('login user -> 200', loginRes.status === 200, loginRes.body);

  const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${userToken}`);
  check('get me -> 200', meRes.status === 200 && meRes.body.user.email === 'user@test.com', meRes.body);

  // --- Admin bootstrap (create directly, then log in) ---
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' });
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  check('admin login -> 200', adminLoginRes.status === 200, adminLoginRes.body);
  const adminToken = adminLoginRes.body.token;

  // --- Category CRUD (admin) ---
  const forbiddenCategoryRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ name: 'iPhone Cases' });
  check('non-admin create category -> 403', forbiddenCategoryRes.status === 403, forbiddenCategoryRes.body);

  const categoryRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'iPhone Cases', description: 'Cases for iPhone' });
  check('admin create category -> 201', categoryRes.status === 201, categoryRes.body);
  const categoryId = categoryRes.body.category?._id;

  const listCategoriesRes = await request(app).get('/api/categories');
  check(
    'list categories -> 1 item',
    listCategoriesRes.status === 200 && listCategoriesRes.body.categories.length === 1,
    listCategoriesRes.body
  );

  // --- Product CRUD (admin) + public read ---
  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Clear Shockproof Case',
      description: 'A durable clear case',
      brand: 'Casciz',
      category: categoryId,
      price: 599,
      discountPrice: 499,
      variants: [{ model: 'iPhone 15', color: 'Clear', sku: 'CSC-15-CLR', stock: 10 }],
    });
  check('admin create product -> 201', productRes.status === 201, productRes.body);
  const product = productRes.body.product;

  const listProductsRes = await request(app).get('/api/products');
  check(
    'list products -> 1 item',
    listProductsRes.status === 200 && listProductsRes.body.total === 1,
    listProductsRes.body
  );

  const productBySlugRes = await request(app).get(`/api/products/${product.slug}`);
  check('get product by slug -> 200', productBySlugRes.status === 200, productBySlugRes.body);

  const reviewRes = await request(app)
    .post(`/api/products/${product._id}/reviews`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ rating: 5, comment: 'Great case!' });
  check('create review -> 201', reviewRes.status === 201, reviewRes.body);

  // --- Orders ---
  const variantId = product.variants[0]._id;
  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      items: [{ productId: product._id, variantId, quantity: 2 }],
      shippingAddress: {
        fullName: 'Test User',
        phone: '9999999999',
        line1: '123 Test St',
        city: 'Testville',
        state: 'TS',
        postalCode: '000000',
      },
    });
  check(
    'create order -> 201 with correct total',
    orderRes.status === 201 && orderRes.body.order.itemsPrice === 998,
    orderRes.body
  );
  const orderId = orderRes.body.order?._id;

  const stockCheckRes = await request(app).get(`/api/products/${product._id}`);
  const remainingStock = stockCheckRes.body.product.variants[0].stock;
  check('stock decremented after order (10 -> 8)', remainingStock === 8, { remainingStock });

  const myOrdersRes = await request(app).get('/api/orders/my').set('Authorization', `Bearer ${userToken}`);
  check('get my orders -> 1 item', myOrdersRes.status === 200 && myOrdersRes.body.orders.length === 1, myOrdersRes.body);

  const updateStatusRes = await request(app)
    .put(`/api/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'shipped' });
  check('admin update order status -> 200', updateStatusRes.status === 200, updateStatusRes.body);

  // --- Coupons ---
  const couponRes = await request(app)
    .post('/api/coupons')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      code: 'SAVE10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  check('admin create coupon -> 201', couponRes.status === 201, couponRes.body);

  const validateCouponRes = await request(app)
    .post('/api/coupons/validate')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ code: 'SAVE10', orderAmount: 1000 });
  check(
    'validate coupon -> 100 discount',
    validateCouponRes.status === 200 && validateCouponRes.body.discountAmount === 100,
    validateCouponRes.body
  );

  // --- Wishlist ---
  const wishlistToggleRes = await request(app)
    .post(`/api/users/wishlist/${product._id}`)
    .set('Authorization', `Bearer ${userToken}`);
  check('toggle wishlist -> added', wishlistToggleRes.status === 200 && wishlistToggleRes.body.added === true, wishlistToggleRes.body);

  const wishlistRes = await request(app).get('/api/users/wishlist').set('Authorization', `Bearer ${userToken}`);
  check('get wishlist -> 1 item', wishlistRes.status === 200 && wishlistRes.body.wishlist.length === 1, wishlistRes.body);

  // --- Admin: users + dashboard ---
  const usersRes = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
  check('admin list users -> 2 users', usersRes.status === 200 && usersRes.body.total === 2, usersRes.body);

  const dashboardRes = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${adminToken}`);
  check(
    'dashboard summary -> counts correct',
    dashboardRes.status === 200 && dashboardRes.body.totalOrders === 1 && dashboardRes.body.totalCustomers === 1,
    dashboardRes.body
  );

  const notFoundRes = await request(app).get('/api/does-not-exist');
  check('unknown route -> 404', notFoundRes.status === 404, notFoundRes.body);

  await disconnectDB();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.log('\nFailed checks:');
    failed.forEach((f) => console.log(`  - ${f.label}`));
    process.exit(1);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
