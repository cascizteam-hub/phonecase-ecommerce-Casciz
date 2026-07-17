import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrderApi } from '../api/orders';
import { validateCouponApi } from '../api/coupons';
import { createRazorpayOrderApi, verifyRazorpayPaymentApi } from '../api/payments';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on Delivery (COD)' },
  { value: 'upi', label: 'UPI / Google Pay / PhonePe' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'netbanking', label: 'Net Banking' },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: user?.email || '',
    phone: '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    city: '',
    state: '',
    pin: '',
  });
  const [paymentOption, setPaymentOption] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const shipping = subtotal - discount >= 999 ? 0 : 49;
  const total = Math.max(subtotal - discount + shipping, 0);

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
        <h3>Your cart is empty</h3>
        <p>Add some items to your cart before checkout.</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    setCouponMessage('');
    try {
      const { discountAmount } = await validateCouponApi({ code: couponCode, orderAmount: subtotal });
      setDiscount(discountAmount);
      setCouponMessage(`Coupon applied: -₹${discountAmount}`);
    } catch (err) {
      setDiscount(0);
      setCouponMessage(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (Object.values(form).some((v) => !v)) {
      setError('Please fill in all required fields');
      return;
    }
    setPlacing(true);

    const paymentMethod = paymentOption === 'cod' ? 'cod' : 'razorpay';

    try {
      const { order } = await createOrderApi({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          line1: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.pin,
          country: 'India',
        },
        couponCode: couponCode || undefined,
        paymentMethod,
      });

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/orders/${order._id}`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setPlacing(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId } = await createRazorpayOrderApi(order._id);

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'CaseCraft',
        description: `Order ${order._id}`,
        prefill: { name: `${form.firstName} ${form.lastName}`, email: form.email, contact: form.phone },
        handler: async (response) => {
          try {
            await verifyRazorpayPaymentApi({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/orders/${order._id}`);
          } catch {
            setError('Payment verification failed. Contact support if amount was deducted.');
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
        theme: { color: '#4aad7e' },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="page-header">
        <h1>Checkout</h1>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <Link to="/cart">Cart</Link> <span>/</span> <span>Checkout</span></div>
      </div>

      <form className="checkout-layout" onSubmit={handlePlaceOrder}>
        <div className="checkout-main">
          <div className="checkout-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="full">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
                </div>
              </div>
              <div className="full">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" required />
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>Shipping Address</h3>
            <div className="form-grid">
              <div className="form-group"><label>First Name</label><input value={form.firstName} onChange={set('firstName')} placeholder="John" required /></div>
              <div className="form-group"><label>Last Name</label><input value={form.lastName} onChange={set('lastName')} placeholder="Doe" required /></div>
              <div className="full form-group"><label>Address</label><input value={form.address} onChange={set('address')} placeholder="123 Main Street, Apt 4B" required /></div>
              <div className="form-group"><label>City</label><input value={form.city} onChange={set('city')} placeholder="Mumbai" required /></div>
              <div className="form-group"><label>State</label><input value={form.state} onChange={set('state')} placeholder="Maharashtra" required /></div>
              <div className="form-group"><label>PIN Code</label><input value={form.pin} onChange={set('pin')} placeholder="400001" required /></div>
              <div className="form-group"><label>Country</label><input value="India" readOnly /></div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`payment-option${paymentOption === opt.value ? ' active' : ''}`}
                  onClick={() => setPaymentOption(opt.value)}
                >
                  <input type="radio" name="payment" value={opt.value} checked={paymentOption === opt.value} onChange={() => setPaymentOption(opt.value)} />
                  <span className="label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: 8, flexShrink: 0, background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(145deg, #e8f5e9, #c8e6c9)' }} />
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{item.name} × {item.quantity}</div>
                  <div style={{ color: 'var(--text-light)' }}>₹{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="coupon-input">
            <input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
            <button type="button" onClick={applyCoupon}>Apply</button>
          </div>
          {couponMessage && <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>{couponMessage}</p>}

          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
          {discount > 0 && <div className="summary-row"><span>Discount</span><span style={{ color: 'var(--green-600)', fontWeight: 600 }}>-₹{discount}</span></div>}
          <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>

          {error && <p style={{ color: '#e74c3c', fontSize: 14, marginTop: 12 }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} disabled={placing}>
            {placing ? 'Processing…' : 'Place Order'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-light)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-500)" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Trusted by Thousands of Customers
          </div>
        </div>
      </form>
    </>
  );
}
