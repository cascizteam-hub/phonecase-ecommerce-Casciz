import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../api/orders';
import Loader from '../components/Loader';

const statusStyle = {
  pending: { background: 'var(--border-color)', color: 'var(--text-secondary)' },
  processing: { background: 'rgba(217,4,41,0.15)', color: 'var(--red-hover)' },
  shipped: { background: 'rgba(217,4,41,0.3)', color: 'var(--white)' },
  delivered: { background: 'var(--red)', color: 'var(--white)' },
  cancelled: { background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getMyOrdersApi().then((data) => setOrders(data.orders));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>My Orders</h1>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Orders</span></div>
      </div>

      {!orders ? (
        <Loader />
      ) : orders.length === 0 ? (
        <div className="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
          <h3>You haven't placed any orders yet</h3>
          <p>When you do, they'll show up here.</p>
          <Link to="/shop" className="btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div className="cart-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="cart-items">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="cart-item" style={{ gridTemplateColumns: '1fr auto', textDecoration: 'none' }}>
                <div className="cart-item-details">
                  <h4>Order #{order._id.slice(-8)}</h4>
                  <div className="variant">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ ...statusStyle[order.status], fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, textTransform: 'capitalize' }}>
                    {order.status}
                  </span>
                  <span className="item-price">₹{order.totalPrice}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
