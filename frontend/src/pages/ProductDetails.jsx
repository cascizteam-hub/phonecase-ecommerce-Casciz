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
import { PHONE_BRANDS } from '../data/phoneBrands';
import { BUNDLE_PRICING, getBundlePrice, getRegularPrice, getSavings } from '../data/bundlePricing';

const FALLBACK_GRADIENT = 'linear-gradient(145deg, #e8f5e9, #c8e6c9)';

// Cloudinary image if the product has one, else the original design's
// gradient placeholder — used for both the main image and each thumbnail.
const imageStyle = (url, brighten) => ({
  background: url ? `url(${url}) center/cover no-repeat` : FALLBACK_GRADIENT,
  filter: !url && brighten ? brighten : undefined,
});

const CARD_META = [
  { qty: 1, badge: '', label: 'Starter' },
  { qty: 2, badge: 'MOST POPULAR', label: 'Best Starter' },
  { qty: 3, badge: 'BEST VALUE', label: 'Best Value' },
  { qty: 4, badge: 'MAX SAVINGS', label: 'Family Pack' },
];

const DYNAMIC_MESSAGES = {
  1: '💡 Add 1 more case and unlock bundle savings.',
  2: '✨ Great choice! Add 1 more case for maximum value.',
  3: "🎉 You're getting our Best Value bundle!",
  4: '🏆 Maximum Savings Unlocked! Best deal possible.',
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeThumb, setActiveThumb] = useState(0);

  const [selectedCaseType, setSelectedCaseType] = useState('Glass Case');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [highlightedQty, setHighlightedQty] = useState(0);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');

  const load = () => {
    getProductApi(slug).then(({ product }) => {
      setProduct(product);
      setActiveThumb(0);
      if (product.category?._id) {
        getProductsApi({ category: product.category._id, limit: 5 }).then((data) => {
          setRelated(data.products.filter((p) => p._id !== product._id).slice(0, 4));
        });
      }
    });
  };

  useEffect(load, [slug]);
  useScrollReveal([product]);

  // Keep the pricing-card highlight in sync with the number of models
  // picked, exactly like the original's updatePricingCards()/selectBundle().
  useEffect(() => {
    if (selectedModels.length > 0) setHighlightedQty(selectedModels.length);
  }, [selectedModels.length]);

  if (!product) return <Loader />;

  // Always 3 thumbnail slots, matching the original gallery — filled with
  // real Cloudinary images when present, cycling if there are fewer than 3.
  const images = product.images || [];
  const thumbUrls = [0, 1, 2].map((i) => (images.length ? images[i % images.length].url : null));
  const mainImageUrl = images.length ? images[activeThumb % images.length].url : null;

  const pricing = BUNDLE_PRICING[selectedCaseType];
  const bundlePrice = selectedModels.length > 0 ? getBundlePrice(selectedCaseType, selectedModels.length) : 0;
  const regularPrice = selectedModels.length > 0 ? getRegularPrice(selectedCaseType, selectedModels.length) : 0;
  const savings = selectedModels.length > 0 ? getSavings(selectedCaseType, selectedModels.length) : 0;

  const selectCaseType = (type) => setSelectedCaseType(type);

  const selectBundleCard = (qty) => {
    setHighlightedQty(qty);
    if (selectedModels.length > qty) setSelectedModels((prev) => prev.slice(0, qty));
  };

  const onBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModels([]);
  };

  const toggleModel = (model) => {
    setSelectedModels((prev) => {
      if (prev.includes(model)) return prev.filter((m) => m !== model);
      if (prev.length >= 4) {
        showToast('Maximum 4 models allowed');
        return prev;
      }
      return [...prev, model];
    });
  };

  const removeModel = (model) => setSelectedModels((prev) => prev.filter((m) => m !== model));

  const validateSelection = () => {
    if (!selectedBrand) {
      showToast('Please select a phone brand');
      return false;
    }
    if (selectedModels.length === 0) {
      showToast('Please select at least one phone model');
      return false;
    }
    return true;
  };

  // The bundle table above is illustrative pricing (same as the original
  // static site's, which had no real backend either) — the actual charge
  // always comes from the product's real price × quantity, computed
  // server-side at order time. We add one real cart line per bundle with
  // quantity = number of models picked, so what's charged is honest and
  // matches what the backend will actually bill.
  const addBundleToCart = () => {
    const unitPrice = product.discountPrice ?? product.price;
    addItem(
      {
        productId: product._id,
        variantId: undefined,
        name: product.name,
        image: images[0]?.url,
        model: selectedModels.join(', '),
        color: selectedCaseType,
        price: unitPrice,
        maxStock: product.totalStock,
      },
      selectedModels.length
    );
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addBundleToCart();
    showToast(`Added ${selectedModels.length} case${selectedModels.length > 1 ? 's' : ''} to cart!`);
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    addBundleToCart();
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
          <Link to="/">Home</Link> <span>/</span> <Link to="/shop">Shop</Link> <span>/</span>
          <span id="breadcrumbProduct">{product.name}</span>
        </div>
      </div>

      <div className="product-detail" id="productDetail">
        <div className="product-gallery">
          <div className="product-thumbnails">
            {thumbUrls.map((url, i) => (
              <div
                key={i}
                className={`thumb${i === activeThumb ? ' active' : ''}`}
                style={imageStyle(url, i === 1 ? 'brightness(0.95)' : i === 2 ? 'brightness(1.05)' : undefined)}
                onClick={() => setActiveThumb(i)}
              />
            ))}
          </div>
          <div className="product-main-image">
            <div className="product-main-image-bg" style={imageStyle(mainImageUrl)} />
            {product.isFeatured && <span className="product-badge" style={{ top: 20, left: 20 }}>Featured</span>}
          </div>
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div style={{ marginBottom: 12 }}>
            <StarRating rating={product.rating} count={product.numReviews} />
          </div>
          <p className="description">{product.description}</p>

          <div className="popular-badge-text">⭐ 83% of customers choose 2 or more cases</div>

          <div className="option-group">
            <label>Step 1: Select Case Type</label>
            <div className="case-type-options">
              <button
                className={`case-type-btn${selectedCaseType === 'Glass Case' ? ' active' : ''}`}
                onClick={() => selectCaseType('Glass Case')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 18h6" /></svg>
                Glass Case
              </button>
              <button
                className={`case-type-btn${selectedCaseType === 'Metal Case' ? ' active' : ''}`}
                onClick={() => selectCaseType('Metal Case')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 18h6" /><path d="M9 6h6" /></svg>
                Metal Case
              </button>
            </div>
          </div>

          <div className="pricing-section">
            <div className="pricing-section-title">Step 2: Choose Your Bundle (Buy More, Save More!)</div>
            <div className="pricing-cards">
              {CARD_META.map((card) => {
                const price = pricing[card.qty];
                const cardRegular = (selectedCaseType === 'Metal Case' ? 349 : 399) * card.qty;
                const cardSavings = cardRegular - price;
                const isPopular = card.qty === 3;
                const isSelected = highlightedQty === card.qty;
                return (
                  <div
                    key={card.qty}
                    className={`pricing-card${isPopular ? ' popular' : ''}${isSelected ? ' selected' : ''}`}
                    onClick={() => selectBundleCard(card.qty)}
                  >
                    {card.badge && <div className="pricing-badge">{card.badge}</div>}
                    <div className="quantity">{card.qty}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>Case{card.qty > 1 ? 's' : ''}</div>
                    <div className="price">₹{price}</div>
                    {cardSavings > 0 ? <div className="savings">Save ₹{cardSavings}</div> : <div style={{ height: 28 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="option-group">
            <label>Step 3: Select Phone Brand</label>
            <div className="phone-selector">
              <div className="selector-group">
                <select value={selectedBrand} onChange={(e) => onBrandChange(e.target.value)}>
                  <option value="">-- Choose Brand --</option>
                  {Object.keys(PHONE_BRANDS).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {selectedBrand && (
                <div className="selector-group" id="modelGroup">
                  <label>
                    Select Phone Model(s) <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(Min 1, Max 4 — Each model = 1 case)</span>
                  </label>
                  <div className="model-checkboxes">
                    {PHONE_BRANDS[selectedBrand].map((m) => (
                      <label
                        key={m}
                        className={`model-checkbox${selectedModels.includes(m) ? ' selected' : ''}`}
                      >
                        <input type="checkbox" checked={selectedModels.includes(m)} onChange={() => toggleModel(m)} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="selected-models">
                {selectedModels.map((m) => (
                  <div className="model-tag" key={m}>
                    {m}
                    <button type="button" onClick={() => removeModel(m)}>&times;</button>
                  </div>
                ))}
              </div>

              {selectedModels.length > 0 && (
                <div className="dynamic-message">{DYNAMIC_MESSAGES[selectedModels.length]}</div>
              )}
            </div>
          </div>

          {selectedModels.length > 0 && (
            <div className="order-summary">
              <div className="order-summary-row"><span>Selected Models:</span><strong>{selectedModels.length}</strong></div>
              <div className="order-summary-row">
                <span>Original Price:</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-light)' }}>₹{regularPrice}</span>
              </div>
              <div className="order-summary-row"><span>Bundle Price:</span><strong>₹{bundlePrice}</strong></div>
              <div className="order-summary-row"><span>You Save:</span><span className="savings-highlight">₹{savings}</span></div>
            </div>
          )}

          {selectedModels.length > 0 && savings > 0 && (
            <div className="congrats-message">
              Congratulations! You saved
              <span className="amount">₹{savings}</span>
            </div>
          )}

          <div className="add-to-cart-section">
            <button className="btn-primary" onClick={handleAddToCart} id="addToCartBtn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              Add to Cart
            </button>
            <button className="btn-primary" style={{ background: 'var(--green-700)' }} onClick={handleBuyNow}>Buy Now</button>
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
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
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
    </>
  );
}
