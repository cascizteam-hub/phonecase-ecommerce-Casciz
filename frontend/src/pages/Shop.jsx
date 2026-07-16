import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    getCategoriesApi().then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProductsApi({
      keyword: keyword || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort,
      page,
      limit: 12,
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [keyword, category, minPrice, maxPrice, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      <aside className="flex flex-col gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
          <div className="flex flex-col gap-1 text-sm">
            <button
              onClick={() => updateParam('category', '')}
              className={`text-left ${!category ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => updateParam('category', c._id)}
                className={`text-left ${category === c._id ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={minPrice}
              onBlur={(e) => updateParam('minPrice', e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <span>–</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam('maxPrice', e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {data ? `${data.total} result${data.total === 1 ? '' : 's'}` : ''}
            {keyword && <> for “{keyword}”</>}
          </p>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : data.products.length === 0 ? (
          <p className="text-gray-500 py-12 text-center">No products match your filters.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-8 w-8 rounded-full text-sm ${
                      p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
