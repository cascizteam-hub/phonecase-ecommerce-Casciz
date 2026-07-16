import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderApi, cancelOrderApi } from '../api/orders';
import Loader from '../components/Loader';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => getOrderApi(id).then((data) => setOrder(data.order));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!order) return <Loader />;

  const canCancel = ['pending', 'processing'].includes(order.status);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrderApi(order._id);
      await load();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order #{order._id.slice(-8)}</h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className="text-sm px-3 py-1 rounded-full bg-gray-100 capitalize">{order.status}</span>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
        <div className="flex flex-col gap-3">
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
          <div className="flex justify-between">
            <span className="text-gray-600">Items</span>
            <span>₹{order.itemsPrice}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-6">
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

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="text-red-600 text-sm font-medium underline disabled:opacity-50"
        >
          {cancelling ? 'Cancelling…' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
