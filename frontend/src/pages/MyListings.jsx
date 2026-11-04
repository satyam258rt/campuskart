import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiPlay, FiPause, FiEye } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const toast = useToast();

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources/user/my-listings?limit=50');
      setListings(res.data || []);
    } catch (err) {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleTogglePause = async (id) => {
    try {
      const res = await api.patch(`/resources/${id}/toggle-pause`);
      toast.success(res.message || 'Status updated');
      fetchMyListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    try {
      await api.delete(`/resources/${selectedListing._id}`);
      toast.success('Listing deleted successfully');
      setDeleteModalOpen(false);
      setSelectedListing(null);
      fetchMyListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = listings.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Resource Listings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your items available for sale or rent on campus.
          </p>
        </div>
        <Link
          to="/create-listing"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
        >
          <FiPlus /> Create New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Items' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'PENDING_APPROVAL', label: 'Pending Approval' },
          { key: 'INACTIVE', label: 'Paused' },
          { key: 'REJECTED', label: 'Rejected' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings table / cards */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No listings in this category"
          description="You don't have any resources matching this status tab."
          actionText="Create Listing"
          actionLink="/create-listing"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={item.status} />
                      <span className="text-[11px] font-bold text-slate-400">
                        {item.listingType}
                      </span>
                    </div>
                    <Link
                      to={`/resources/${item._id}`}
                      className="font-bold text-slate-800 text-sm sm:text-base hover:text-indigo-600"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>
                        {item.listingType === 'BUY'
                          ? `₹${item.price}`
                          : item.listingType === 'RENT'
                          ? `₹${item.rentalPricing?.pricePerDay}/day`
                          : `₹${item.price} / ₹${item.rentalPricing?.pricePerDay}d`}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <FiEye className="w-3.5 h-3.5" /> {item.viewsCount || 0} views
                      </span>
                    </div>

                    {item.status === 'REJECTED' && item.moderation?.rejectionReason && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">
                        Admin Note: {item.moderation.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {['ACTIVE', 'INACTIVE'].includes(item.status) && (
                    <button
                      onClick={() => handleTogglePause(item._id)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                      title={item.status === 'ACTIVE' ? 'Pause Listing' : 'Resume Listing'}
                    >
                      {item.status === 'ACTIVE' ? (
                        <FiPause className="w-4 h-4" />
                      ) : (
                        <FiPlay className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  )}

                  <Link
                    to={`/edit-listing/${item._id}`}
                    className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit Listing"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setSelectedListing(item);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Listing"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>"{selectedListing?.title}"</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
            >
              Delete Listing
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyListings;
