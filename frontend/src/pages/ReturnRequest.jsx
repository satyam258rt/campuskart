import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiRotateCcw, FiInfo } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ReturnRequest = () => {
  const [searchParams] = useSearchParams();
  const rentalId = searchParams.get('rentalId');
  const navigate = useNavigate();
  const toast = useToast();

  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rentalId) {
      toast.error('Rental ID is missing');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/returns/request', {
        rentalId,
        expectedReturnDate,
        notes
      });
      toast.success('Return request submitted to the lessor!');
      navigate('/my-rentals');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <FiRotateCcw className="text-indigo-600" /> Request Resource Return
        </h1>
        <p className="text-sm text-slate-500">
          Coordinate returning the borrowed item to the peer lessor for inspection.
        </p>
      </div>

      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-start gap-3">
        <FiInfo className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <span>
          Once the lessor completes the physical condition check, your security deposit will be automatically settled and released to your account.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Handover Return Date *
          </label>
          <input
            type="date"
            required
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Handover Note & Meeting Coordinates
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Can meet near college library entrance after 3:30 PM."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnRequest;
