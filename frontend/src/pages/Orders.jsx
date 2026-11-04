import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCalendar, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Campus Orders
        </h1>
        <p className="text-sm text-slate-500">
          Track purchases, handover progress, and order receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No orders yet"
          description="You haven't purchased or rented any resources yet this semester."
          actionText="Browse Marketplace"
          actionLink="/browse"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-200 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    {order.orderId}
                  </span>
                  <StatusBadge status={order.orderStatus} />
                  <StatusBadge status={order.paymentStatus} />
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <FiCalendar /> Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>

                <div className="text-xs text-slate-600 font-medium">
                  {order.items?.length} item(s):{' '}
                  <span className="text-slate-900 font-bold">
                    {order.items?.map((i) => i.title).join(', ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Grand Total</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ₹{order.pricing?.grandTotal}
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <span>Details</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
