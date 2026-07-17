import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import MobileNav from './MobileNav';

export default function Header() {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="logo">Case<span>Craft</span></Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/bundles">Bundle Deals</Link>
          <Link to="/shop?category=hard">Categories</Link>
          <Link to="/search">Search</Link>
        </nav>
        <div className="header-actions">
          <button className="header-search-btn" aria-label="Search" onClick={() => navigate('/search')}>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              aria-label="Account"
              onClick={() => (user ? setAccountOpen((v) => !v) : navigate('/login'))}
              style={{ background: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {user && accountOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: 'var(--white)',
                  border: '1px solid var(--green-100)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 180,
                  padding: 8,
                  zIndex: 50,
                }}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-light)' }}>Hi, {user.name.split(' ')[0]}</div>
                <Link to="/profile" onClick={() => setAccountOpen(false)} style={{ display: 'block', padding: '10px 12px', fontSize: 14, borderRadius: 8 }}>Profile</Link>
                <Link to="/orders" onClick={() => setAccountOpen(false)} style={{ display: 'block', padding: '10px 12px', fontSize: 14, borderRadius: 8 }}>My Orders</Link>
                <Link to="/wishlist" onClick={() => setAccountOpen(false)} style={{ display: 'block', padding: '10px 12px', fontSize: 14, borderRadius: 8 }}>Wishlist</Link>
                <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 14, borderRadius: 8, background: 'none', color: '#e74c3c' }}>Logout</button>
              </div>
            )}
          </div>

          <Link to="/cart" aria-label="Cart">
            <svg viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="cart-count">{totalQuantity}</span>
          </Link>
          <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setMobileOpen(true)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
