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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAIL
          </span>
        );
      case 'UNCERTAIN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> UNCERTAIN
          </span>
        );
    }
  };

  const passCount = Object.values(report.checks || {}).filter(c => c.status === 'PASS').length;
  const failCount = Object.values(report.checks || {}).filter(c => c.status === 'FAIL').length;
  const uncertainCount = Object.values(report.checks || {}).filter(c => c.status === 'UNCERTAIN').length;

  return (
    <div className="space-y-5 text-xs">
      {/* Engine & Mode Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDemo 
          ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
          : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDemo ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
          }`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{report.engine_name}</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                isDemo ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-900'
              }`}>
                {isDemo ? 'Deterministic Demo Mode' : 'Live Vision Engine'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isDemo 
                ? 'Running rule-based deterministic evaluation (No GEMINI_API_KEY detected). Strict zero-guessing policy enforced.' 
                : 'Multimodal vision model inference active with PO and SKU specifications.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          <span className="text-emerald-700 bg-white/80 px-2.5 py-1 rounded border border-emerald-200">
            {passCount} Pass
          </span>
          <span className="text-rose-700 bg-white/80 px-2.5 py-1 rounded border border-rose-200">
            {failCount} Fail
          </span>
          <span className="text-amber-800 bg-white/80 px-2.5 py-1 rounded border border-amber-200">
            {uncertainCount} Uncertain
          </span>
        </div>
      </div>

      {/* Overall Verdict & Recommendation Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
            Overall AI Inspection Verdict
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold tracking-tight ${
              report.overall_verdict === 'PASS' 
                ? 'text-emerald-600' 
                : report.overall_verdict === 'FAIL' 
                ? 'text-rose-600' 
                : 'text-amber-600'
            }`}>
              {report.overall_verdict.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">{report.summary}</p>
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
            Recommended Action
          </span>
          <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
            {report.recommendation.replace(/_/g, ' ')}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Suggested receiving disposition release</p>
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
            Aggregate Confidence Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {Math.round(report.confidence_score * 100)}%
            </span>
            <span className="text-[11px] text-slate-500">across 10 dimensions</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full" 
              style={{ width: `${Math.round(report.confidence_score * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* The 10 Checks Verification Table */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Standardized 10-Check Audit Matrix (Zero-Guessing Enforced)
          </h4>
          <span className="text-[11px] text-slate-500">
            UNCERTAIN returned whenever photo evidence is insufficient
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {CHECK_DEFINITIONS.map(def => {
            const check = report.checks?.[def.key];
            if (!check) return null;

            return (
              <div key={def.key} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-xs">{def.label}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                      {def.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-500">
                      Confidence: <strong className="text-slate-800">{Math.round(check.confidence * 100)}%</strong>
                    </span>
                    {getStatusBadge(check.status)}
                  </div>
                </div>

                {/* Values comparison row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Expected Manifest Value:</span>
                    <span className="font-bold text-slate-900">{String(check.expected)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Observed Physical Finding:</span>
                    <span className={`font-semibold ${
                      check.status === 'FAIL' 
                        ? 'text-rose-700 font-bold' 
                        : check.status === 'UNCERTAIN'
                        ? 'text-amber-800'
                        : 'text-slate-900'
                    }`}>
                      {String(check.observed)}
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-slate-600 text-xs leading-relaxed">
                  {check.explanation}
                </p>

                {/* Evidence citations */}
                {check.evidence && check.evidence.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Evidence Cited:</span>
                    {check.evidence.map((ev, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhoto(ev.image)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[11px] font-mono text-slate-700 shadow-2xs hover:text-indigo-600 transition-colors"
                      >
                        <Camera className="w-3 h-3 text-slate-400" />
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
        <div className="p-2 bg-slate-900 rounded-lg text-center overflow-hidden">
          <p className="text-white text-xs font-mono mb-2">{selectedPhoto}</p>
          <img
            src={selectedPhoto?.startsWith('http') ? selectedPhoto : `/uploads/${selectedPhoto}`}
            alt="Cited evidence"
            className="max-h-[70vh] mx-auto object-contain rounded"
            onError={(e) => {
              e.target.parentElement.innerHTML = '<div class="p-8 text-white text-xs">Photo evidence visual preview</div>';
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
