import { useEffect, useState } from 'react';
import { getInventoryReportApi } from '../api/dashboard';
import Loader from '../components/Loader';

export default function Inventory() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    getInventoryReportApi().then((data) => setProducts(data.products));
  }, []);

  if (!products) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Total Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.variants.map((v) => `${v.model}${v.color ? ` (${v.color})` : ''}: ${v.stock}`).join(', ')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.totalStock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {p.totalStock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
