import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import ProductCard from '../components/ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg, #a8e6cf, #88d4ab)',
  'linear-gradient(135deg, #b8d8be, #7fb890)',
  'linear-gradient(135deg, #c5e8d5, #96c9ae)',
  'linear-gradient(135deg, #d4f0e0, #a3d9bf)',
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getCategoriesApi().then((data) => setCategories(data.categories));
    getProductsApi({ featured: 'true', limit: 8 }).then((data) => {
      if (data.products.length > 0) {
        setFeatured(data.products);
      } else {
        getProductsApi({ limit: 8 }).then((fallback) => setFeatured(fallback.products));
      }
    });
  }, []);

  useScrollReveal([categories, featured]);

  return (
    <>
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="circle c1"></div>
          <div className="circle c2"></div>
          <div className="circle c3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              New Arrivals 2026
            </div>
            <h1>Protect Your Phone in <em>Style</em></h1>
            <p>Discover premium handcrafted phone cases designed for protection, personality, and perfection. Every case tells a story.</p>
            <div className="hero-btns">
              <Link to="/shop" className="btn-primary">
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/shop" className="btn-secondary">Explore Collections</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-phone">
              <div className="hero-phone-inner">
                <div className="case-preview">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--green-500)" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M12 18h.01" /></svg>
                </div>
                <span>Casciz</span>
              </div>
            </div>
            <div className="hero-floating-card card1">
              <div className="label">Happy Customers</div>
              <div className="value">10,000+</div>
            </div>
            <div className="hero-floating-card card2">
              <div className="label">Case Designs</div>
              <div className="value">500+</div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-item">
          <div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg></div>
          <div><strong>Free Delivery</strong><br /><span style={{ fontSize: 12, color: 'var(--text-light)' }}>Pan-India shipping</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
          <div><strong>Premium Quality</strong><br /><span style={{ fontSize: 12, color: 'var(--text-light)' }}>Military-grade protection</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M9 12l2 2 4-4" /></svg></div>
          <div><strong>30-Day Returns</strong><br /><span style={{ fontSize: 12, color: 'var(--text-light)' }}>Hassle-free exchanges</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-icon"><svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg></div>
          <div><strong>Secure Payments</strong><br /><span style={{ fontSize: 12, color: 'var(--text-light)' }}>100% safe checkout</span></div>
        </div>
      </div>

      <section className="section" id="categories">
        <div className="section-header reveal">
          <span className="section-label">Browse</span>
          <h2>Shop by Category</h2>
          <p>Find the perfect case type for your lifestyle and phone model</p>
        </div>
        <div className="categories-grid">
          {categories.map((c, i) => (
            <Link key={c._id} to={`/shop?category=${c._id}`} className="category-tile reveal">
              <div
                className="category-tile-bg"
                style={{ background: c.image?.url ? `url(${c.image.url}) center/cover` : CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length] }}
              />
              <div className="category-tile-overlay">
                <h3>{c.name}</h3>
                <span>{c.description || 'Shop the collection'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="stats-banner">
        <div className="stats-grid">
          <div className="stat-item reveal"><h3>10K+</h3><p>Happy Customers</p></div>
          <div className="stat-item reveal"><h3>500+</h3><p>Unique Designs</p></div>
          <div className="stat-item reveal"><h3>50+</h3><p>Phone Models</p></div>
          <div className="stat-item reveal"><h3>4.8&#9733;</h3><p>Average Rating</p></div>
        </div>
      </div>

      <section className="section" style={{ background: 'linear-gradient(135deg, var(--green-50), var(--white))', maxWidth: '100%', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal">
            <span className="section-label">Save More</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', color: 'var(--text-dark)', marginBottom: 12 }}>Bundle Deals — Buy More, Save More</h2>
            <p style={{ fontSize: 16, color: 'var(--text-light)', maxWidth: 520, margin: '0 auto 32px' }}>Mix different phone models in one order. Automatic bundle discounts applied.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }} className="reveal">
            <Link to="/bundles" style={{ background: 'var(--white)', padding: 24, borderRadius: 'var(--radius)', border: '2px solid var(--green-100)', transition: 'var(--transition)', cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-600)' }}>2 Cases</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)', margin: '8px 0' }}>Best Starter Pack</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>Save up to ₹129</div>
            </Link>
            <Link to="/bundles" style={{ background: 'var(--white)', padding: 24, borderRadius: 'var(--radius)', border: '2px solid var(--green-500)', boxShadow: 'var(--shadow-md)', cursor: 'pointer', position: 'relative', display: 'block' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--green-500)', color: 'var(--white)', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>MOST POPULAR</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-600)' }}>3 Cases</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)', margin: '8px 0' }}>Best Value</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>Save up to ₹248</div>
            </Link>
            <Link to="/bundles" style={{ background: 'var(--white)', padding: 24, borderRadius: 'var(--radius)', border: '2px solid var(--green-100)', cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-600)' }}>4 Cases</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)', margin: '8px 0' }}>Maximum Savings</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>Save up to ₹397</div>
            </Link>
          </div>
          <Link to="/bundles" className="btn-primary reveal">
            View All Bundle Deals <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      <section className="section" id="products" style={{ background: 'var(--white)', maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
          <div className="section-header reveal">
            <span className="section-label">Bestsellers</span>
            <h2>Featured Products</h2>
            <p>Our most loved cases, picked by thousands of happy customers</p>
          </div>
          <div className="products-grid">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" className="btn-primary">
              View All Products <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="testimonials-section" id="reviews">
        <div className="section-header reveal" style={{ maxWidth: 1280, margin: '0 auto 48px' }}>
          <span className="section-label">Testimonials</span>
          <h2>What Our Customers Say</h2>
          <p>Real reviews from real phone case lovers</p>
        </div>
        <div className="testimonials-grid">
          {[
            { text: 'Absolutely love the quality! The case fits perfectly and the green color is even more beautiful in person. Best purchase this year!', initials: 'AP', name: 'Ananya Patel' },
            { text: "Dropped my phone twice already and not a single scratch. The grip is amazing and it doesn't feel bulky at all. Highly recommend!", initials: 'RK', name: 'Rahul Kumar' },
            { text: 'Fast delivery and the packaging was so cute! Got the custom case with my dog\'s photo and it turned out perfect. Ordering more for gifts!', initials: 'SM', name: 'Sneha Mehta' },
          ].map((t) => (
            <div className="testimonial-card reveal" key={t.name}>
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg viewBox="0 0 24 24" key={i}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <p>"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div><div className="name">{t.name}</div><div className="meta">Verified Buyer</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter" id="contact">
        <NewsletterForm />
      </section>
    </>
  );
}

function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="newsletter-inner reveal">
      <span className="section-label">Stay Updated</span>
      <h2>Get 15% Off Your First Order</h2>
      <p>Subscribe to our newsletter for exclusive drops, deals, and case inspiration delivered to your inbox.</p>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">{subscribed ? 'Subscribed!' : 'Subscribe'}</button>
      </form>
    </div>
  );
}
