import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProductsApi({ featured: 'true', limit: 8 }).then((data) => setFeatured(data.products));
    getCategoriesApi().then((data) => setCategories(data.categories));
  }, []);

  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-2xl bg-gray-900 text-white px-8 py-16 flex flex-col items-start gap-4">
        <h1 className="text-3xl md:text-4xl font-bold max-w-lg">
          Phone cases built to survive the drop.
        </h1>
        <p className="text-gray-300 max-w-md">
          Shockproof, stylish, and made for every model — browse our full collection.
        </p>
        <Link
          to="/shop"
          className="mt-2 bg-white text-gray-900 font-medium px-5 py-2.5 rounded-full hover:bg-gray-100"
        >
          Shop Now
        </Link>
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/shop?category=${c._id}`}
                className="rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">📱</span>
                <p className="mt-2 font-medium text-gray-800">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured Cases</h2>
          <Link to="/shop" className="text-sm text-gray-600 hover:text-gray-900">
            View all →
          </Link>
        </div>
        {featured === null ? (
          <Loader />
        ) : featured.length === 0 ? (
          <p className="text-gray-500">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
