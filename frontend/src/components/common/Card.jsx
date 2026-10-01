import React from 'react';

export default function Card({ children, title, subtitle, action, className = '', noPadding = false }) {
  return (
    <div className={`bg-[#0d0d11]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200 hover:border-white/[0.14] ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <div>
            {title && <h3 className="font-extrabold text-white text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}
