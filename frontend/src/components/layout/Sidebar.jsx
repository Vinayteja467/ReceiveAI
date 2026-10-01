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
      badgeColor: 'bg-amber-100 text-amber-800' 
    },
    { id: 'evidence', label: 'Evidence', icon: FolderLock },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Box className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">ReceiveAI</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">RCV</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Inspection Manager</p>
          </div>
        </div>
      </div>

      {/* Facility & Shift Widget */}
      <div className="p-3 mx-3 my-3 bg-slate-50 border border-slate-200/70 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Warehouse Dock</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-800 mt-1">DFW Inbound Hub 04</p>
        <p className="text-[11px] text-slate-500">Bays 01-08 Operational</p>
      </div>

      {/* Navigation List */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Receiving Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold border border-indigo-100/80 shadow-2xs'
                  : item.highlight
                  ? 'text-slate-800 hover:bg-slate-100/80 hover:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null ? (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Inspector Profile */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            MV
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-800 truncate">Marcus Vance</p>
            <p className="text-[10px] text-slate-500 truncate">Lead QA Specialist #402</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
