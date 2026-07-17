import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MobileNav({ open, onClose }) {
  const { user } = useAuth();

  return (
    <div className={`mobile-nav${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mobile-nav-inner">
        <button className="mobile-nav-close" onClick={onClose}>&times;</button>
        <Link to="/" onClick={onClose}>Home</Link>
        <Link to="/shop" onClick={onClose}>Shop All</Link>
        <Link to="/shop?category=hard" onClick={onClose}>Hard Cases</Link>
        <Link to="/shop?category=soft" onClick={onClose}>Soft Cases</Link>
        <Link to="/shop?category=glass" onClick={onClose}>Glass Cases</Link>
        <Link to="/bundles" onClick={onClose}>Bundle Deals</Link>
        <Link to="/cart" onClick={onClose}>Cart</Link>
        {user ? (
          <>
            <Link to="/wishlist" onClick={onClose}>Wishlist</Link>
            <Link to="/orders" onClick={onClose}>My Orders</Link>
            <Link to="/profile" onClick={onClose}>Profile</Link>
          </>
        ) : (
          <Link to="/login" onClick={onClose}>Login / Register</Link>
        )}
      </div>
    </div>
  );
}
