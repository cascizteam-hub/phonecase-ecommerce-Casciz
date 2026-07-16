import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../api/orders';
import Loader from '../components/Loader';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function MyOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getMyOrdersApi().then((data) => setOrders(data.orders));
  }, []);

  if (!orders) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
        <Link to="/shop" className="text-gray-900 font-medium underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h1>
      <div className="flex flex-col divide-y divide-gray-100">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="flex items-center justify-between py-4 hover:bg-gray-50 px-2 -mx-2 rounded"
          >
            <div>
              <p className="font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                {order.status}
              </span>
              <span className="font-semibold text-gray-900">₹{order.totalPrice}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
