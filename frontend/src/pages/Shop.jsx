import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PRICE_RANGES = [
  { value: '0-399', label: 'Under ₹400' },
  { value: '400-599', label: '₹400 - ₹599' },
  { value: '600-9999', label: '₹600 & Above' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || '';
  const activePriceRanges = searchParams.getAll('price');
  const sort = searchParams.get('sort') || 'featured';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    getCategoriesApi().then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    let minPrice, maxPrice;
    if (activePriceRanges.length > 0) {
      const bounds = activePriceRanges.map((r) => r.split('-').map(Number));
      minPrice = Math.min(...bounds.map((b) => b[0]));
      maxPrice = Math.max(...bounds.map((b) => b[1]));
    }

    const sortMap = { featured: 'newest', 'price-low': 'price-asc', 'price-high': 'price-desc', name: undefined };
    getProductsApi({
      category: activeCategory || undefined,
      minPrice,
      maxPrice,
      sort: sortMap[sort],
      page,
      limit: 12,
    })
      .then((result) => {
        let products = result.products;
        if (sort === 'name') products = [...products].sort((a, b) => a.name.localeCompare(b.name));
        setData({ ...result, products });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchParams.get('price'), sort, page]);

  useScrollReveal([data]);

  const activeCategoryObj = categories.find((c) => c._id === activeCategory);
  const pageTitle = activeCategoryObj ? `${activeCategoryObj.name}` : 'Shop All Cases';

  const toggleCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (activeCategory === id) next.delete('category');
    else next.set('category', id);
    next.delete('page');
    setSearchParams(next);
  };

  const togglePriceRange = (value) => {
    const next = new URLSearchParams(searchParams);
    const current = next.getAll('price');
    next.delete('price');
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => next.append('price', v));
    } else {
      [...current, value].forEach((v) => next.append('price', v));
    }
    next.delete('page');
    setSearchParams(next);
  };

  const setSort = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <>
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <p>Discover our complete collection of premium phone cases</p>
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>{activeCategoryObj ? activeCategoryObj.name : 'Shop'}</span>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="filter-group">
            <h3>Category</h3>
            {categories.map((c) => (
              <label className="filter-option" key={c._id}>
                <input
                  type="checkbox"
                  checked={activeCategory === c._id}
                  onChange={() => toggleCategory(c._id)}
                />
                {c.name}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Price Range</h3>
            {PRICE_RANGES.map((r) => (
              <label className="filter-option" key={r.value}>
                <input
                  type="checkbox"
                  checked={activePriceRanges.includes(r.value)}
                  onChange={() => togglePriceRange(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>

          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <span className="results">{data ? `Showing ${data.total} product${data.total !== 1 ? 's' : ''}` : 'Loading…'}</span>
            <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {loading || !data ? (
            <Loader />
          ) : data.products.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1/-1', padding: 60, color: 'var(--text-light)' }}>
              No products found matching your filters.
            </p>
          ) : (
            <div className="products-grid">
              {data.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
