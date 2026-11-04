import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiShield, FiUser, FiRotateCcw } from 'react-icons/fi';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const RentalDetails = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/rentals/${id}`)
      .then((res) => setRental(res.data.rental))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;
  if (!rental) return <p className="text-center p-8">Rental not found</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Rental Agreement
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
            {rental.rentalId}
          </h1>
        </div>
        <StatusBadge status={rental.status} />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Resource Details</h3>
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
          <img
            src={rental.resource?.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
            alt=""
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{rental.resource?.title}</h4>
            <p className="text-xs text-slate-500">Condition: {rental.resource?.condition}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5">Start Date</span>
            <span className="font-bold text-slate-800">
              {new Date(rental.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-0.5">End Date</span>
            <span className="font-bold text-slate-800">
              {new Date(rental.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Daily Rate:</span>
            <span className="font-bold text-slate-800">₹{rental.dailyRate} / day</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Duration:</span>
            <span className="font-bold text-slate-800">{rental.totalDays} days</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Rental Fee:</span>
            <span className="font-bold text-slate-800">₹{rental.rentalFee}</span>
          </div>
          <div className="flex justify-between text-indigo-700 font-medium">
            <span>Held Security Deposit:</span>
            <span className="font-bold">₹{rental.securityDeposit}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t">
            <span>Total Escrow:</span>
            <span>₹{rental.totalAmount}</span>
          </div>
        </div>
      </div>

      {rental.settlement?.settledAt && (
        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <span className="font-bold block text-sm">Deposit Settled</span>
          <p>{rental.settlement.notes}</p>
          <p className="font-bold">Refunded: ₹{rental.settlement.refundedDeposit}</p>
        </div>
      )}

      {['ACTIVE', 'DUE', 'OVERDUE'].includes(rental.status) && (
        <div className="text-center pt-2">
          <Link
            to={`/returns/request?rentalId=${rental._id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            <FiRotateCcw /> Initiate Return Request
          </Link>
        </div>
      )}
    </div>
  );
};

export default RentalDetails;
