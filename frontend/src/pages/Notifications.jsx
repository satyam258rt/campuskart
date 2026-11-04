import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FiBell className="text-indigo-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500">Order updates, rental reminders, and approval alerts.</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <FiCheck /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No notifications"
          description="You're all caught up! New orders and rental reminders will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkOne(n._id)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200 text-slate-600'
                  : 'bg-indigo-50/40 border-indigo-200 text-slate-900 shadow-sm font-semibold'
              }`}
            >
              <div className="flex items-start justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-0.5">{n.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
