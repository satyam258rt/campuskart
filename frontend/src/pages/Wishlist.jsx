import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import ResourceCard from '../components/ResourceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Wishlist = () => {
  const { wishlist, loading } = useWishlist();

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <FiHeart className="text-rose-500 fill-current" /> Saved Wishlist
        </h1>
        <p className="text-sm text-slate-500">
          Resources you bookmarked for this semester.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={FiHeart}
          title="Your wishlist is empty"
          description="Click the heart icon on any resource card to save it here for quick access later."
          actionText="Browse Marketplace"
          actionLink="/browse"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <ResourceCard key={item._id} resource={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
