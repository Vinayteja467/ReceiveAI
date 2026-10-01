import React from 'react';
import {
  LayoutDashboard,
  ClipboardPlus,
  ClipboardList,
  Truck,
  Boxes,
  AlertTriangle,
  FolderLock,
  Settings2,
  Box,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, openExceptionsCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-inspection', label: 'New Inspection', icon: ClipboardPlus, highlight: true },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: Truck },
    { id: 'products', label: 'Products', icon: Boxes },
    { 
      id: 'exceptions', 
      label: 'Exceptions', 
      icon: AlertTriangle, 
      badge: openExceptionsCount > 0 ? openExceptionsCount : null,
    },
    { id: 'evidence', label: 'Evidence', icon: FolderLock },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <aside className="w-64 bg-[#070709]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col h-screen select-none shrink-0 z-20">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-red-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,87,34,0.45)]">
            <Box className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-base">ReceiveAI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">RCV</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">Inspection Manager</p>
          </div>
        </div>
      </div>

      {/* Facility & Shift Widget */}
      <div className="p-3 mx-3 my-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Warehouse Dock</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span> Live
          </span>
        </div>
        <p className="text-xs font-bold text-white mt-1">DFW Inbound Hub 04</p>
        <p className="text-[11px] text-neutral-400">Bays 01-08 Operational</p>
      </div>

      {/* Navigation List */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Receiving Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent text-white font-bold border-l-2 border-orange-500 shadow-[inset_0_0_15px_rgba(255,87,34,0.12)]'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]' : 'text-neutral-500 group-hover:text-neutral-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                  {item.badge}
                </span>
              ) : (
                isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Inspector Profile */}
      <div className="p-3 border-t border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/[0.1] text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
            MV
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Marcus Vance</p>
            <p className="text-[10px] text-neutral-400 truncate">Lead QA Specialist #402</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
