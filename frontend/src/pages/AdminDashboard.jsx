import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBox,
  FiShoppingBag,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const toast = useToast();

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/resources?status=PENDING_APPROVAL&limit=10')
      ]);
      setStats(statsRes.data);
      setPendingListings(listRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/resources/${id}/approve`);
      toast.success('Listing approved and published to marketplace');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve listing');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedListing || !rejectionReason.trim()) return;
    try {
      await api.put(`/resources/${selectedListing._id}/reject`, {
        reason: rejectionReason
      });
      toast.info('Listing rejected with feedback');
      setRejectModalOpen(false);
      setSelectedListing(null);
      setRejectionReason('');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject listing');
    }
  };

  const handleResetDatabase = async () => {
    try {
      setResetting(true);
      await api.post('/admin/reset-database');
      toast.success('Database completely wiped! 0 products, ready for new entries.');
      setResetModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to reset database');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  const metricCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: FiBox, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: FiClock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Rentals', value: stats?.activeRentals || 0, icon: FiClock, color: 'text-purple-600 bg-purple-50' },
    { label: 'Overdue Rentals', value: stats?.overdueRentals || 0, icon: FiAlertCircle, color: 'text-rose-600 bg-rose-50' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar mode="admin" />

      <main className="flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Admin Governance & Moderation
            </h1>
            <p className="text-sm text-slate-500">
              Real-time platform metrics, listing approvals, and database control.
            </p>
          </div>
          <button
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-sm w-fit"
            title="Wipe test data and reset to 0 products"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear / Reset Database
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metricCards.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${m.color}`}>
                  <Icon />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">{m.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Approvals Queue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">
              Pending Listing Approvals ({pendingListings.length})
            </h3>
            <Link to="/admin/listings" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Listings
            </Link>
          </div>

          {pendingListings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No pending approvals at the moment.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingListings.map((item) => (
                <div
                  key={item._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150'}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        By {item.sellerId?.name || 'Student'} • ₹{item.pricing?.sellingPrice || item.pricing?.rentPerDay || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedListing(item);
                        setRejectModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                    >
                      <FiX className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Listing with Reason"
      >
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Specify why <strong>"{selectedListing?.title}"</strong> is being rejected so the student can rectify it:
          </p>
          <textarea
            required
            rows={3}
            placeholder="e.g. Photo resolution is too low or resource is missing ISBN / details."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Database Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => !resetting && setResetModalOpen(false)}
        title="Confirm Full Database Reset"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <strong>Warning:</strong> This will delete all listings, uploads, orders, rentals, reviews, and carts. The marketplace will start completely clean with <strong>0 products</strong>.
          </div>
          <p className="text-slate-600">
            Base categories (<strong>Cycles</strong>, <strong>Calculators</strong>, <strong>Other</strong>) and default MNNIT accounts (Student, Admin, Vendor) will remain intact so you can start adding new entries immediately.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={resetting}
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetDatabase}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5"
            >
              {resetting ? (
                <>
                  <FiRefreshCw className="animate-spin w-3.5 h-3.5" />
                  Resetting...
                </>
              ) : (
                <>
                  <FiTrash2 className="w-3.5 h-3.5" />
                  Yes, Wipe & Reset Database
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
