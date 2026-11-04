import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiPackage,
  FiCopy,
  FiCheck,
  FiMapPin,
  FiCreditCard,
  FiShield
} from 'react-icons/fi';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');
  const method = searchParams.get('method') || 'ONLINE';
  const amount = searchParams.get('amount');
  const location = searchParams.get('location');

  const [copied, setCopied] = useState(false);
  const isSuccess = status === 'success';

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const methodLabels = {
    UPI: 'Instant UPI (GPay/PhonePe)',
    CARD: 'Credit / Debit Card',
    COD: 'Cash on Handover (Pay at Hostel)',
    RAZORPAY: 'Razorpay Gateway'
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
      <div
        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}
      >
        {isSuccess ? <FiCheckCircle className="w-10 h-10" /> : <FiAlertCircle className="w-10 h-10" />}
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          {isSuccess
            ? method === 'COD'
              ? 'Order Placed Successfully!'
              : 'Payment Successful!'
            : 'Payment Failed'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isSuccess
            ? method === 'COD'
              ? 'Your reservation is confirmed. Pay the student seller upon inspection.'
              : 'Payment verified and cryptographic receipt generated.'
            : 'The transaction could not be completed.'}
        </p>
      </div>

      {orderId && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-400 font-medium">Order Reference:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
              <span>{orderId}</span>
              <button
                type="button"
                onClick={copyOrderId}
                className="text-slate-400 hover:text-indigo-600 ml-1 p-0.5"
                title="Copy Order ID"
              >
                {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
              </button>
            </div>
          </div>

          {amount && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Amount:</span>
              <span className="font-extrabold text-indigo-700 text-sm">₹{amount}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Payment Mode:</span>
            <span className="font-bold text-slate-800">{methodLabels[method] || method}</span>
          </div>

          {location && (
            <div className="flex justify-between items-start pt-1 text-[11px]">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <FiMapPin className="text-indigo-600" /> Handover Spot:
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                {decodeURIComponent(location)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2.5 pt-2">
        <Link
          to="/orders"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
        >
          <FiPackage /> View My Orders
        </Link>
        <Link
          to="/browse"
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
        >
          Continue Browsing
        </Link>
      </div>

      <div className="pt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
        <FiShield className="text-emerald-500" />
        <span>Campus Escrow & MNNIT Student Welfare Protection</span>
      </div>
    </div>
  );
};

export default PaymentResult;
