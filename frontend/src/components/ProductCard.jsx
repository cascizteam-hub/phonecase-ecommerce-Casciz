import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';

const COLOR_NAME_MAP = {
  black: '#1a1a1a', white: '#ffffff', clear: '#eeeeee', transparent: '#eeeeee',
  green: '#4aad7e', blue: '#4a90d9', red: '#e74c3c', brown: '#795548',
  pink: '#e91e8c', purple: '#8e44ad', gold: '#d4af37', silver: '#bdc3c7',
};

const swatchFor = (color) => COLOR_NAME_MAP[color?.toLowerCase()] || '#666666';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const colors = [...new Set((product.variants || []).map((v) => v.color).filter(Boolean))];
  const image = product.images?.[0]?.url;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.[0];
    if (!variant) {
      navigate(`/product/${product.slug}`);
      return;
    }
    addItem(
      {
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        image,
        model: variant.model,
        color: variant.color,
        price: variant.priceOverride ?? price,
        maxStock: variant.stock,
      },
      1
    );
    showToast('Added to cart!');
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card reveal">
      {hasDiscount && <span className="product-badge sale">Sale</span>}
      <div className="product-image">
        {image ? (
          <img
            className="product-image-bg"
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="product-image-bg" style={{ background: 'linear-gradient(145deg, #241012, #181818)' }} />
        )}
        <button className="product-quick-add" onClick={handleQuickAdd}>+ Quick Add</button>
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <div className="product-price">
          <span className="current">₹{price}</span>
          {hasDiscount && (
            <>
              <span className="original">₹{product.price}</span>
              <span className="discount">{discountPct}% OFF</span>
            </>
          )}
        </div>
        {colors.length > 0 && (
          <div className="product-colors">
            {colors.map((c) => (
              <span key={c} className="color-dot" style={{ background: swatchFor(c) }} title={c} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
