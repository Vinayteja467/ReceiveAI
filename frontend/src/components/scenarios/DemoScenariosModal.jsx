import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Camera, 
  ArrowRight, 
  Layers, 
  ShieldAlert, 
  Bot, 
  AlertTriangle,
  Play,
  FileText,
  Boxes,
  Eye,
  Check
} from 'lucide-react';
import Modal from '../common/Modal';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';

export default function DemoScenariosModal({ 
  isOpen, 
  onClose, 
  onSelectScenarioForResults,
  onSelectScenarioForWizard 
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filterTabs = [
    { id: 'ALL', label: 'All Scenarios', count: 10 },
    { id: 'COMPLIANT', label: 'Compliant', count: 1 },
    { id: 'DISCREPANCY', label: 'Discrepancies', count: 4 },
    { id: 'DAMAGE', label: 'Defects & Damage', count: 3 },
    { id: 'ZERO_GUESSING', label: 'Zero-Guessing Benchmark', count: 1 },
  ];

  const filtered = DEMO_SCENARIOS.filter(s => {
    if (activeFilter === 'ALL') return true;
    return s.tag === activeFilter;
  });

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ACCEPTED
          </span>
        );
      case 'EXCEPTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> EXCEPTION
          </span>
        );
      case 'UNCERTAIN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> UNCERTAIN
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CUBE Buildathon — RCV Receiving Inspection Demo Scenarios"
      subtitle="Select any scenario to demonstrate automated AI receiving evaluation, discrepancy detection, and strict zero-guessing enforcement"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5 text-xs text-neutral-200">
        {/* Banner with Hackathon Context */}
        <div className="p-3.5 bg-gradient-to-r from-orange-950/40 via-neutral-900 to-black rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-orange-500/20 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">10 Prescribed Test Scenarios</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[10px] rounded-lg uppercase tracking-wider">
                  Judge Demonstration Mode
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Every scenario pairs PO parameters + product BOM + actual warehouse photographs with zero simulated claims.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Strict Protocol</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">PASS / FAIL / UNCERTAIN</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-neutral-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[58vh] overflow-y-auto pr-1">
          {filtered.map(sc => {
            const isAmbiguous = sc.id === 'scenario-10';

            return (
              <div
                key={sc.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 bg-[#0e0e13]/85 backdrop-blur-xl shadow-lg ${
                  isAmbiguous 
                    ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-amber-500/[0.05]' 
                    : 'border-white/[0.08] hover:border-orange-500/40'
                }`}
              >
                {/* Header: Title & Decision Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.1] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {sc.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-white tracking-tight">
                        {sc.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                        <span className="font-mono font-bold text-orange-400">{sc.po.po_number}</span>
                        <span>•</span>
                        <span className="font-mono text-neutral-300">{sc.product.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getDecisionBadge(sc.overallDecision)}
                  </div>
                </div>

                {/* Scenario Summary */}
                <p className="text-neutral-300 text-xs leading-relaxed line-clamp-2">
                  {sc.summary}
                </p>

                {/* Ambiguous Evidence Special Zero-Guessing Banner */}
                {isAmbiguous && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] font-semibold space-y-1">
                    <div className="flex items-center gap-1 text-amber-300 font-bold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Zero-Guessing Benchmark:</span>
                    </div>
                    <p className="italic">
                      &ldquo;Insufficient visual evidence to determine the shipment quantity.&rdquo;
                    </p>
                    <p className="text-[10px] text-amber-300/80 not-italic">
                      System prohibits forcing PASS/FAIL and enables <strong>[Upload More Evidence]</strong>.
                    </p>
                  </div>
                )}

                {/* Thumbnail strip */}
                <div className="flex items-center gap-1.5 pt-1">
                  {sc.evidencePhotos.slice(0, 4).map((p, idx) => (
                    <div
                      key={p.id || idx}
                      title={p.caption}
                      className="w-12 h-10 rounded-lg border border-white/[0.08] overflow-hidden shrink-0 bg-black/40"
                    >
                      <img src={p.file_path} alt={p.file_name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <span className="text-[10px] text-neutral-400 font-semibold pl-1">
                    {sc.evidencePhotos.length} photo{sc.evidencePhotos.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectScenarioForWizard) onSelectScenarioForWizard(sc);
                      onClose();
                    }}
                    className="px-3 py-1.5 border border-white/[0.1] hover:bg-white/[0.06] text-neutral-300 hover:text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all"
                  >
                    <span>Stage in Wizard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectScenarioForResults) onSelectScenarioForResults(sc);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(255,87,34,0.3)] inline-flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run & View Results</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
