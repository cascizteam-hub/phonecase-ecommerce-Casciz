import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

const BUNDLE_PRICING = {
  'Metal Case': { 1: 349, 2: 569, 3: 799, 4: 999 },
  'Glass Case': { 1: 399, 2: 599, 3: 859, 4: 1159 },
};

const getBundlePrice = (caseType, qty) => BUNDLE_PRICING[caseType][qty];
const getRegularPrice = (caseType, qty) => (caseType === 'Metal Case' ? 349 : 399) * qty;
const getSavings = (caseType, qty) => getRegularPrice(caseType, qty) - getBundlePrice(caseType, qty);

const BADGES = { 2: 'BEST STARTER', 3: 'BEST VALUE', 4: 'MAX SAVINGS' };
const TITLES = { 2: (t, q) => `${q} ${t}s`, 3: (t, q) => `${q} ${t}s`, 4: (t, q) => `${q} ${t}s — Family Pack` };
const DESCRIPTIONS = {
  2: 'Perfect starter bundle. Mix 2 different phone models.',
  3: 'Our most popular choice. Best value for money.',
  4: 'Maximum savings. Get cases for the whole family.',
};

function BundleCard({ caseType, qty, featured }) {
  const price = getBundlePrice(caseType, qty);
  const regularPrice = getRegularPrice(caseType, qty);
  const savings = getSavings(caseType, qty);
  const gradient = caseType === 'Metal Case' ? '#a8e6cf, #88d4ab' : '#c5e8d5, #96c9ae';

  return (
    <Link to="/shop" className={`bundle-card${featured ? ' featured' : ''}`}>
      <div className="bundle-badge">{BADGES[qty]}</div>
      <div className="bundle-image">
        <div className="bundle-image-bg" style={{ background: `linear-gradient(135deg, ${gradient})` }} />
      </div>
      <div className="bundle-content">
        <div className="bundle-savings">SAVE ₹{savings}</div>
        <div className="bundle-title">{TITLES[qty](caseType, qty)}</div>
        <div className="bundle-description">{DESCRIPTIONS[qty]}</div>
        <div className="bundle-price">
          <span className="current">₹{price}</span>
          <span className="original">₹{regularPrice}</span>
        </div>
        <ul className="bundle-features">
          <li>{qty} Premium {caseType}s</li>
          <li>Mix Different Phone Models</li>
          <li>Free Delivery</li>
          <li>30-Day Returns</li>
        </ul>
        <span className="bundle-cta">Shop This Bundle</span>
      </div>
    </Link>
  );
}

export default function Bundles() {
  useScrollReveal([]);

  return (
    <>
      <div className="bundle-hero">
        <h1>Bundle Deals — Save More, Get More</h1>
        <p>Mix different phone models in one order. Automatic bundle discounts applied. No coupon needed.</p>
      </div>

      <div className="bundle-section-title">
        <h2>Metal Case Bundles</h2>
        <p>Premium metal finish with maximum protection</p>
      </div>
      <div className="bundle-grid">
        <BundleCard caseType="Metal Case" qty={2} />
        <BundleCard caseType="Metal Case" qty={3} featured />
        <BundleCard caseType="Metal Case" qty={4} />
      </div>

      <div className="bundle-section-title">
        <h2>Glass Case Bundles</h2>
        <p>Crystal clear with premium glass back</p>
      </div>
      <div className="bundle-grid">
        <BundleCard caseType="Glass Case" qty={2} />
        <BundleCard caseType="Glass Case" qty={3} featured />
        <BundleCard caseType="Glass Case" qty={4} />
      </div>
    </>
  );
}
