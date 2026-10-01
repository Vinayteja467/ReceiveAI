import React from 'react';

const BADGE_STYLES = {
  // Positive / compliant
  PASSED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  RECEIVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',

  // Review / in progress / attention
  IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
  AT_DOCK: 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.15)]',
  INSPECTING: 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.15)]',
  OCCUPIED: 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_8px_rgba(14,165,233,0.15)]',
  INVESTIGATING: 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_8px_rgba(14,165,233,0.15)]',

  // Warning / hold / exceptions
  FLAGGED: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  PENDING_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  ACCEPTED_WITH_EXCEPTIONS: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  PARTIALLY_RECEIVED: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  SUPPLIER_NOTIFIED: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  SHORTAGE: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  QUARANTINED: 'bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]',

  // Danger / critical / rejected
  REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
  FAILED: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
  HIGH: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)] font-bold',
  PHYSICAL_DAMAGE: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',

  // Neutral / default
  PENDING: 'bg-white/[0.05] text-neutral-300 border-white/[0.1]',
  LOW: 'bg-white/[0.05] text-neutral-400 border-white/[0.1]',
  OPEN: 'bg-white/[0.05] text-neutral-300 border-white/[0.1]',
};

export default function Badge({ status, label, size = 'sm', className = '' }) {
  const normalizedStatus = String(status || '').toUpperCase().trim();
  const style = BADGE_STYLES[normalizedStatus] || 'bg-white/[0.05] text-neutral-300 border-white/[0.1]';
  const displayLabel = label || status?.replace(/_/g, ' ') || 'Unknown';

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold border rounded-full uppercase tracking-wider ${sizeClasses} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current opacity-80 bg-current"></span>
      {displayLabel}
    </span>
  );
}
