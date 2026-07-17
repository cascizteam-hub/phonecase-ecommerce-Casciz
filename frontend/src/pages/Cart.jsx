import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateCouponApi } from '../api/coupons';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  if (items.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Cart</span></div>
        </div>
        <div className="cart-empty">
          <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      </>
    );
  }

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  const handleCheckout = () => navigate(user ? '/checkout' : '/login?redirect=/checkout');

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      await validateCouponApi({ code: couponCode, orderAmount: subtotal });
      showToast(`Coupon "${couponCode}" is valid — applied at checkout!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid coupon');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Cart</span></div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={`${item.productId}-${item.variantId}`}>
              <div className="cart-item-image">
                <div className="cart-item-image-bg" style={{ background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(145deg, #e8f5e9, #c8e6c9)' }} />
              </div>
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <div className="variant">{item.model} {item.color && `· ${item.color}`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <div className="quantity-selector" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                    <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)}>−</button>
                    <input type="text" readOnly value={item.quantity} />
                    <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                  </div>
                  <span className="item-price">₹{item.price * item.quantity}</span>
                </div>
              </div>
              <div className="cart-item-actions">
                <button className="remove-btn" onClick={() => removeItem(item)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
          <div className="coupon-input">
            <input type="text" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
            <button onClick={applyCoupon}>Apply</button>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <Link to="/shop" className="btn-secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
