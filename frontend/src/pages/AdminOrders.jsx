import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar mode="admin" />

      <main className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Orders</h1>
          <p className="text-sm text-slate-500">Inspect peer purchases, Razorpay transaction IDs, and delivery states.</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-800">{o.orderId}</td>
                      <td className="p-4 font-medium text-slate-700">{o.buyer?.name}</td>
                      <td className="p-4"><StatusBadge status={o.orderStatus} /></td>
                      <td className="p-4"><StatusBadge status={o.paymentStatus} /></td>
                      <td className="p-4 font-bold text-slate-900">₹{o.pricing?.grandTotal}</td>
                      <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
