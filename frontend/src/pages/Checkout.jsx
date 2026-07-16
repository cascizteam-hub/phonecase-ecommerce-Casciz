import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(emptyAddress);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const total = Math.max(subtotal - discount, 0);

  if (items.length === 0) {
    return <p className="text-center py-20 text-gray-500">Your cart is empty.</p>;
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
    setPlacing(true);

    try {
      const { order } = await createOrderApi({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: address,
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
        prefill: { name: user?.name, email: user?.email },
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
        theme: { color: '#111827' },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-gray-900">Shipping Address</h1>
        <input
          required
          placeholder="Full name"
          value={address.fullName}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Phone"
          value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          required
          placeholder="Address line 1"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          placeholder="Address line 2 (optional)"
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            required
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <input
          required
          placeholder="Postal code"
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />

        <h2 className="text-lg font-semibold text-gray-900 mt-4">Payment Method</h2>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === 'razorpay'}
              onChange={() => setPaymentMethod('razorpay')}
            />
            Razorpay (Card/UPI/Netbanking)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
            Cash on Delivery
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={placing}
          className="bg-gray-900 text-white font-medium py-3 rounded-full disabled:opacity-50 mt-2"
        >
          {placing ? 'Processing…' : `Place Order — ₹${total}`}
        </button>
      </form>

      <div className="border border-gray-200 rounded-xl p-5 h-fit">
        <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="flex flex-col gap-2 mb-4 text-sm">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex justify-between">
              <span className="text-gray-600">
                {item.name} × {item.quantity}
              </span>
              <span className="text-gray-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={!couponCode}
            className="text-sm bg-gray-100 px-3 py-1.5 rounded disabled:opacity-40"
          >
            Apply
          </button>
        </div>
        {couponMessage && <p className="text-xs text-gray-600 mb-3">{couponMessage}</p>}

        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 mt-1">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
