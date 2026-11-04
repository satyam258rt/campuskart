const Wishlist = require('../models/Wishlist');
const Resource = require('../models/Resource');
const ApiError = require('../utils/apiError');

class WishlistService {
  /**
   * Get user's saved wishlist
   */
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'resources',
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'owner', select: 'name campus avatar reputationScore' }
      ]
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, resources: [] });
    }

    return wishlist;
  }

  /**
   * Toggle item in wishlist (add if missing, remove if present)
   */
  async toggleWishlist(userId, resourceId) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, resources: [] });
    }

    const index = wishlist.resources.findIndex(
      (id) => id.toString() === resourceId.toString()
    );

    let isAdded = false;
    if (index > -1) {
      wishlist.resources.splice(index, 1);
      resource.favoritesCount = Math.max(0, (resource.favoritesCount || 0) - 1);
    } else {
      wishlist.resources.push(resourceId);
      resource.favoritesCount = (resource.favoritesCount || 0) + 1;
      isAdded = true;
    }

    await Promise.all([wishlist.save(), resource.save()]);

    return {
      isAdded,
      message: isAdded ? 'Added to your wishlist' : 'Removed from your wishlist',
      resourceId
    };
  }
}

module.exports = new WishlistService();
