import { FaInstagram } from 'react-icons/fa';

const INSTAGRAM_URL = 'https://www.instagram.com/casciz.store';
const WIDGET_ID = import.meta.env.VITE_LIGHTWIDGET_ID;

// Placeholder tiles shown until a LightWidget ID is configured, so the
// section always looks intentional (matches the site's existing gradient
// placeholder pattern for missing product photos) rather than broken.
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(145deg, #a8e6cf, #88d4ab)',
  'linear-gradient(145deg, #c5e8d5, #96c9ae)',
  'linear-gradient(145deg, #b8d8be, #7fb890)',
  'linear-gradient(145deg, #d4f0e0, #a3d9bf)',
  'linear-gradient(145deg, #dcedc1, #a5c97d)',
  'linear-gradient(145deg, #c8e6c9, #81c784)',
];

export default function InstagramFeed() {
  return (
    <section className="instagram-section">
      <div className="section-header reveal">
        <span className="section-label">@casciz.store</span>
        <h2>Follow Us on Instagram</h2>
        <p>See how customers style their cases, drops, and behind-the-scenes moments.</p>
      </div>

      {WIDGET_ID ? (
        <div className="instagram-widget-wrap reveal">
          <iframe
            title="Instagram feed"
            src={`https://lightwidget.com/widgets/${WIDGET_ID}.html`}
            scrolling="no"
            allowTransparency="true"
            className="instagram-widget-frame"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="instagram-grid reveal">
          {PLACEHOLDER_GRADIENTS.map((gradient, i) => (
            <a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-post"
              style={{ background: gradient }}
              aria-label="View on Instagram"
            >
              <span className="instagram-post-overlay">
                <FaInstagram size={22} />
              </span>
            </a>
          ))}
        </div>
      )}

      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-primary instagram-follow-btn">
        <FaInstagram size={18} />
        Follow @casciz.store
      </a>
    </section>
  );
}
