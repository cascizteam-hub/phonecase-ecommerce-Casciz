import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductApi, getProductsApi, createReviewApi } from '../api/products';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');

  const load = () => {
    getProductApi(slug).then(({ product }) => {
      setProduct(product);
      setVariantId(product.variants?.[0]?._id || null);
      setQuantity(1);
      if (product.category?._id) {
        getProductsApi({ category: product.category._id, limit: 5 }).then((data) => {
          setRelated(data.products.filter((p) => p._id !== product._id).slice(0, 4));
        });
      }
    });
  };

  useEffect(load, [slug]);
  useScrollReveal([product]);

  if (!product) return <Loader />;

  const variant = product.variants.find((v) => v._id === variantId);
  const price = variant?.priceOverride ?? product.discountPrice ?? product.price;
  const stock = variant?.stock ?? product.totalStock;
  const regularPrice = product.price * quantity;
  const currentTotal = price * quantity;
  const savings = regularPrice - currentTotal;

  const handleAddToCart = () => {
    if (!variant) {
      showToast('Please select a variant');
      return;
    }
    addItem(
      {
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        image: product.images?.[0]?.url,
        model: variant.model,
        color: variant.color,
        price,
        maxStock: stock,
      },
      quantity
    );
    showToast('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    const { added } = await toggle(product._id);
    showToast(added ? 'Added to wishlist!' : 'Removed from wishlist');
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
    <>
      <div className="page-header" style={{ padding: '30px 40px' }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <Link to="/shop">Shop</Link> <span>/</span> <span>{product.name}</span>
        </div>
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          {product.images?.length > 1 && (
            <div className="product-thumbnails">
              {product.images.map((img, i) => (
                <div
                  key={img.publicId || i}
                  className={`thumb${i === activeImage ? ' active' : ''}`}
                  style={{ background: `url(${img.url}) center/cover` }}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
          <div className="product-main-image">
            <div
              className="product-main-image-bg"
              style={{ background: product.images?.[activeImage]?.url ? `url(${product.images[activeImage].url}) center/cover` : 'linear-gradient(145deg, #e8f5e9, #c8e6c9)' }}
            />
            {product.isFeatured && <span className="product-badge" style={{ top: 20, left: 20 }}>Featured</span>}
          </div>
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div style={{ marginBottom: 12 }}>
            <StarRating rating={product.rating} count={product.numReviews} />
          </div>
          <p className="description">{product.description}</p>

          {product.variants?.length > 0 && (
            <div className="option-group">
              <label>Step 1: Select Variant</label>
              <div className="case-type-options">
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    className={`case-type-btn${variantId === v._id ? ' active' : ''}`}
                    disabled={v.stock === 0}
                    onClick={() => { setVariantId(v._id); setQuantity(1); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 18h6" /></svg>
                    {v.model} {v.color && `· ${v.color}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="option-group">
            <label>Step 2: Quantity</label>
            <div className="quantity-selector">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <input type="text" readOnly value={quantity} />
              <button type="button" onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}>+</button>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 8, display: 'inline-block' }}>
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="order-summary" style={{ display: 'block' }}>
            <div className="order-summary-row">
              <span>Quantity:</span>
              <strong>{quantity}</strong>
            </div>
            {savings > 0 && (
              <div className="order-summary-row">
                <span>Original Price:</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-light)' }}>₹{regularPrice}</span>
              </div>
            )}
            <div className="order-summary-row total">
              <span>Total:</span>
              <span>₹{currentTotal}</span>
            </div>
          </div>

          {savings > 0 && (
            <div className="congrats-message">
              You're saving
              <span className="amount">₹{savings}</span>
            </div>
          )}

          <div className="add-to-cart-section">
            <button className="btn-primary" onClick={handleAddToCart} disabled={stock === 0} id="addToCartBtn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              Add to Cart
            </button>
            <button className="btn-primary" style={{ background: 'var(--green-700)' }} onClick={handleBuyNow} disabled={stock === 0}>
              Buy Now
            </button>
            <button className="btn-wishlist" onClick={handleWishlist}>
              <svg viewBox="0 0 24 24" style={{ fill: isWishlisted(product._id) ? 'var(--green-500)' : 'none' }}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>

          <div className="product-features">
            <div className="feature-item"><svg viewBox="0 0 24 24"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg> Free Delivery</div>
            <div className="feature-item"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> 1 Year Warranty</div>
            <div className="feature-item"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M9 12l2 2 4-4" /></svg> 30-Day Returns</div>
            <div className="feature-item"><svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg> Secure Payment</div>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Reviews ({product.numReviews})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {product.reviews.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No reviews yet.</p>}
              {product.reviews.map((r) => (
                <div key={r._id} style={{ borderBottom: '1px solid var(--green-100)', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.name || 'Anonymous'}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 4 }}>{r.comment}</p>}
                </div>
              ))}
            </div>

            <form onSubmit={handleReviewSubmit} className="form-group" style={{ maxWidth: 400 }}>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>
                ))}
              </select>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your thoughts…"
                rows={3}
                style={{ padding: 12, border: '2px solid var(--green-200)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', outline: 'none' }}
              />
              {reviewError && <p style={{ color: '#e74c3c', fontSize: 13 }}>{reviewError}</p>}
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Review</button>
            </form>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-header">
            <span className="section-label">You May Also Like</span>
            <h2>Related Products</h2>
          </div>
          <div className="products-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
