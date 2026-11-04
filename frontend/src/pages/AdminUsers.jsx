import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiShield, FiUserX, FiUserCheck } from 'react-icons/fi';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}&limit=30`);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      toast.success(`User status changed to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar mode="admin" />

      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">User Governance</h1>
            <p className="text-sm text-slate-500">Manage verified campus students and account states.</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 w-64"
            />
            <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Student ID / Dept</th>
                    <th className="p-4">Roles</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-700 block">
                          {u.campus?.studentId || 'N/A'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{u.campus?.department || 'Student'}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {u.roles?.map((r) => {
                            if (r === 'admin' || r === 'super_admin') {
                              return (
                                <span key={r} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  🛡️ {r}
                                </span>
                              );
                            }
                            if (r === 'vendor' || r === 'seller') {
                              return (
                                <span key={r} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                  🏪 {r}
                                </span>
                              );
                            }
                            return (
                              <span key={r} className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                                🎓 {r}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            u.status === 'suspended'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
