import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiPackage, FiClock, FiCheckCircle, FiPlusCircle } from 'react-icons/fi';
import { FaStore, FaBicycle, FaCalculator, FaBook } from 'react-icons/fa';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SellerDashboard = () => {
  const { user, isVendor } = useAuth();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [inspectionData, setInspectionData] = useState({
    itemCondition: 'GOOD',
    damageDescription: '',
    damageFee: 0
  });
  const toast = useToast();

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [ordRes, retRes] = await Promise.all([
        api.get('/orders/seller-orders'),
        api.get('/returns/lessor-returns')
      ]);
      setOrders(ordRes.data || []);
      setReturns(retRes.data?.returns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    try {
      // 1. Inspect
      await api.put(`/returns/${selectedReturn._id}/inspect`, inspectionData);
      // 2. Settle
      await api.post(`/returns/${selectedReturn._id}/settle`);
      toast.success('Inspection recorded, deposit settled, and resource is active again!');
      setInspectModalOpen(false);
      setSelectedReturn(null);
      fetchSellerData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  const totalEarnings = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.pricing?.itemsTotal || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header with Vendor / Seller Identification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <FaStore className="w-3.5 h-3.5" />
              {isVendor ? 'Campus Certified Vendor Hub' : 'Student Seller Portal'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {user?.vendorDetails?.shopName || 'Vendor & Merchant Dashboard'}
          </h1>
          <p className="text-sm text-slate-500">
            {user?.vendorDetails?.stallNumber
              ? `Location: ${user.vendorDetails.stallNumber} • Campus Storefront`
              : 'Manage received peer orders, rental returns, inventory, and settlements.'}
          </p>
        </div>

        <Link
          to="/create-listing"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-200 transition flex items-center gap-2 self-start md:self-auto"
        >
          <FiPlusCircle className="w-4 h-4" />
          <span>List Product / Stock</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            ₹
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Earned from Sales
            </span>
            <span className="text-2xl font-extrabold text-slate-900">₹{totalEarnings}</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            <FiPackage />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Orders Received
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{orders.length}</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            <FiClock />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Return Inspections
            </span>
            <span className="text-2xl font-extrabold text-slate-900">
              {returns.filter((r) => r.status === 'PENDING_INSPECTION').length}
            </span>
          </div>
        </div>
      </div>

      {/* Return Inspections Section */}
      {returns.length > 0 && (
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Rental Returns Awaiting Inspection</h3>
          <div className="divide-y divide-slate-100">
            {returns.map((ret) => (
              <div
                key={ret._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ret.returnId}
                    </span>
                    <StatusBadge status={ret.status} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm block">
                    {ret.resource?.title}
                  </span>
                  <span className="text-slate-500">
                    Renter: {ret.renter?.name} ({ret.renter?.phone}) · Held Deposit: ₹{ret.depositOriginal}
                  </span>
                </div>

                {ret.status === 'PENDING_INSPECTION' ? (
                  <button
                    onClick={() => {
                      setSelectedReturn(ret);
                      setInspectModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
                  >
                    Inspect & Settle
                  </button>
                ) : (
                  <span className="font-semibold text-emerald-600">Settled (₹{ret.refundAmount} refunded)</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Orders Received Section */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Orders Received from Students</h3>
        {orders.length === 0 ? (
          <p className="text-xs text-slate-400">No orders received yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ord.orderId}
                    </span>
                    <StatusBadge status={ord.orderStatus} />
                    <StatusBadge status={ord.paymentStatus} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm block">
                    Buyer: {ord.buyer?.name} ({ord.buyer?.campus?.department})
                  </span>
                  <span className="text-slate-500">
                    Pickup Spot: {ord.pickupOrDelivery?.location} · Phone: {ord.pickupOrDelivery?.contactPhone}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 block">
                    ₹{ord.pricing?.grandTotal}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Inspect Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title="Lessor Return Inspection & Settlement"
      >
        <form onSubmit={handleInspectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Returned Item Condition *</label>
            <select
              value={inspectionData.itemCondition}
              onChange={(e) =>
                setInspectionData({ ...inspectionData, itemCondition: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border rounded-xl"
            >
              <option value="EXCELLENT">Excellent (Flawless)</option>
              <option value="GOOD">Good (Normal wear)</option>
              <option value="FAIR">Fair</option>
              <option value="DAMAGED">Damaged (Needs repair deduction)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Damage Fee (₹ Deduction if any)</label>
            <input
              type="number"
              min="0"
              value={inspectionData.damageFee}
              onChange={(e) =>
                setInspectionData({ ...inspectionData, damageFee: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Inspection Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Returned with original charger. Everything working."
              value={inspectionData.damageDescription}
              onChange={(e) =>
                setInspectionData({ ...inspectionData, damageDescription: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setInspectModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Confirm & Release Deposit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerDashboard;
