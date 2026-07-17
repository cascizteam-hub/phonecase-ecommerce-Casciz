import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <>
      <div className="page-header">
        <h1>My Wishlist</h1>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Wishlist</span></div>
      </div>

      {wishlist.length === 0 ? (
        <div className="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-300)" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love and find them here later.</p>
          <Link to="/shop" className="btn-primary">Browse products</Link>
        </div>
      ) : (
        <div className="section">
          <div className="products-grid">
            {wishlist.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
