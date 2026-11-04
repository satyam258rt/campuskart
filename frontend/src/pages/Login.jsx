import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiMail, FiArrowRight, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ALLOWED_CAMPUS_DOMAINS = ['mnnit.ac.in'];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validateCampusEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes('@')) return false;
    const domain = emailStr.split('@')[1].toLowerCase().trim();
    return ALLOWED_CAMPUS_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setEmailError('');

    const trimmedEmail = email.trim();
    if (!validateCampusEmail(trimmedEmail)) {
      const err = 'Access Denied: Only MNNIT student email accounts (@mnnit.ac.in) are permitted.';
      setEmailError(err);
      toast.error(err);
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(trimmedEmail, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStudentLogin = async () => {
    setEmail('satyam.2026is22@mnnit.ac.in');
    setPassword('Password123');
    setEmailError('');
    try {
      setSubmitting(true);
      const user = await login('satyam.2026is22@mnnit.ac.in', 'Password123');
      toast.success(`Signed in as ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      {/* Student Branding */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          CK
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          MNNIT Student Login
        </h1>
        <p className="text-xs text-slate-500">
          Sign in with your official <span className="font-bold text-slate-700">@mnnit.ac.in</span> student ID
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Student Email (@mnnit.ac.in)
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
                emailError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <span>{submitting ? 'Verifying Student ID...' : 'Sign In'}</span>
          <FiArrowRight />
        </button>

        {/* 1-Click Fast Student Sign-In */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleQuickStudentLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <FaGraduationCap className="text-indigo-600 w-4 h-4" />
            <span>⚡ 1-Click Sign In (Satyam - 2026IS22)</span>
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-slate-500 space-y-2">
          <div>
            New student?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Register here
            </Link>
          </div>

          {/* Separate Admin Portal Link */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
            >
              <FiShield className="text-amber-600 w-3.5 h-3.5" />
              <span>Campus Council / Admin Portal →</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
