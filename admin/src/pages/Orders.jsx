import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllOrdersApi } from '../api/orders';
import Loader from '../components/Loader';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const [data, setData] = useState(null);

  useEffect(() => {
    getAllOrdersApi({ status: status || undefined, limit: 50 }).then(setData);
  }, [status]);

  const setStatusFilter = (s) => {
    const next = new URLSearchParams(searchParams);
    if (s) next.set('status', s);
    else next.delete('status');
    setSearchParams(next);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStatusFilter('')}
          className={`text-sm px-3 py-1 rounded-full ${!status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-sm px-3 py-1 rounded-full capitalize ${
              status === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {!data ? (
        <Loader />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o._id}`} className="text-gray-900 font-medium hover:underline">
                      #{o._id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.user?.name}</td>
                  <td className="px-4 py-3 text-gray-900">₹{o.totalPrice}</td>
                  <td className="px-4 py-3">{o.isPaid ? '✓' : '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{o.status}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
