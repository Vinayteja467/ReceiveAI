import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Camera, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Check, 
  X 
} from 'lucide-react';
import Modal from '../common/Modal';

const CHECK_DEFINITIONS = [
  { key: 'sku_identity', label: '1. SKU Identity & Barcode Verification', category: 'Identification' },
  { key: 'quantity', label: '2. Total Physical Unit Quantity', category: 'Count' },
  { key: 'carton_count', label: '3. Master Shipper Carton Count', category: 'Count' },
  { key: 'units_per_carton', label: '4. Packaging Density (Units/Carton)', category: 'Packaging' },
  { key: 'variant_color', label: '5. Product Variant & Color Matching', category: 'Specification' },
  { key: 'carton_damage', label: '6. Master Carton Structural Integrity', category: 'Condition' },
  { key: 'product_damage', label: '7. Unit Cosmetic & Surface Condition', category: 'Condition' },
  { key: 'water_damage', label: '8. Moisture Ingress & Water Stains', category: 'Condition' },
  { key: 'torn_packaging', label: '9. Strapping & Tamper Tape Seals', category: 'Packaging' },
  { key: 'missing_components', label: '10. Bill of Materials (BOM) Completeness', category: 'Specification' },
];

export default function AIInspectionAuditView({ report }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!report) return null;

  const isDemo = report.inspection_mode === 'DETERMINISTIC_DEMO_MODE';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> FAIL
          </span>
        );
      case 'UNCERTAIN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> UNCERTAIN
          </span>
        );
    }
  };

  const passCount = Object.values(report.checks || {}).filter(c => c.status === 'PASS').length;
  const failCount = Object.values(report.checks || {}).filter(c => c.status === 'FAIL').length;
  const uncertainCount = Object.values(report.checks || {}).filter(c => c.status === 'UNCERTAIN').length;

  return (
    <div className="space-y-5 text-xs text-neutral-200">
      {/* Engine & Mode Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xl ${
        isDemo 
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
          : 'bg-orange-500/10 border-orange-500/30 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
            isDemo ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-orange-500/30'
          }`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{report.engine_name}</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                isDemo ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              }`}>
                {isDemo ? 'Deterministic Demo Mode' : 'Live Vision Engine'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isDemo 
                ? 'Running rule-based deterministic evaluation (No GEMINI_API_KEY detected). Strict zero-guessing policy enforced.' 
                : 'Multimodal vision model inference active with PO and SKU specifications.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            {passCount} Pass
          </span>
          <span className="text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
            {failCount} Fail
          </span>
          <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            {uncertainCount} Uncertain
          </span>
        </div>
      </div>

      {/* Overall Verdict & Recommendation Card */}
      <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
            Overall AI Inspection Verdict
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-extrabold tracking-tight ${
              report.overall_verdict === 'PASS' 
                ? 'text-emerald-400' 
                : report.overall_verdict === 'FAIL' 
                ? 'text-rose-400' 
                : 'text-amber-400'
            }`}>
              {report.overall_verdict.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-neutral-400 text-[11px] mt-1">{report.summary}</p>
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
            Recommended Action
          </span>
          <span className="inline-block px-3 py-1 bg-white/[0.08] border border-white/[0.1] text-white rounded-lg text-xs font-bold uppercase tracking-wider">
            {report.recommendation.replace(/_/g, ' ')}
          </span>
          <p className="text-[11px] text-neutral-400 mt-1">Suggested receiving disposition release</p>
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
            Aggregate Confidence Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {Math.round(report.confidence_score * 100)}%
            </span>
            <span className="text-[11px] text-neutral-400">across 10 dimensions</span>
          </div>
          <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden mt-1.5">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full" 
              style={{ width: `${Math.round(report.confidence_score * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* The 10 Checks Verification Table */}
      <div className="border border-white/[0.08] rounded-2xl bg-[#0e0e13]/85 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            Standardized 10-Check Audit Matrix (Zero-Guessing Enforced)
          </h4>
          <span className="text-[11px] text-neutral-400">
            UNCERTAIN returned whenever photo evidence is insufficient
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {CHECK_DEFINITIONS.map(def => {
            const check = report.checks?.[def.key];
            if (!check) return null;

            return (
              <div key={def.key} className="p-4 hover:bg-white/[0.02] transition-colors space-y-2">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white text-xs">{def.label}</span>
                    <span className="text-[10px] text-neutral-400 uppercase font-medium bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded">
                      {def.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-neutral-400">
                      Confidence: <strong className="text-white">{Math.round(check.confidence * 100)}%</strong>
                    </span>
                    {getStatusBadge(check.status)}
                  </div>
                </div>

                {/* Values comparison row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Expected Manifest Value:</span>
                    <span className="font-bold text-white">{String(check.expected)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Observed Physical Finding:</span>
                    <span className={`font-semibold ${
                      check.status === 'FAIL' 
                        ? 'text-rose-400 font-bold' 
                        : check.status === 'UNCERTAIN'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {String(check.observed)}
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-neutral-300 text-xs leading-relaxed">
                  {check.explanation}
                </p>

                {/* Evidence citations */}
                {check.evidence && check.evidence.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-neutral-400 font-medium">Evidence Cited:</span>
                    {check.evidence.map((ev, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhoto(ev.image)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] hover:border-orange-500/50 hover:bg-white/[0.08] rounded-lg text-[11px] font-mono text-neutral-300 hover:text-white transition-all shadow-sm"
                      >
                        <Camera className="w-3 h-3 text-orange-400" />
                        <span>{ev.image}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="Evidence Photographic Proof"
        maxWidth="max-w-4xl"
      >
        <div className="p-3 bg-black/60 border border-white/[0.08] rounded-xl text-center overflow-hidden">
          <p className="text-white text-xs font-mono mb-2">{selectedPhoto}</p>
          <img
            src={selectedPhoto?.startsWith('http') ? selectedPhoto : `/uploads/${selectedPhoto}`}
            alt="Cited evidence"
            className="max-h-[70vh] mx-auto object-contain rounded-lg"
            onError={(e) => {
              e.target.parentElement.innerHTML = '<div class="p-8 text-neutral-300 text-xs">Photo evidence visual preview</div>';
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
