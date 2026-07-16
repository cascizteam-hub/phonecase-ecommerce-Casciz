import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/shop" className="text-gray-900 font-medium underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const handleCheckout = () => navigate(user ? '/checkout' : '/login?redirect=/checkout');

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-4 py-4">
            <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-300">📱</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.model} {item.color && `· ${item.color}`}
              </p>
              <p className="text-sm text-gray-900 mt-1">₹{item.price}</p>
            </div>
            <div className="flex items-center border border-gray-300 rounded-full">
              <button onClick={() => updateQuantity(item, item.quantity - 1)} className="px-3 py-1">
                −
              </button>
              <span className="px-3">{item.quantity}</span>
              <button onClick={() => updateQuantity(item, item.quantity + 1)} className="px-3 py-1">
                +
              </button>
            </div>
            <button onClick={() => removeItem(item)} className="text-sm text-red-600 ml-2">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl p-5 h-fit">
        <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">₹{subtotal}</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Shipping and discounts calculated at checkout.</p>
        <button
          onClick={handleCheckout}
          className="w-full bg-gray-900 text-white font-medium py-3 rounded-full"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
