import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderApi, updateOrderStatusApi } from '../api/orders';
import Loader from '../components/Loader';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => getOrderApi(id).then((data) => setOrder(data.order));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!order) return <Loader />;

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await updateOrderStatusApi(order._id, status);
      await load();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8)}</h1>
          <p className="text-sm text-gray-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="rounded border border-gray-300 px-3 py-2 text-sm capitalize"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
        <p className="text-sm text-gray-600">
          {order.user?.name} · {order.user?.email}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
        <div className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name} {item.model && `(${item.model}${item.color ? ` · ${item.color}` : ''})`} × {item.quantity}
              </span>
              <span className="text-gray-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-1 text-sm">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalPrice}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Payment</span>
            <span>
              {order.paymentMethod} · {order.isPaid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-2">Shipping Address</h2>
        <p className="text-sm text-gray-600">
          {order.shippingAddress.fullName} · {order.shippingAddress.phone}
          <br />
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
      </div>
    </div>
  );
}
