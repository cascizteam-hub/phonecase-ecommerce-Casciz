import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
    <>
      <div className="page-header">
        <h1>Order #{order._id.slice(-8)}</h1>
        <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <Link to="/orders">Orders</Link> <span>/</span> <span>#{order._id.slice(-8)}</span></div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
        <div className="checkout-section">
          <h3>Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.name} {item.model && `(${item.model}${item.color ? ` · ${item.color}` : ''})`} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 16, paddingTop: 16 }}>
            <div className="summary-row"><span>Items</span><span>₹{order.itemsPrice}</span></div>
            {order.discountAmount > 0 && (
              <div className="summary-row"><span>Discount</span><span style={{ color: 'var(--red)' }}>-₹{order.discountAmount}</span></div>
            )}
            <div className="summary-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{order.totalPrice}</span></div>
          </div>
        </div>

        <div className="checkout-section">
          <h3>Shipping Address</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
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
            style={{ background: 'none', color: 'var(--red-hover)', fontSize: 14, fontWeight: 600, textDecoration: 'underline' }}
          >
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
      </div>
    </>
  );
}
