import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiArrowRight, FiKey, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const { token: urlToken } = useParams();
  const [tokenInput, setTokenInput] = useState(urlToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    const activeToken = urlToken || tokenInput.trim();
    if (!activeToken) {
      toast.error('Reset token is required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/auth/reset-password/${activeToken}`, {
        password
      });
      toast.success('Your password has been reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Password reset token is invalid or has expired');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-sm border border-indigo-100">
          <FiLock />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs text-slate-500">
          Create a strong password for your MNNIT student account.
        </p>
      </div>

      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {!urlToken && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Reset Security Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Paste your reset token..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500 focus:bg-white"
                />
                <FiKey className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
              />
              <FiLock className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
              />
              <FiLock className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{submitting ? 'Resetting Password...' : 'Save New Password & Sign In'}</span>
            <FiArrowRight />
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
            >
              <FiArrowLeft /> Back to Student Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
