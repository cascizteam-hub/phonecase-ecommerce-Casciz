import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi, deleteProductApi } from '../api/products';
import Loader from '../components/Loader';

export default function Products() {
  const [data, setData] = useState(null);
  const [keyword, setKeyword] = useState('');

  const load = () => getProductsApi({ keyword: keyword || undefined, limit: 50 }).then(setData);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    await deleteProductApi(product._id);
    load();
  };

  if (!data) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/products/new" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products…"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm w-64"
        />
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.products.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.category?.name}</td>
                <td className="px-4 py-3 text-gray-900">₹{p.discountPrice ?? p.price}</td>
                <td className="px-4 py-3 text-gray-600">{p.totalStock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link to={`/products/${p._id}/edit`} className="text-gray-600 hover:text-gray-900">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
