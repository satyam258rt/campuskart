import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiShield, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);

      if (!user.roles?.includes('admin')) {
        setErrorMsg('Access Denied: This portal is strictly reserved for verified MNNIT administrators and council moderators.');
        toast.error('Access Denied: Admin credentials required.');
        return;
      }

      toast.success(`Welcome to Admin Control Panel, ${user.name}`);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify admin credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('admin@mnnit.ac.in');
    setPassword('AdminPassword123');
    setErrorMsg('');
    try {
      setSubmitting(true);
      const user = await login('admin@mnnit.ac.in', 'AdminPassword123');
      toast.success(`Signed in as ${user.name}`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Admin Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <FiShield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            CampusKart Admin Gateway
          </h1>
          <p className="text-xs text-slate-500">
            MNNIT Student Welfare Council & Moderation Portal
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <FiShield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Restricted Portal: Authorized MNNIT staff & council administrators only.</span>
        </div>

        {/* Admin Login Form */}
        <form onSubmit={handleAdminSubmit} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <FiAlertTriangle className="shrink-0 w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Admin Email (@mnnit.ac.in)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@mnnit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-800 focus:bg-white"
              />
              <FiMail className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-800 focus:bg-white"
              />
              <FiLock className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Authenticating Admin...' : 'Sign In as Administrator'}</span>
            <FiArrowRight />
          </button>

          {/* 1-Click Fast Admin Sign-In */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <FiShield className="text-amber-600" />
              <span>⚡ 1-Click Sign In (admin@mnnit.ac.in)</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-indigo-600 font-semibold hover:underline">
              ← Return to Student Login Portal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
