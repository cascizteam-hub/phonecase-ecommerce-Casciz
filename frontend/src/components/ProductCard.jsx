import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductCard({ product }) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(product._id);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
    >
      <button
        onClick={handleWishlist}
        aria-label="Toggle wishlist"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
      >
        <span className={wishlisted ? 'text-red-500' : 'text-gray-400'}>{wishlisted ? '♥' : '♡'}</span>
      </button>

      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-gray-300 text-4xl">📱</span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <StarRating rating={product.rating} count={product.numReviews} />
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-gray-900">₹{price}</span>
          {hasDiscount && <span className="text-sm text-gray-400 line-through">₹{product.price}</span>}
        </div>
      </div>
    </Link>
  );
}
