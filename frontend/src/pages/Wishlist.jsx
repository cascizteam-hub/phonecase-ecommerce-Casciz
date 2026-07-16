import { useWishlist } from '../hooks/useWishlist';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
        <Link to="/shop" className="text-gray-900 font-medium underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {wishlist.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
