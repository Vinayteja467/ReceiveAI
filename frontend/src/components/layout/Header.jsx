import React from 'react';
import { Search, Bell, PlusCircle, ShieldCheck, Clock, RefreshCw, Sparkles } from 'lucide-react';

export default function Header({ 
  activeTab, 
  onNewInspection, 
  onRefresh, 
  onOpenDemoScenarios,
  isRefreshing = false 
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Dock Overview & Receiving Analytics';
      case 'new-inspection': return 'Inbound Receiving Inspection Wizard';
      case 'inspections': return 'Inspection Records & Quality Disposition';
      case 'inspection-results': return 'Receiving Inspection Results & Evidence Viewer';
      case 'purchase-orders': return 'Inbound Purchase Orders & ASNs';
      case 'purchase-order-details': return 'Purchase Order Details & Line Items';
      case 'create-purchase-order': return 'Create Inbound Purchase Order';
      case 'products': return 'SKU Catalog & AQL Quality Specifications';
      case 'exceptions': return 'Discrepancy & Quarantine Management';
      case 'evidence': return 'Digital Receiving Proofs & Documentation';
      case 'settings': return 'Receiving Thresholds & Dock Configuration';
      default: return 'Receiving Management';
    }
  };

  return (
    <header className="h-16 bg-[#0a0a0e]/80 backdrop-blur-xl border-b border-white/[0.08] px-6 flex items-center justify-between shrink-0 z-10">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
          {getTabTitle(activeTab)}
        </h1>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="text-neutral-400">Warehouse DFW-04</span>
          <span className="text-neutral-600">•</span>
          <span className="capitalize text-orange-400 font-medium flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
            {activeTab.replace(/-/g, ' ')}
          </span>
        </div>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-3">
        {/* CUBE Hackathon Demo Scenarios Button */}
        {onOpenDemoScenarios && (
          <button
            type="button"
            onClick={onOpenDemoScenarios}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_15px_rgba(255,87,34,0.35)] transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>CUBE Demo Scenarios</span>
            <span className="bg-black/30 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
              10
            </span>
          </button>
        )}

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 text-neutral-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors border border-white/[0.08]"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        )}

        {/* Shift Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-medium">Shift 1 (06:00 - 14:30)</span>
        </div>

        {/* Global Action Button */}
        {activeTab !== 'new-inspection' && (
          <button
            onClick={onNewInspection}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_20px_rgba(255,87,34,0.4)] transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </button>
        )}
      </div>
    </header>
  );
}
