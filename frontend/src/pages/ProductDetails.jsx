import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductApi, createReviewApi } from '../api/products';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [addedMessage, setAddedMessage] = useState('');

  const load = () => {
    getProductApi(slug).then(({ product }) => {
      setProduct(product);
      setVariantId(product.variants?.[0]?._id || null);
    });
  };

  useEffect(load, [slug]);

  if (!product) return <Loader />;

  const variant = product.variants.find((v) => v._id === variantId);
  const price = variant?.priceOverride ?? product.discountPrice ?? product.price;
  const stock = variant?.stock ?? product.totalStock;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product._id,
        variantId: variant?._id,
        name: product.name,
        image: product.images?.[0]?.url,
        model: variant?.model,
        color: variant?.color,
        price,
        maxStock: stock,
      },
      quantity
    );
    setAddedMessage('Added to cart!');
    setTimeout(() => setAddedMessage(''), 2000);
  };

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    await toggle(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!user) return navigate('/login');
    try {
      await createReviewApi(product._id, reviewForm);
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
          {product.images?.[activeImage]?.url ? (
            <img src={product.images[activeImage].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl text-gray-300">📱</span>
          )}
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2 mt-3">
            {product.images.map((img, i) => (
              <button
                key={img.publicId || i}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 rounded-lg overflow-hidden border ${
                  i === activeImage ? 'border-gray-900' : 'border-gray-200'
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
        <div className="mt-2">
          <StarRating rating={product.rating} count={product.numReviews} />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-2xl font-bold text-gray-900">₹{price}</span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-gray-400 line-through">₹{product.price}</span>
          )}
        </div>

        <p className="text-gray-600 mt-4">{product.description}</p>

        {product.variants?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Choose variant</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => setVariantId(v._id)}
                  disabled={v.stock === 0}
                  className={`px-3 py-1.5 rounded-full border text-sm disabled:opacity-40 ${
                    variantId === v._id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {v.model} {v.color && `· ${v.color}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <div className="flex items-center border border-gray-300 rounded-full">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1.5">
              −
            </button>
            <span className="px-3">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="px-3 py-1.5"
            >
              +
            </button>
          </div>
          <span className="text-sm text-gray-500">{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="flex-1 bg-gray-900 text-white font-medium py-3 rounded-full disabled:opacity-40"
          >
            Add to Cart
          </button>
          <button
            onClick={handleWishlist}
            className="h-12 w-12 rounded-full border border-gray-300 flex items-center justify-center"
          >
            <span className={isWishlisted(product._id) ? 'text-red-500' : 'text-gray-400'}>
              {isWishlisted(product._id) ? '♥' : '♡'}
            </span>
          </button>
        </div>
        {addedMessage && <p className="text-green-600 text-sm mt-2">{addedMessage}</p>}

        <section className="mt-10">
          <h2 className="font-semibold text-gray-900 mb-3">Reviews ({product.numReviews})</h2>
          <div className="flex flex-col gap-4 mb-6">
            {product.reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet.</p>}
            {product.reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{r.user?.name || 'Anonymous'}</span>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>

          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-2">
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              className="rounded border border-gray-300 px-2 py-1 text-sm w-32"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your thoughts…"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              rows={3}
            />
            {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
            <button type="submit" className="self-start bg-gray-900 text-white px-4 py-2 rounded-full text-sm">
              Submit Review
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
