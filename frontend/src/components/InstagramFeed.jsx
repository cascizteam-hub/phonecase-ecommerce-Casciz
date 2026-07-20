import { useEffect, useState } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { getInstagramFeedApi } from '../api/instagram';

const INSTAGRAM_URL = 'https://www.instagram.com/casciz.store';

// Shown while loading, and as a graceful fallback if the Instagram Graph
// API isn't configured yet or a request fails, so the section always
// looks intentional rather than broken.
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(145deg, #2a0a10, #181818)',
  'linear-gradient(145deg, #330d15, #181818)',
  'linear-gradient(145deg, #240810, #181818)',
  'linear-gradient(145deg, #3d0e18, #181818)',
  'linear-gradient(145deg, #2e0b12, #181818)',
  'linear-gradient(145deg, #360c16, #181818)',
];

export default function InstagramFeed() {
  const [posts, setPosts] = useState(null); // null = loading, [] = no posts available

  useEffect(() => {
    let cancelled = false;
    getInstagramFeedApi()
      .then((data) => {
        if (!cancelled) setPosts(data.posts || []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showRealPosts = posts && posts.length > 0;

  return (
    <section className="instagram-section">
      <div className="section-header reveal">
        <span className="section-label">@casciz.store</span>
        <h2>Follow Us on Instagram</h2>
        <p>See how customers style their cases, drops, and behind-the-scenes moments.</p>
      </div>

      {showRealPosts ? (
        <div className="instagram-grid reveal">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-post"
              aria-label={post.caption ? post.caption.slice(0, 100) : 'View post on Instagram'}
            >
              <img src={post.imageUrl} alt={post.caption ? post.caption.slice(0, 140) : 'Instagram post'} loading="lazy" />
              <span className="instagram-post-overlay">
                <FaInstagram size={22} />
              </span>
            </a>
          ))}
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
