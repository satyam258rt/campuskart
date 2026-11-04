import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBook, FiArrowRight, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { FaGraduationCap, FaStore } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ALLOWED_CAMPUS_DOMAINS = ['mnnit.ac.in'];

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student' or 'vendor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    campus: {
      university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
      campusName: 'MNNIT Prayagraj',
      studentId: '',
      department: '',
      hostelOrAddress: ''
    },
    vendorDetails: {
      shopName: '',
      stallNumber: '',
      businessPhone: '',
      categorySpecialization: ['Cycles', 'Calculators', 'Other']
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

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

    const trimmedEmail = formData.email.trim();
    if (!validateCampusEmail(trimmedEmail)) {
      const err = 'Access Denied: Only MNNIT student email accounts (@mnnit.ac.in) are allowed.';
      setEmailError(err);
      toast.error(err);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name,
        email: trimmedEmail,
        password: formData.password,
        phone: formData.phone,
        role: role,
        campus: {
          ...formData.campus,
          studentId: role === 'student' ? formData.campus.studentId : `VENDOR-${Date.now().toString().slice(-4)}`
        },
        vendorDetails: role === 'vendor' ? formData.vendorDetails : undefined
      };

      await register(payload);
      toast.success('Registration successful! Welcome to CampusKart.');
      if (role === 'vendor') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3">
          <FiCheckCircle className="w-4 h-4" /> Official Campus Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Join CampusKart
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select your campus account type to buy, sell, or manage store inventory.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <FiCheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Restricted to Verified MNNIT Allahabad Students (@mnnit.ac.in)</span>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            role === 'student'
              ? 'bg-white text-indigo-600 shadow-md border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FaGraduationCap className="w-5 h-5" />
          <div className="text-left">
            <span className="block leading-tight">Student Account</span>
            <span className="block text-[10px] font-normal text-slate-400">Buy cycles, books, calc</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('vendor')}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            role === 'vendor'
              ? 'bg-white text-emerald-600 shadow-md border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FaStore className="w-5 h-5" />
          <div className="text-left">
            <span className="block leading-tight">Campus Vendor</span>
            <span className="block text-[10px] font-normal text-slate-400">Store / Stock Manager</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4 text-xs">
        {/* Basic Details */}
        <div>
          <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
            {role === 'vendor' ? 'Store Manager / Contact Name *' : 'Full Name *'}
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder={role === 'vendor' ? 'Ramesh Kumar (Store Manager)' : 'Aarav Sharma'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500"
            />
            <FiUser className="absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder={role === 'vendor' ? 'vendor@mnnit.ac.in' : 'satyam.2026is22@mnnit.ac.in'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500"
              />
              <FiMail className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500"
              />
              <FiPhone className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Min 6 characters with letters & numbers"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500"
            />
            <FiLock className="absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        {/* Dynamic Fields for Student */}
        {role === 'student' && (
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
            <span className="font-bold text-indigo-900 block text-xs">Campus Student Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Student ID / Roll No *
                </label>
                <input
                  type="text"
                  required={role === 'student'}
                  placeholder="CS2024098"
                  value={formData.campus.studentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      campus: { ...formData.campus, studentId: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Department / Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Mechanical"
                  value={formData.campus.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      campus: { ...formData.campus, department: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">
                Hostel / Delivery Address
              </label>
              <input
                type="text"
                placeholder="e.g. Hostel Block B, Room 204"
                value={formData.campus.hostelOrAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    campus: { ...formData.campus, hostelOrAddress: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              />
            </div>
          </div>
        )}

        {/* Dynamic Fields for Campus Vendor */}
        {role === 'vendor' && (
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
            <span className="font-bold text-emerald-900 block text-xs">Campus Vendor Store Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Shop / Store Name *
                </label>
                <input
                  type="text"
                  required={role === 'vendor'}
                  placeholder="e.g. Campus Wheels & Stationers"
                  value={formData.vendorDetails.shopName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vendorDetails: { ...formData.vendorDetails, shopName: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Stall / Shop Location *
                </label>
                <input
                  type="text"
                  required={role === 'vendor'}
                  placeholder="e.g. Shop 4, Student Union Complex"
                  value={formData.vendorDetails.stallNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vendorDetails: { ...formData.vendorDetails, stallNumber: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">
                Primary Product Offerings
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Bicycles', 'Calculators', 'Books', 'Stationery'].map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold"
                  >
                    ✓ {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
            role === 'vendor'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          <span>{submitting ? 'Creating Account...' : `Register as ${role === 'vendor' ? 'Campus Vendor' : 'Student'}`}</span>
          <FiArrowRight />
        </button>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
