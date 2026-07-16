import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/shop?keyword=${encodeURIComponent(keyword.trim())}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-gray-900 shrink-0">
          CaseCraft
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-gray-600 shrink-0">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <Link to="/shop" className="hover:text-gray-900">Shop</Link>
        </nav>

        <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            type="search"
            placeholder="Search phone cases…"
            className="w-full rounded-full border border-gray-300 px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </form>

        <div className="flex items-center gap-4 shrink-0 text-sm">
          <Link to="/wishlist" className="text-gray-600 hover:text-gray-900" aria-label="Wishlist">
            ♡
          </Link>
          <Link to="/cart" className="relative text-gray-600 hover:text-gray-900" aria-label="Cart">
            🛒
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <button className="text-gray-700 font-medium">{user.name.split(' ')[0]}</button>
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50">My Orders</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-gray-700 font-medium hover:text-gray-900">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
