import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiHeart,
  FiMapPin,
  FiClock,
  FiShield,
  FiStar,
  FiCheck,
  FiCalendar,
  FiAlertCircle,
  FiShoppingCart,
  FiUser
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const toast = useToast();

  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Rental Calculation States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        const [resData, reviewsData] = await Promise.all([
          api.get(`/resources/${id}`),
          api.get(`/reviews/resource/${id}`)
        ]);
        setResource(resData.data.resource);
        setReviews(reviewsData.data || []);
      } catch (err) {
        toast.error('Resource could not be loaded');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [id, navigate, toast]);

  // Check rental availability whenever dates change
  useEffect(() => {
    if (!startDate || !endDate || !resource || !['RENT', 'BOTH'].includes(resource.listingType)) {
      setAvailabilityResult(null);
      return;
    }

    const check = async () => {
      try {
        setCheckingAvailability(true);
        const res = await api.post('/rentals/check-availability', {
          resourceId: resource._id,
          startDate,
          endDate
        });
        setAvailabilityResult(res.data);
      } catch (err) {
        setAvailabilityResult({ isAvailable: false, message: err.message });
      } finally {
        setCheckingAvailability(false);
      }
    };

    check();
  }, [startDate, endDate, resource]);

  const handleAddToCartBuy = async () => {
    const success = await addToCart({
      resourceId: resource._id,
      itemType: 'BUY',
      quantity: 1
    });
    if (success) navigate('/cart');
  };

  const handleAddToCartRent = async () => {
    if (!availabilityResult?.isAvailable) {
      toast.error('Please select valid and available rental dates');
      return;
    }
    const success = await addToCart({
      resourceId: resource._id,
      itemType: 'RENT',
      quantity: 1,
      rentalDates: {
        startDate,
        endDate,
        totalDays: availabilityResult.totalDays
      }
    });
    if (success) navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        resourceId: resource._id,
        rating: newRating,
        comment: newComment
      });
      setReviews([res.data.review, ...reviews]);
      setNewComment('');
      toast.success('Thank you! Your review has been published.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;
  if (!resource) return null;

  const isOwner = user && resource.owner?._id === user._id;
  const wishlisted = isWishlisted(resource._id);

  return (
    <div className="space-y-12">
      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-slate-600">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-slate-600">Marketplace</Link>
        <span>/</span>
        <span className="text-slate-700">{resource.title}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full max-h-[480px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative flex items-center justify-center">
            <img
              src={
                resource.images?.[selectedImage]?.url ||
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'
              }
              alt={resource.title}
              className="w-full h-full object-cover object-center block max-w-full max-h-[480px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <button
              onClick={() => toggleWishlist(resource._id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition ${
                wishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-slate-700 hover:text-rose-500'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {resource.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {resource.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition relative bg-slate-100 ${
                    selectedImage === idx ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover object-center block"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Description & Specs */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Resource Description</h3>
            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
              {resource.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 font-medium">Condition</span>
                <span className="font-bold text-slate-800">{resource.condition}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 font-medium">Available Units</span>
                <span className="font-bold text-slate-800">{resource.quantity} in stock</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 font-medium">Category</span>
                <span className="font-bold text-slate-800">{resource.category?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions, Rental Calculator & Seller info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {resource.category?.name}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1 mb-2">
                {resource.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FiMapPin className="text-indigo-500" />
                <span>{resource.campus?.pickupLocation || 'Campus Meeting Point'}</span>
              </div>
            </div>

            {/* Pricing Options */}
            {['BUY', 'BOTH'].includes(resource.listingType) && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-700">Direct Purchase</span>
                  <span className="text-2xl font-extrabold text-slate-900">₹{resource.price}</span>
                </div>
                {!isOwner ? (
                  <button
                    onClick={handleAddToCartBuy}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FiShoppingCart /> Add to Cart (Buy)
                  </button>
                ) : (
                  <span className="block text-xs text-center text-slate-400 font-medium">
                    This is your listing
                  </span>
                )}
              </div>
            )}

            {/* Rental Reservation Calculator */}
            {['RENT', 'BOTH'].includes(resource.listingType) && (
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-indigo-900 block">Campus Rental</span>
                    <span className="text-xs text-slate-500">
                      Min {resource.rentalPricing?.minDurationDays || 1} day(s) · Max {resource.rentalPricing?.maxDurationDays || 30} day(s)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-indigo-600">
                      ₹{resource.rentalPricing?.pricePerDay}
                    </span>
                    <span className="text-xs text-slate-500">/day</span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  Security Deposit: <strong className="text-slate-800">₹{resource.rentalPricing?.securityDeposit}</strong> (100% refundable on return)
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      min={startDate || new Date().toISOString().slice(0, 10)}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-800"
                    />
                  </div>
                </div>

                {/* Real-time Calculation Result */}
                {checkingAvailability && (
                  <p className="text-xs text-indigo-600 font-medium animate-pulse">
                    Checking calendar availability...
                  </p>
                )}

                {availabilityResult && (
                  <div
                    className={`p-3 rounded-xl text-xs space-y-1.5 ${
                      availabilityResult.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {availabilityResult.isAvailable ? (
                      <>
                        <div className="flex justify-between font-bold">
                          <span>Duration ({availabilityResult.totalDays} days):</span>
                          <span>₹{availabilityResult.rentalFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Refundable Deposit:</span>
                          <span>+ ₹{availabilityResult.securityDeposit}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-sm border-t border-emerald-200 pt-1">
                          <span>Total Amount:</span>
                          <span>₹{availabilityResult.totalAmount}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold">
                        <FiAlertCircle />
                        <span>{availabilityResult.message || 'Already reserved for these dates.'}</span>
                      </div>
                    )}
                  </div>
                )}

                {!isOwner && (
                  <button
                    disabled={!availabilityResult?.isAvailable}
                    onClick={handleAddToCartRent}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FiCalendar /> Add Rental to Cart
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Seller / Lessor Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <img
              src={resource.owner?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
              alt={resource.owner?.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
            />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Listed by Peer
              </span>
              <h4 className="font-bold text-slate-900 text-base">{resource.owner?.name}</h4>
              <p className="text-xs text-slate-500">{resource.owner?.campus?.department || 'Student'}</p>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-500">
                <FiStar className="fill-current w-3.5 h-3.5" />
                <span>{resource.owner?.reputationScore?.toFixed(1) || '5.0'}</span>
                <span className="text-slate-400 font-normal">({resource.owner?.ratingsCount || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Student Reviews & Experience</h3>

        {/* Leave Review Form */}
        {isAuthenticated && !isOwner && (
          <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-slate-800">Completed a purchase or rental? Leave feedback:</h4>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Rating:</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            <textarea
              rows={3}
              placeholder="How was the condition and peer handover experience?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews submitted yet for this resource.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {rev.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{rev.user?.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toDateString()}</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ResourceDetails;
