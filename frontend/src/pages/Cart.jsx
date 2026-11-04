import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiCalendar, FiArrowRight, FiShield, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FiShoppingCart}
        title="Your cart is empty"
        description="Explore approved textbooks, electronics, and rental gear available on campus."
        actionText="Browse Resources"
        actionLink="/browse"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cart & Checkout Staging
          </h1>
          <p className="text-sm text-slate-500">
            Review your purchase and rental reservations before checking out.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const res = item.resource || {};
            const isRent = item.itemType === 'RENT';

            return (
              <div
                key={item._id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={res.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                    alt={res.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRent ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isRent ? 'RENTAL' : 'PURCHASE'}
                    </span>
                    <Link
                      to={`/resources/${res._id}`}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-indigo-600 block line-clamp-1"
                    >
                      {res.title}
                    </Link>

                    {isRent ? (
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <FiCalendar className="text-indigo-600" />
                        <span>
                          {new Date(item.rentalDates?.startDate).toLocaleDateString()} -{' '}
                          {new Date(item.rentalDates?.endDate).toLocaleDateString()} (
                          {item.rentalDates?.totalDays} days)
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">Unit Price: ₹{item.unitPrice}</div>
                    )}

                    {isRent && (
                      <div className="text-[11px] text-slate-400">
                        Refundable Deposit: ₹{item.securityDeposit}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{item.itemTotal}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isRent && (
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-xs font-bold">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2.5 py-1 hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2.5 py-1 hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Order Summary</h3>

            <div className="space-y-2.5 text-sm text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">₹{cart?.subtotal || 0}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Rental Security Deposits:</span>
                <span className="font-bold">₹{cart?.totalDeposit || 0}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Campus Pickup / Handover:</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-base font-bold text-slate-900">Grand Total:</span>
              <span className="text-2xl font-extrabold text-indigo-600">
                ₹{cart?.grandTotal || 0}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <FiShield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Razorpay test payment & deposit escrow security enabled.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
