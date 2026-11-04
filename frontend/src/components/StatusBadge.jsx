import React from 'react';

const statusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SETTLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_INSPECTION: 'bg-amber-50 text-amber-700 border-amber-200',
  RESERVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  RETURN_REQUESTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',

  DUE: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',

  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',

  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  SOLD: 'bg-purple-50 text-purple-700 border-purple-200',
  RENTED: 'bg-cyan-50 text-cyan-700 border-cyan-200'
};

const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();
  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = (status || '').replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
