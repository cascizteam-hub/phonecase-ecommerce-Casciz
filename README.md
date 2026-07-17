# Casciz — Phone Case E-commerce Platform

A full-stack phone case store: a customer storefront, an admin dashboard, and
a Node.js/Express/MongoDB REST API, with JWT role-based auth, Cloudinary
image uploads, and Razorpay payments.

## Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth
  (role-based: `user` / `admin`), Cloudinary (image upload), Razorpay
  (payments)
- **Customer storefront:** React 19 + Vite, Tailwind CSS v4, React Router,
  Axios
- **Admin dashboard:** React 19 + Vite, Tailwind CSS v4, React Router, Axios
  — a separate app with admin-only protected routes

Plain JavaScript throughout (no TypeScript).

## Project structure

```
phonecase-ecommerce/
├── backend/                 Express API (port 5001)
│   └── src/
│       ├── config/          db.js, cloudinary.js, razorpay.js
│       ├── models/          User, Product, Category, Order, Coupon
│       ├── middleware/      auth.js (JWT + role guard), upload.js, errorHandler.js
│       ├── controllers/     one per resource (auth, products, categories,
│       │                    users, orders, coupons, payments, upload, dashboard)
│       ├── routes/          one per resource, mounted under /api/*
│       ├── utils/           generateToken.js, seedData.js
│       ├── app.js           Express app (middleware + routes, no listen())
│       ├── server.js        connects DB, seeds if using in-memory DB, listens
│       ├── seed.js          CLI: `npm run seed`
│       └── verify.js        CLI: `npm run verify` — 24-check API smoke test
│
├── frontend/                 Customer storefront (port 5173)
│   └── src/
│       ├── api/               axios instance + one file per resource
│       ├── context/           AuthContext, CartContext, WishlistContext (providers)
│       ├── hooks/              useAuth, useCart, useWishlist (consume the contexts)
│       ├── components/        Navbar, Footer, Layout, ProductCard, ProtectedRoute, …
│       └── pages/              Home, Shop, ProductDetails, Cart, Wishlist, Checkout,
│                                Login, Register, MyOrders, OrderDetails, Profile
│
└── admin/                     Admin dashboard (port 5174)
    └── src/
        ├── api/                same pattern as frontend, plus dashboard.js, upload.js
        ├── context/            AuthContext (role-checked on login)
        ├── hooks/               useAuth
        ├── components/         AdminLayout (sidebar), ProtectedRoute, ImageUploader, …
        └── pages/               Login, Dashboard, Products, ProductForm, Categories,
                                  Orders, OrderDetails, Customers, CustomerDetails,
                                  Inventory, Analytics, Coupons, Settings
```

## Getting started

```bash
npm run install:all   # installs root, backend, frontend, and admin deps
npm run dev           # starts backend + frontend + admin together
```

- Storefront: http://localhost:5173
- Admin dashboard: http://localhost:5174
- API: http://localhost:5001/api

### Database

If `backend/.env` has no `MONGO_URI`, the backend automatically falls back to
an **in-memory MongoDB** for local development and seeds it with an admin
user and sample products/categories on every restart (data does not persist
across restarts). This lets you run the whole stack with zero setup.

For persistent data, set `MONGO_URI` in `backend/.env` to a MongoDB Atlas
connection string, then run `npm run seed` once to seed baseline data.

### Sample admin credentials (development)

```
Email:    admin@phonecase.test
Password: admin123
```

This account is auto-seeded whenever the backend runs against the in-memory
database. If you point `MONGO_URI` at a real database, run `npm run seed` to
create it there too. **Change or remove this account before deploying to
production.**

### Environment variables

Copy each app's `.env.example` to `.env` and fill in as needed:

**`backend/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `5001`; `5000` is avoided — macOS AirPlay Receiver uses it) |
| `MONGO_URI` | MongoDB Atlas connection string. Leave blank for in-memory dev mode |
| `JWT_SECRET` | Secret used to sign auth tokens — set a strong random value |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Required for image uploads to work |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Required for online payments to work (Cash on Delivery works without these) |
| `CLIENT_URL` / `ADMIN_URL` | Allowed CORS origins for the two frontends |

**`frontend/.env`** and **`admin/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:5001/api`) |

## Scripts (from the repo root)

| Command | Description |
|---|---|
| `npm run install:all` | Install dependencies in root, backend, frontend, and admin |
| `npm run dev` | Run backend + frontend + admin together (via `concurrently`) |
| `npm run dev:backend` / `dev:frontend` / `dev:admin` | Run one service on its own |
| `npm run seed` | Seed baseline admin/categories/products into the configured database |
| `npm run verify:backend` | Run the backend's automated API smoke test (24 checks, in-memory DB) |

Inside `frontend/` and `admin/` individually: `npm run dev`, `npm run build`,
`npm run lint` (oxlint), `npm run preview`.

## API routes

All routes are mounted under `http://localhost:5001/api`. 🔒 = requires a
valid JWT. 🔒👑 = requires a valid JWT **and** `role: admin`.

### Auth — `/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create a customer account |
| POST | `/login` | Log in, returns `{ user, token }` |
| POST | `/logout` | Clear auth cookie |
| GET | `/me` 🔒 | Current user profile |
| PUT | `/me` 🔒 | Update name/phone/addresses |
| PUT | `/change-password` 🔒 | Change password |

### Products — `/products`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List/search/filter/sort/paginate (`keyword`, `category`, `brand`, `minPrice`, `maxPrice`, `model`, `rating`, `sort`, `page`, `limit`, `featured`) |
| GET | `/filters/meta` | Distinct brands/models + price range, for building filter UI |
| GET | `/:idOrSlug` | Product detail |
| POST | `/` 🔒👑 | Create product (JSON body, or multipart with an `images` field) |
| PUT | `/:id` 🔒👑 | Update product |
| DELETE | `/:id` 🔒👑 | Delete product |
| POST | `/:id/reviews` 🔒 | Add a review (one per user per product) |

### Categories — `/categories`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List categories |
| GET | `/:idOrSlug` | Category detail |
| POST | `/` 🔒👑 | Create category |
| PUT | `/:id` 🔒👑 | Update category |
| DELETE | `/:id` 🔒👑 | Delete category |

### Users — `/users`
| Method | Path | Description |
|---|---|---|
| GET | `/wishlist` 🔒 | Current user's wishlist |
| POST | `/wishlist/:productId` 🔒 | Toggle a product in/out of the wishlist |
| GET | `/` 🔒👑 | List customers (`keyword`, `role`, `page`, `limit`) |
| GET | `/:id` 🔒👑 | Customer detail + their order history |
| PUT | `/:id` 🔒👑 | Update name/phone/role/active status |
| DELETE | `/:id` 🔒👑 | Delete a user |

### Orders — `/orders`
| Method | Path | Description |
|---|---|---|
| POST | `/` 🔒 | Place an order (server recomputes prices/stock from live product data) |
| GET | `/my` 🔒 | Current user's orders |
| PUT | `/:id/cancel` 🔒 | Cancel own order (only while `pending`/`processing`) |
| GET | `/:id` 🔒 | Order detail (owner or admin) |
| GET | `/` 🔒👑 | List all orders (`status`, `page`, `limit`) |
| PUT | `/:id/status` 🔒👑 | Update order status |

### Coupons — `/coupons`
| Method | Path | Description |
|---|---|---|
| POST | `/validate` 🔒 | Validate a coupon code against an order amount |
| GET | `/` 🔒👑 | List coupons |
| POST | `/` 🔒👑 | Create coupon |
| PUT | `/:id` 🔒👑 | Update coupon |
| DELETE | `/:id` 🔒👑 | Delete coupon |

### Payments — `/payments`
| Method | Path | Description |
|---|---|---|
| POST | `/razorpay/order` 🔒 | Create a Razorpay order for an existing (unpaid) order |
| POST | `/razorpay/verify` 🔒 | Verify the Razorpay signature and mark the order paid |

### Upload — `/upload`
| Method | Path | Description |
|---|---|---|
| POST | `/` 🔒👑 | Upload one or more images to Cloudinary (`images` field, multipart) |
| POST | `/delete` 🔒👑 | Delete an image by `{ publicId }` |

### Dashboard — `/dashboard` (all routes 🔒👑)
| Method | Path | Description |
|---|---|---|
| GET | `/summary` | Order/revenue/customer/product counts, orders-by-status, recent orders |
| GET | `/sales` | Revenue-by-day + top products (`period=7d\|30d\|12m`) |
| GET | `/inventory` | Per-product stock levels |

## Frontend routes

**Storefront** (`frontend`, port 5173): `/`, `/shop`, `/product/:slug`,
`/cart`, `/login`, `/register`, and (require login) `/wishlist`,
`/checkout`, `/orders`, `/orders/:id`, `/profile`.

**Admin dashboard** (`admin`, port 5174): `/login`, and (require an admin
account) `/`, `/products`, `/products/new`, `/products/:id/edit`,
`/categories`, `/orders`, `/orders/:id`, `/customers`, `/customers/:id`,
`/inventory`, `/analytics`, `/coupons`, `/settings`.

## Notes & known limitations

- Without real Cloudinary credentials, image upload fails with a clear error
  from Cloudinary (e.g. `cloud_name is disabled`) rather than crashing —
  admin UI surfaces the message directly.
- Without real Razorpay credentials, online payment cannot complete end to
  end (Razorpay's live API will reject the request). **Cash on Delivery**
  works fully without any keys, which is the fastest way to test the order
  flow. Payment verification is bound to the specific Razorpay order it was
  issued for and uses a constant-time signature comparison.
- The in-memory MongoDB fallback is for local development/demo only — it
  resets on every restart. Use a real `MONGO_URI` for anything persistent.
