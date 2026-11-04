import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports')
      .then((res) => setReports(res.data?.reports))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar mode="admin" />

      <main className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Analytics & Reports</h1>
          <p className="text-sm text-slate-500">Resource distributions and transactional metrics.</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Listings by Category</h3>
              <div className="space-y-2">
                {reports?.listingsByCategory?.map((cat) => (
                  <div key={cat.name} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {cat.count} listings
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Monthly Rental Volume</h3>
              <div className="space-y-2">
                {reports?.rentalsByMonth?.map((m) => (
                  <div key={m._id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                    <span className="font-medium text-slate-700">Month {m._id}</span>
                    <span className="font-extrabold text-emerald-600">
                      ₹{m.volume} ({m.rentalsCount} rentals)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReports;
