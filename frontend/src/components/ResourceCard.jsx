import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiArrowRight, FiShield, FiClock } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';

const ResourceCard = ({ resource }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(resource._id);

  const coverImage =
    resource.images?.find((img) => img.isCover)?.url ||
    resource.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const conditionLabels = {
    NEW: 'Brand New',
    LIKE_NEW: 'Like New (Mint)',
    GOOD: 'Good Condition',
    FAIR: 'Fair / Functional',
    POOR: 'Used'
  };

  const conditionColors = {
    NEW: 'bg-emerald-500 text-white',
    LIKE_NEW: 'bg-teal-500 text-white',
    GOOD: 'bg-blue-500 text-white',
    FAIR: 'bg-amber-500 text-white',
    POOR: 'bg-slate-600 text-white'
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Thumbnail area (HostelBucket-inspired) */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-t-3xl">
        <Link to={`/resources/${resource._id}`} className="block w-full h-full overflow-hidden">
          <img
            src={coverImage}
            alt={resource.title}
            className="w-full h-full object-cover object-center block max-w-full group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </Link>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-sm ${
              resource.listingType === 'RENT'
                ? 'bg-indigo-600 text-white'
                : resource.listingType === 'BOTH'
                ? 'bg-purple-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {resource.listingType === 'BOTH'
              ? 'Buy / Rent'
              : resource.listingType === 'RENT'
              ? 'For Rent'
              : 'For Sale'}
          </span>
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(resource._id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
            wishlisted
              ? 'bg-rose-500 text-white hover:bg-rose-600 scale-110'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <FiHeart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Floating Condition Tag */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm ${
              conditionColors[resource.condition] || 'bg-slate-700 text-white'
            }`}
          >
            {conditionLabels[resource.condition] || resource.condition}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Category & Verified tag */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-extrabold text-indigo-600 uppercase tracking-wider">
              {resource.category?.name || 'Item'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
              <FiShield className="w-2.5 h-2.5" /> MNNIT Verified
            </span>
          </div>

          <Link to={`/resources/${resource._id}`}>
            <h4 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {resource.title}
            </h4>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Pricing & Hostel Handover Location (HostelBucket-inspired) */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              {resource.listingType === 'BUY' && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900">
                    ₹{resource.price?.toLocaleString('en-IN') || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Buy outright</span>
                </div>
              )}

              {resource.listingType === 'RENT' && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-indigo-600">
                    ₹{resource.rentalPricing?.pricePerDay || 0}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/day</span>
                  <span className="text-[10px] text-slate-400">
                    (₹{resource.rentalPricing?.securityDeposit || 0} dep)
                  </span>
                </div>
              )}

              {resource.listingType === 'BOTH' && (
                <div>
                  <span className="text-lg font-black text-slate-900">
                    ₹{resource.price?.toLocaleString('en-IN') || 0}
                  </span>
                  <span className="text-xs text-indigo-600 font-bold ml-1.5">
                    or ₹{resource.rentalPricing?.pricePerDay}/day
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hostel Handover Location */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]" title={resource.campus?.pickupLocation}>
              <FiMapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-medium truncate text-[11px]">
                {resource.campus?.pickupLocation || 'MNNIT Campus'}
              </span>
            </div>

            <Link
              to={`/resources/${resource._id}`}
              className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 shrink-0"
            >
              <span>View</span>
              <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
