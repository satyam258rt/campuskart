import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [notes, setNotes] = useState('');
  const toast = useToast();

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/disputes');
      setDisputes(res.data?.disputes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedDispute || !notes.trim()) return;
    try {
      await api.put(`/admin/disputes/${selectedDispute._id}/resolve`, {
        resolutionNotes: notes
      });
      toast.success('Dispute resolved');
      setResolveModalOpen(false);
      setSelectedDispute(null);
      setNotes('');
      fetchDisputes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar mode="admin" />

      <main className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dispute & Escrow Resolution</h1>
          <p className="text-sm text-slate-500">Arbitrate order disagreements and rental deposit claims.</p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : disputes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-xs text-slate-400">No active disputes on the platform.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {disputes.map((d) => (
              <div key={d._id} className="p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {d.disputeId}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                  {d.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        setSelectedDispute(d);
                        setResolveModalOpen(true);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg"
                    >
                      Resolve
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{d.reason}</h4>
                <p className="text-slate-600">{d.description}</p>
                <div className="text-slate-400">
                  Initiated by: {d.initiator?.name} · Respondent: {d.respondent?.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Dispute"
      >
        <form onSubmit={handleResolve} className="space-y-4 text-xs">
          <p className="text-slate-600">Enter formal resolution findings and administrative notes:</p>
          <textarea
            required
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border rounded-xl"
            placeholder="e.g. Deposit refunded 50% to renter due to pre-existing scratches verified via photos."
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Resolve & Close
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDisputes;
