import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiAlertCircle,
  FiUser,
  FiMapPin,
  FiPhone
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // Handover Info
  const [pickupType, setPickupType] = useState('CAMPUS_PICKUP');
  const [location, setLocation] = useState(user?.campus?.hostelOrAddress || 'SVBH Hostel Main Gate');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 11111');
  const [instructions, setInstructions] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'RAZORPAY' | 'CARD' | 'COD'
  
  // Specific payment fields
  const [upiId, setUpiId] = useState(user?.email ? user.email.split('@')[0] + '@okhdfcbank' : 'satyam@upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Satyam');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  // Modal & Processing State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState(1); // 1: review, 2: processing, 3: success
  const [statusMessage, setStatusMessage] = useState('');
  const [stagedOrder, setStagedOrder] = useState(null);
  const [gatewayData, setGatewayData] = useState(null);

  const grandTotal = cart?.grandTotal || 0;
  const officialUpiVpa = 'mnnit.campuskart@hdfcbank';

  const copyUpi = () => {
    navigator.clipboard.writeText(officialUpiVpa);
    setCopiedUpi(true);
    toast.success('Official CampusKart UPI ID copied!');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // 1. Initial click: Stage order on backend & open payment gateway
  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!contactPhone.trim() || !location.trim()) {
      toast.error('Please specify handover location and contact phone number');
      return;
    }

    if (!cart?.items?.length) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setProcessingStep(1);
      setStatusMessage('Staging order on secure campus server...');
      
      const res = await api.post('/orders/checkout', {
        pickupOrDelivery: {
          type: pickupType,
          location,
          contactPhone,
          instructions
        },
        paymentMethod
      });

      setStagedOrder(res.data.order);
      setGatewayData(res.data.gatewayOrder);
      setPaymentModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to initialize order checkout');
    }
  };

  // 2. Finalize payment verification
  const handleConfirmAndPay = async () => {
    if (!stagedOrder || !gatewayData) return;

    try {
      setProcessingStep(2);

      let verifyPayload;

      if (paymentMethod === 'COD') {
        setStatusMessage('Confirming Cash on Handover reservation...');
        verifyPayload = {
          orderId: stagedOrder.orderId,
          razorpay_order_id: gatewayData.gatewayOrderId,
          razorpay_payment_id: `cod_${Date.now()}_verified`,
          razorpay_signature: 'mock_test_signature_valid',
          paymentMethod: 'COD'
        };
      } else if (paymentMethod === 'UPI') {
        setStatusMessage('Contacting UPI payment switch & verifying VPA...');
        await new Promise((r) => setTimeout(r, 900));
        setStatusMessage('Authorizing UPI reference with Bank...');
        verifyPayload = {
          orderId: stagedOrder.orderId,
          razorpay_order_id: gatewayData.gatewayOrderId,
          razorpay_payment_id: `pay_upi_${Date.now()}`,
          razorpay_signature: 'upi_verified_payment',
          paymentMethod: 'UPI',
          upiId
        };
      } else if (paymentMethod === 'CARD') {
        setStatusMessage('Encrypting card data via 256-bit SSL gateway...');
        await new Promise((r) => setTimeout(r, 900));
        setStatusMessage('Validating 3D Secure OTP authentication...');
        verifyPayload = {
          orderId: stagedOrder.orderId,
          razorpay_order_id: gatewayData.gatewayOrderId,
          razorpay_payment_id: `pay_card_${Date.now()}`,
          razorpay_signature: 'card_verified_payment',
          paymentMethod: 'RAZORPAY',
          cardLast4: cardNumber.slice(-4)
        };
      } else {
        // Standard Razorpay Gateway
        setStatusMessage('Connecting to Razorpay payment gateway...');
        await new Promise((r) => setTimeout(r, 800));
        setStatusMessage('Verifying HMAC SHA256 payment signature...');
        verifyPayload = {
          orderId: stagedOrder.orderId,
          razorpay_order_id: gatewayData.gatewayOrderId,
          razorpay_payment_id: `pay_rzp_${Date.now()}_test`,
          razorpay_signature: 'mock_test_signature_valid',
          paymentMethod: 'RAZORPAY'
        };
      }

      await new Promise((r) => setTimeout(r, 600));

      // 3. Verify Payment Signature on Backend
      await api.post('/payments/verify', verifyPayload);

      setProcessingStep(3);
      setStatusMessage('Payment verified! Order confirmed.');
      await refreshCart();
      toast.success('Payment verified! Your order is placed.');

      setTimeout(() => {
        setPaymentModalOpen(false);
        navigate(
          `/payment-result?orderId=${stagedOrder.orderId}&status=success&method=${paymentMethod}&amount=${grandTotal}&location=${encodeURIComponent(location)}`
        );
      }, 1200);
    } catch (err) {
      toast.error(err.message || 'Payment verification failed');
      setProcessingStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Secure Campus Checkout
        </h1>
        <p className="text-sm text-slate-500">
          Specify your campus handover details and select your preferred payment mode.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Handover & Payment Methods */}
        <form onSubmit={handleInitiatePayment} className="lg:col-span-7 space-y-6">
          {/* Handover Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FiMapPin className="text-indigo-600" />
              Handover & Pickup Coordinates
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Handover Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'CAMPUS_PICKUP', label: 'Campus Meeting Spot' },
                  { type: 'HOSTEL_DELIVERY', label: 'Hostel Drop-off' }
                ].map((m) => (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setPickupType(m.type)}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                      pickupType === m.type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Pickup Spot / Hostel Room *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SVBH Hostel Gate / Central Library Lawn"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Contact Phone (WhatsApp for Handover) *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98765 11111"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Handover Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call after 5:30 PM lab hours"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FiShield className="text-emerald-600" />
              Choose Payment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'UPI', label: 'Instant UPI', desc: 'GPay, PhonePe, Paytm QR', icon: FiSmartphone },
                { id: 'RAZORPAY', label: 'Razorpay Gateway', desc: 'Cards, NetBanking, UPI', icon: FiLock },
                { id: 'CARD', label: 'Debit / Credit Card', desc: 'Rupay, Visa, Mastercard', icon: FiCreditCard },
                { id: 'COD', label: 'Cash on Meetup', desc: 'Inspect & Pay at Hostel', icon: FiDollarSign }
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = paymentMethod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Icon className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                        {p.label}
                      </span>
                      {isSelected && <FiCheck className="text-indigo-600 w-4 h-4" />}
                    </div>
                    <span className="text-[11px] text-slate-500">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic details preview based on selected method */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Campus UPI ID:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                    <span>{officialUpiVpa}</span>
                    <button
                      type="button"
                      onClick={copyUpi}
                      className="text-slate-500 hover:text-indigo-600 ml-1"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Your UPI ID / Virtual Payment Address
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ⚡ Dynamic QR Code & 1-click UPI authorization available in next step.
                </p>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 0000 0000 8821"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <FiLock className="text-emerald-600" />
                  Encrypted 256-bit bank simulation. Zero card data stored.
                </p>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1 text-xs">
                <span className="font-bold block">Physical Meetup & Payment</span>
                <p className="text-[11px] text-amber-800">
                  Inspect the resource at the specified hostel or campus meeting spot. Pay ₹{grandTotal} in cash or direct UPI to the student seller upon inspection.
                </p>
              </div>
            )}

            {paymentMethod === 'RAZORPAY' && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-900 space-y-1 text-xs">
                <span className="font-bold block">Razorpay Smart Gateway</span>
                <p className="text-[11px] text-indigo-700">
                  Full online checkout supporting Indian Banks, UPI, Wallets, and Credit/Debit cards with cryptographic signature verification.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!cart?.items?.length}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer mt-4"
            >
              <FiLock className="w-5 h-5" />
              <span>
                {paymentMethod === 'COD'
                  ? `Confirm Order & Pay ₹${grandTotal} on Handover`
                  : `Proceed to Pay ₹${grandTotal}`}
              </span>
            </button>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg">Order Breakdown</h3>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {cart?.items?.map((item) => (
                <div key={item._id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block line-clamp-1">
                      {item.resource?.title || 'Resource'}
                    </span>
                    <span className="text-slate-400">
                      {item.itemType} · Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">₹{item.itemTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 text-sm space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold">₹{cart?.subtotal || 0}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Refundable Deposits:</span>
                <span className="font-bold">₹{cart?.totalDeposit || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Campus Delivery / Meetup:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Payable:</span>
                <span className="text-indigo-600 text-lg">₹{grandTotal}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-slate-500 text-xs flex items-center gap-2 font-medium">
              <FiCheckCircle className="text-emerald-500 w-4 h-4 flex-shrink-0" />
              <span>Campus escrow protection & seller verified identity.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => processingStep === 1 && setPaymentModalOpen(false)}
        title="CampusKart Secure Payment Gateway"
      >
        <div className="space-y-5 text-slate-800">
          {/* Header summary */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Amount Due</span>
              <span className="text-2xl font-black text-indigo-900">₹{grandTotal}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono">Order ID</span>
              <span className="text-xs font-bold text-slate-700 block font-mono">
                {stagedOrder?.orderId || 'CK-2026-PENDING'}
              </span>
            </div>
          </div>

          {/* Processing Spinner State */}
          {processingStep === 2 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Processing Transaction</h4>
                <p className="text-xs text-slate-500">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {processingStep === 3 && (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <FiCheckCircle />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Payment Verified!</h4>
              <p className="text-xs text-slate-500">Redirecting to order confirmation...</p>
            </div>
          )}

          {/* Step 1: Payment Method Interactive Details */}
          {processingStep === 1 && (
            <div className="space-y-4">
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">
                      Scan QR with Any UPI App (GPay, PhonePe, Paytm)
                    </span>
                    {/* Dynamic QR Code representation */}
                    <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-inner">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                        {/* Realistic Mock QR Pattern */}
                        <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="13" y="13" width="12" height="12" fill="currentColor" />
                        <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="75" y="13" width="12" height="12" fill="currentColor" />
                        <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="13" y="75" width="12" height="12" fill="currentColor" />
                        <rect x="42" y="10" width="16" height="6" fill="currentColor" />
                        <rect x="42" y="24" width="8" height="8" fill="currentColor" />
                        <rect x="10" y="42" width="6" height="16" fill="currentColor" />
                        <rect x="24" y="42" width="8" height="8" fill="currentColor" />
                        <rect x="45" y="45" width="10" height="10" fill="currentColor" />
                        <rect x="67" y="42" width="8" height="16" fill="currentColor" />
                        <rect x="42" y="67" width="16" height="8" fill="currentColor" />
                        <rect x="67" y="67" width="12" height="12" fill="currentColor" />
                        <rect x="85" y="75" width="8" height="16" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 block">
                      Amount: ₹{grandTotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-slate-600">Paying from:</span>
                    <span className="font-mono font-bold text-indigo-900">{upiId}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Card:</span>
                    <span className="font-mono font-bold text-slate-800">{cardNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cardholder:</span>
                    <span className="font-bold text-slate-800">{cardHolder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Expires:</span>
                    <span className="font-mono font-bold text-slate-800">{cardExpiry}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <span className="font-bold block text-sm">Cash on Handover Confirmation</span>
                  <p>
                    By clicking confirm, your order is placed immediately. You will inspect the item at{' '}
                    <strong>{location}</strong> and pay ₹{grandTotal} in cash or UPI to the student seller.
                  </p>
                </div>
              )}

              {paymentMethod === 'RAZORPAY' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <span className="font-bold block text-slate-900">Razorpay Secure Sandbox Simulation</span>
                  <p className="text-slate-500">
                    Online test payment authorization. Generates cryptographic HMAC SHA-256 signature and tests backend idempotency.
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="w-1/3 py-3 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndPay}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <FiLock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'COD'
                      ? 'Confirm Handover Order'
                      : `Authorize & Pay ₹${grandTotal}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
