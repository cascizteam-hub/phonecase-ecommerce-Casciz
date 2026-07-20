import asyncHandler from 'express-async-handler';

const GRAPH_API_VERSION = 'v21.0';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — well under Graph API rate limits

let cache = { posts: null, fetchedAt: 0 };

const fetchPostsFromGraphApi = async () => {
  const { IG_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID } = process.env;
  if (!IG_ACCESS_TOKEN || !IG_BUSINESS_ACCOUNT_ID) {
    throw new Error('Instagram Graph API is not configured');
  }

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${IG_BUSINESS_ACCOUNT_ID}/media?fields=${fields}&limit=6&access_token=${IG_ACCESS_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Instagram Graph API request failed');
  }

  return (data.data || []).map((post) => ({
    id: post.id,
    caption: post.caption || '',
    mediaType: post.media_type,
    imageUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
    permalink: post.permalink,
    timestamp: post.timestamp,
  }));
};

export const getInstagramFeed = asyncHandler(async (req, res) => {
  const isFresh = cache.posts && Date.now() - cache.fetchedAt < CACHE_TTL_MS;

  if (isFresh) {
    res.status(200).json({ posts: cache.posts, cached: true });
    return;
  }

  try {
    const posts = await fetchPostsFromGraphApi();
    cache = { posts, fetchedAt: Date.now() };
    res.status(200).json({ posts, cached: false });
  } catch (err) {
    // Serve stale cache over an error if we have anything at all
    if (cache.posts) {
      res.status(200).json({ posts: cache.posts, cached: true, stale: true });
      return;
    }
    res.status(200).json({ posts: [], error: err.message });
  }
});
