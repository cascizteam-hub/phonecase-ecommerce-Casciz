import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductsApi } from '../api/products';
import ProductCard from '../components/ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const debounceRef = useRef(null);

  const runSearch = (q) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    getProductsApi({ keyword: q.trim(), limit: 24 }).then((data) => setResults(data.products));
  };

  useEffect(() => {
    if (searchParams.get('q')) runSearch(searchParams.get('q'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollReveal([results]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') runSearch(query);
  };

  return (
    <>
      <div className="page-header">
        <h1>Search Products</h1>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Search</span></div>
      </div>

      <div className="search-container">
        <div className="search-bar-large">
          <input
            type="text"
            autoFocus
            placeholder="Search for cases, collections, categories…"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <button onClick={() => runSearch(query)}>Search</button>
        </div>

        <div className="search-results-info">
          {results === null ? (
            <p>Try searching for "green", "glass", "minimalist", or "sports"</p>
          ) : results.length === 0 ? (
            <p>No results found for "<strong>{query}</strong>". Try a different search term.</p>
          ) : (
            <p>Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"</p>
          )}
        </div>

        {results && results.length > 0 && (
          <div className="products-grid">
            {results.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
