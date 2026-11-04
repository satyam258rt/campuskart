import React, { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiFilter } from 'react-icons/fi';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/resources?status=${statusFilter}&limit=40` : '/resources?limit=40';
      const res = await api.get(url);
      setListings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/resources/${id}/approve`);
      toast.success('Listing approved');
      fetchListings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar mode="admin" />

      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Listings Moderation</h1>
            <p className="text-sm text-slate-500">Approve, inspect, and moderate all platform items.</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Paused / Inactive</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.status} />
                        <span className="font-bold text-slate-400">{item.listingType}</span>
                      </div>
                      <span className="font-bold text-slate-800 text-sm block">{item.title}</span>
                      <span className="text-slate-400">
                        Owner: {item.owner?.name} ({item.owner?.email})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApprove(item._id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminListings;
