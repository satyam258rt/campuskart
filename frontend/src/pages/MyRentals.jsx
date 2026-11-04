import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiArrowRight, FiRotateCcw } from 'react-icons/fi';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rentals/my-rentals')
      .then((res) => setRentals(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Active & Past Rentals
        </h1>
        <p className="text-sm text-slate-500">
          Monitor your borrowed campus resources, return deadlines, and deposit refunds.
        </p>
      </div>

      {rentals.length === 0 ? (
        <EmptyState
          icon={FiClock}
          title="No rentals found"
          description="You haven't reserved or rented any resources yet."
          actionText="Browse Rental Gear"
          actionLink="/browse?listingType=RENT"
        />
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => {
            const isDueOrOverdue = ['DUE', 'OVERDUE'].includes(rental.status);
            const canReturn = ['ACTIVE', 'DUE', 'OVERDUE'].includes(rental.status);

            return (
              <div
                key={rental._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={rental.resource?.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                    alt={rental.resource?.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {rental.rentalId}
                      </span>
                      <StatusBadge status={rental.status} />
                    </div>

                    <Link
                      to={`/rentals/${rental._id}`}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-indigo-600 block line-clamp-1"
                    >
                      {rental.resource?.title}
                    </Link>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <FiCalendar className="text-indigo-600" />
                      <span>
                        {new Date(rental.startDate).toLocaleDateString()} to{' '}
                        {new Date(rental.endDate).toLocaleDateString()} ({rental.totalDays} days)
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Lessor: <strong className="text-slate-700">{rental.owner?.name}</strong> · Held Deposit: ₹{rental.securityDeposit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {canReturn && (
                    <Link
                      to={`/returns/request?rentalId=${rental._id}`}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <FiRotateCcw /> Request Return
                    </Link>
                  )}

                  <Link
                    to={`/rentals/${rental._id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <span>Details</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
