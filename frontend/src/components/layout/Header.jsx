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
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-slate-800 tracking-tight">
          {getTabTitle(activeTab)}
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Warehouse DFW-04</span>
          <span>•</span>
          <span className="capitalize">{activeTab.replace(/-/g, ' ')}</span>
        </div>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-3">
        {/* CUBE Hackathon Demo Scenarios Button */}
        {onOpenDemoScenarios && (
          <button
            type="button"
            onClick={onOpenDemoScenarios}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>CUBE Demo Scenarios</span>
            <span className="bg-black/20 text-white px-1.5 py-0.2 rounded text-[10px] font-black">
              10
            </span>
          </button>
        )}

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Shift Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">Shift 1 (06:00 - 14:30)</span>
        </div>

        {/* Global Action Button */}
        {activeTab !== 'new-inspection' && (
          <button
            onClick={onNewInspection}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Inspection</span>
          </button>
        )}
      </div>
    </header>
  );
}
