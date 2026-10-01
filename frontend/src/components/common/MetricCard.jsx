import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({ label, value, change, isPositive, description, icon: Icon }) {
  return (
    <div className="bg-[#0d0d11]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-white/[0.04] text-orange-400 border border-white/[0.08] shadow-inner group-hover:scale-105 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-orange-300 transition-colors">{value}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/[0.06] text-xs">
        {change && (
          <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-[11px] ${
            isPositive 
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
              : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
        <span className="text-neutral-400 truncate">{description}</span>
      </div>
    </div>
  );
}
