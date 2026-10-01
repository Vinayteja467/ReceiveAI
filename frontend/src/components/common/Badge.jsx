import React from 'react';

const BADGE_STYLES = {
  // Positive / compliant
  PASSED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  RECEIVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',

  // Review / in progress / attention
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10',
  AT_DOCK: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10',
  INSPECTING: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10',
  OCCUPIED: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/10',
  INVESTIGATING: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/10',

  // Warning / hold / exceptions
  FLAGGED: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  ACCEPTED_WITH_EXCEPTIONS: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  PARTIALLY_RECEIVED: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  SUPPLIER_NOTIFIED: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  SHORTAGE: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
  QUARANTINED: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/10',

  // Danger / critical / rejected
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300 ring-red-600/20 font-semibold',
  PHYSICAL_DAMAGE: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',

  // Neutral / default
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10',
  LOW: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/10',
  OPEN: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10',
};

export default function Badge({ status, label, size = 'sm', className = '' }) {
  const normalizedStatus = String(status || '').toUpperCase().trim();
  const style = BADGE_STYLES[normalizedStatus] || 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
  const displayLabel = label || status?.replace(/_/g, ' ') || 'Unknown';

  const sizeClasses = size === 'xs' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md uppercase tracking-wider ${sizeClasses} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current opacity-70 bg-current"></span>
      {displayLabel}
    </span>
  );
}
