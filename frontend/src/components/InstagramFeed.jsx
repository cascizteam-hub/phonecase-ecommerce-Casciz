import { useCallback, useEffect, useState } from 'react';
import { FaInstagram, FaPlay } from 'react-icons/fa';
import { getInstagramFeedApi } from '../api/instagram';

const INSTAGRAM_URL = 'https://www.instagram.com/casciz.store';
// Poll periodically so newly published posts (and a freshly-configured
// feed) show up automatically, without requiring a page reload.
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function InstagramFeed() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'loaded'
  const [posts, setPosts] = useState([]);

  const fetchFeed = useCallback((background = false) => {
    if (!background) setStatus('loading');
    getInstagramFeedApi()
      .then((data) => {
        const nextPosts = data.posts || [];
        setPosts(nextPosts);
        setStatus(nextPosts.length > 0 ? 'loaded' : 'error');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    fetchFeed();

    const interval = setInterval(() => fetchFeed(true), REFRESH_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchFeed(true);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchFeed]);

  return (
    <section className="instagram-section">
      <div className="section-header reveal">
        <span className="section-label">@casciz.store</span>
        <h2>Follow Us on Instagram</h2>
        <p>See how customers style their cases, drops, and behind-the-scenes moments.</p>
      </div>

      {status === 'loading' && (
        <div className="instagram-grid reveal" aria-busy="true" aria-label="Loading Instagram posts">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="instagram-post instagram-post-skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="instagram-error reveal">
          <p>Couldn't load the latest posts right now.</p>
          <button type="button" className="btn-secondary" onClick={() => fetchFeed()}>
            Retry
          </button>
        </div>
      )}

      {status === 'loaded' && (
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
              {post.mediaType === 'VIDEO' && (
                <span className="instagram-post-video-icon">
                  <FaPlay size={14} />
                </span>
              )}
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
