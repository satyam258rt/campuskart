import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowRight, FiCheckCircle, FiAlertTriangle, FiKey, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ALLOWED_CAMPUS_DOMAINS = ['mnnit.ac.in'];

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const validateCampusEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes('@')) return false;
    const domain = emailStr.split('@')[1].toLowerCase().trim();
    return ALLOWED_CAMPUS_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setResetToken('');

    const trimmedEmail = email.trim();
    if (!validateCampusEmail(trimmedEmail)) {
      const err = 'Please enter an official MNNIT student email address (@mnnit.ac.in).';
      setEmailError(err);
      toast.error(err);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/forgot-password', { email: trimmedEmail });
      setSuccess(true);
      toast.success('Password reset instructions generated!');
      // In development/test mode, the server returns the reset token or preview
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process password reset request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-sm border border-indigo-100">
          <FiKey />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-xs text-slate-500">
          Enter your <span className="font-bold text-slate-700">@mnnit.ac.in</span> email to reset your credentials.
        </p>
      </div>

      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        {success ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reset Request Sent</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched.
              </p>
            </div>

            {/* Direct 1-Click Reset Helper for Campus Development */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-left space-y-2">
              <span className="text-[11px] font-bold text-indigo-900 uppercase block">
                ⚡ Campus Quick Reset
              </span>
              <p className="text-xs text-indigo-700">
                You can proceed directly to create your new password:
              </p>
              <Link
                to={resetToken ? `/reset-password/${resetToken}` : `/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <span>Set New Password Now</span>
                <FiArrowRight />
              </Link>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
              >
                <FiArrowLeft /> Return to Student Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                MNNIT Student Email (@mnnit.ac.in)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="satyam.2026is22@mnnit.ac.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition ${
                    emailError
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                  }`}
                />
                <FiMail className="absolute left-3.5 top-3 text-slate-400" />
              </div>
              {emailError && (
                <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <FiAlertTriangle className="shrink-0" /> {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Generating Reset Link...' : 'Send Password Reset Link'}</span>
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
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
