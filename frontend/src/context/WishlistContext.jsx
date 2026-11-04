import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist.resources || []);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (resourceId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist');
      return false;
    }
    try {
      const res = await api.post(`/wishlist/toggle/${resourceId}`);
      toast.info(res.data.message);
      await fetchWishlist();
      return res.data.isAdded;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const isWishlisted = (resourceId) => {
    return wishlist.some((r) => (r._id || r) === resourceId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isWishlisted,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
