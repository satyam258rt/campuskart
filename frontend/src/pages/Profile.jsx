import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiPhone,
  FiBook,
  FiLock,
  FiShield,
  FiEdit2,
  FiCheck,
  FiX,
  FiMapPin,
  FiMail,
  FiStar,
  FiCamera,
  FiSave
} from 'react-icons/fi';
import { FaGraduationCap, FaStore } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);

  // Profile fields state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [hostel, setHostel] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Sync state whenever user object loads or updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setDepartment(user.campus?.department || '');
      setHostel(user.campus?.hostelOrAddress || '');
      setAvatarUrl(user.avatar?.url || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name,
        phone,
        bio,
        avatar: avatarUrl ? { url: avatarUrl } : undefined,
        campus: {
          department,
          hostelOrAddress: hostel
        }
      });
      toast.success('Your profile details have been saved successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setDepartment(user.campus?.department || '');
      setHostel(user.campus?.hostelOrAddress || '');
      setAvatarUrl(user.avatar?.url || '');
    }
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPass(true);
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            MNNIT Student Profile
          </h1>
          <p className="text-xs text-slate-500">
            View and edit your verified campus identity, hostel location, and credentials.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition w-fit cursor-pointer"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            <span>Edit Profile Details</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition w-fit"
          >
            <FiX className="w-3.5 h-3.5" />
            <span>Cancel Editing</span>
          </button>
        )}
      </div>

      {/* Main Profile Card (View or Edit Mode) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 p-6 flex justify-between items-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur-md">
            <FaGraduationCap className="text-indigo-200" />
            <span>MNNIT Allahabad Verified Student</span>
          </span>
          <span className="text-[11px] font-mono text-indigo-100 bg-black/20 px-2.5 py-1 rounded-lg">
            Roll No: {user?.campus?.studentId || '2026IS22'}
          </span>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white bg-slate-100 shadow-lg">
                <img
                  src={avatarUrl || user?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                  alt={name || user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5 pb-1">
                <h2 className="text-xl font-extrabold text-slate-900">{name || user?.name || 'Student'}</h2>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <FiStar className="fill-amber-400 text-amber-400 w-3.5 h-3.5" />
                <span>Score: {user?.reputationScore?.toFixed(1) || '5.0'}</span>
              </span>
            </div>
          </div>

          {/* VIEW MODE */}
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Department / Branch
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {department || user?.campus?.department || 'Information Security / CSE'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Hostel & Room Address
                  </span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <FiMapPin className="text-indigo-600" />
                    {hostel || user?.campus?.hostelOrAddress || 'SVBH Hostel, MNNIT Campus'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    WhatsApp / Handover Phone
                  </span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <FiPhone className="text-emerald-600" />
                    {phone || user?.phone || '+91 98765 11111'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Student ID / Enrollment
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-800">
                    {user?.campus?.studentId || '2026IS22'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  About Me / Campus Bio
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {bio || user?.bio || 'Active MNNIT student trader on CampusKart. Available for hostel handovers at SVBH.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile Information</span>
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleProfileSubmit} className="space-y-5 pt-2">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
                <span>✏️ <strong>Editing Profile:</strong> Update your details below and click Save.</span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-indigo-700 hover:underline"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Student Email (Official @mnnit.ac.in)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm cursor-not-allowed"
                    title="Student email domain cannot be changed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 11111"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Hostel & Room Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SVBH Hostel Room 204"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Information Security / CSE"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://... avatar image link"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Campus Bio / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Introduce yourself to fellow MNNIT students..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FiSave className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <form onSubmit={handlePasswordSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <FiLock className="text-indigo-600" /> Change Account Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changingPass}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
