import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;
  if (!order) return <p className="text-center p-8">Order not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Order Receipt
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
            {order.orderId}
          </h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Handover & Delivery Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Pickup / Handover Coordinates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <FiMapPin className="text-indigo-600 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-700 block">Location:</span>
              <span className="text-slate-600">{order.pickupOrDelivery?.location}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FiPhone className="text-indigo-600 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-700 block">Contact Phone:</span>
              <span className="text-slate-600">{order.pickupOrDelivery?.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Ordered Items</h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item._id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-800 text-sm block">{item.title}</span>
                <span className="text-slate-500">
                  Type: {item.itemType} · Qty: {item.quantity} · Seller: {item.seller?.name}
                </span>
                {item.rentalDetails && (
                  <div className="text-indigo-600 font-medium">
                    Rental: {new Date(item.rentalDetails.startDate).toLocaleDateString()} to{' '}
                    {new Date(item.rentalDetails.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <span className="font-bold text-slate-900 text-sm">₹{item.itemTotal}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Items Subtotal:</span>
            <span>₹{order.pricing?.itemsTotal}</span>
          </div>
          <div className="flex justify-between text-indigo-600">
            <span>Security Deposit:</span>
            <span>₹{order.pricing?.securityDepositTotal}</span>
          </div>
          <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t">
            <span>Total Paid:</span>
            <span>₹{order.pricing?.grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/orders" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to Orders List
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
