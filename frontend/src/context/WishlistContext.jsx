import { useEffect, useState, useCallback } from 'react';
import { getWishlistApi, toggleWishlistApi } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { WishlistContext } from './wishlist-context';

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const { wishlist } = await getWishlistApi();
      setWishlist(wishlist);
    } catch {
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = (productId) => wishlist.some((p) => p._id === productId);

  const toggle = async (productId) => {
    if (!user) return { requiresLogin: true };
    const { added } = await toggleWishlistApi(productId);
    await refresh();
    return { added };
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}
